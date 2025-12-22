"use client"

import { useState, useEffect, useMemo } from "react"
import { useQueries } from "@tanstack/react-query"
import type { Order } from "@/features/orders/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusPill } from "@/components/status-pill"
import {
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useEvents } from "@/features/events/hooks/useEvents"
import { useOrders } from "@/features/orders/hooks/useOrders"
import { eventsService } from "@/features/events/services/events.service"

export default function VentasDashboard() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <VentasContent />
    </ProtectedRoute>
  )
}

function VentasContent() {
  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("desc")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data: events = [] } = useEvents()

  const { data: orders = [], refetch: refetchOrders } = useOrders(selectedEventId)

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id)
    }
  }, [events, selectedEventId])

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedEventId) {
        refetchOrders()
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedEventId, refetchOrders])

  // Filtrar y ordenar órdenes
  const filteredOrders = useMemo(() => {
    let result = [...orders]

    // Filtrar por número de orden
    if (searchTerm.trim()) {
      result = result.filter((order) => {
        const orderNumberStr = order.orderNumber?.toString() || ""
        return orderNumberStr.includes(searchTerm.trim())
      })
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status.name === statusFilter)
    }

    // Ordenar por total
    result.sort((a, b) => {
      const amountA = Number(a.totalAmount)
      const amountB = Number(b.totalAmount)
      return sortOrder === "desc" ? amountB - amountA : amountA - amountB
    })

    return result
  }, [orders, searchTerm, statusFilter, sortOrder])

  // Calcular métricas (usando TODAS las órdenes, sin filtros)
  const metrics = useMemo(() => {
    const totalSales = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    const totalOrders = orders.length
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0

    const paymentMethodBreakdown = orders.reduce(
      (acc, order) => {
        const method = order.paymentMethod || "unknown"
        acc[method] = (acc[method] || 0) + Number(order.totalAmount)
        return acc
      },
      {} as Record<string, number>,
    )

    const cashierBreakdown = orders.reduce(
      (acc, order) => {
        const cashier = order.createdBy?.userName || "Sin asignar"
        acc[cashier] = (acc[cashier] || 0) + Number(order.totalAmount)
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalSales,
      totalOrders,
      averageTicket,
      paymentMethodBreakdown,
      cashierBreakdown,
    }
  }, [orders])

  // Obtener estadísticas de todos los eventos
  const eventStatsQueries = useQueries({
    queries: events.map((event) => ({
      queryKey: ['eventStats', event.id],
      queryFn: () => eventsService.getStats(event.id),
      enabled: events.length > 0,
      staleTime: 5 * 60 * 1000, // 5 minutos
    })),
  })

  // Comparación entre eventos con datos reales
  const eventComparison = useMemo(() => {
    return events.map((event, index) => {
      const statsQuery = eventStatsQueries[index]
      const stats = statsQuery?.data

      // Obtener el producto más vendido
      const topProduct = stats?.products?.topSelling?.[0]?.product || "N/A"

      return {
        eventId: event.id,
        eventName: event.name,
        totalSales: stats?.summary?.netRevenue || 0,
        totalOrders: stats?.summary?.totalOrders || 0,
        topProduct,
        isLoading: statsQuery?.isLoading || false,
      }
    })
  }, [events, eventStatsQueries])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value)
  }

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getPaymentMethodLabel = (method?: string) => {
    const labels: Record<string, string> = {
      EFECTIVO: "Efectivo",
      TRANSFERENCIA: "Transferencia",
      cash: "Efectivo",
      card: "Tarjeta",
      transfer: "Transferencia",
      qr: "QR",
    }
    return labels[method || ""] || method || "Efectivo"
  }

  // Normalizar estado
  const normalizeStatus = (status: string): "pending" | "in_progress" | "completed" | "delivered" => {
    const statusMap: Record<string, "pending" | "in_progress" | "completed" | "delivered"> = {
      PENDING: "pending",
      IN_PROGRESS: "in_progress",
      COMPLETED: "completed",
      CANCELLED: "delivered", // Mapping cancelled to something visible or handling differently
      pending: "pending",
      in_progress: "in_progress",
      completed: "completed",
    }
    return statusMap[status] || "pending"
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Ventas</h1>
            <p className="text-white/60">Gestión y análisis de ventas por evento</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-[280px] border-white/20 bg-white/10 text-white backdrop-blur-sm">
                <SelectValue placeholder="Seleccionar evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={`event-select-${event.id}`} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="backdrop-blur-xl bg-gradient-to-br from-black to-gray-700/50 border border-gray-500/30 hover:border-gray-500/50 transition-all shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">Ventas Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalSales)}</div>
              <p className="text-xs text-white/60">Total acumulado</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-[#1E2C6D]/30 to-[#1E2C6D]/10 border border-[#1E2C6D]/50 hover:border-[#1E2C6D]/70 transition-all shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Órdenes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metrics.totalOrders}</div>
              <p className="text-xs text-muted-foreground">En este evento</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-gradient-to-br from-sky-500/20 to-sky-500/5 border border-sky-500/30 hover:border-sky-500/5 transition-all shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.averageTicket)}</div>
              <p className="text-xs text-muted-foreground">Por orden</p>
            </CardContent>
          </Card>
          <Card className={`backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 hover:border-green-500/50 transition-all shadow-xl`}>            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clientes</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metrics.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Transacciones</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-white/20 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Buscar por N° de orden */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <Input
                  placeholder="Buscar por N° de orden..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 pl-10"
                />
              </div>

              {/* Filtrar por estado */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full border-white/20 bg-white/10 text-white md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Preparación</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              {/* Ordenar por total */}
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full border-white/20 bg-white/10 text-white md:w-[200px]">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Ordenar por total" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Mayor a menor</SelectItem>
                  <SelectItem value="asc">Menor a mayor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de ventas */}
        <Card className="border-white/20 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Listado de Ventas</CardTitle>
            <CardDescription className="text-white/60">Detalle completo de todas las órdenes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/20 hover:bg-transparent">
                    <TableHead className="text-white/70">N° Orden</TableHead>
                    <TableHead className="text-white/70">Total</TableHead>
                    <TableHead className="text-white/70">Usuario</TableHead>
                    <TableHead className="text-white/70">Estado</TableHead>
                    <TableHead className="text-white/70">Fecha</TableHead>
                    <TableHead className="text-white/70">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-white/50">
                        No se encontraron ventas
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      return (
                        <TableRow key={`order-row-${order.id}`} className="border-b border-white/5 hover:bg-white/5">
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="link"
                                  className="p-0 font-mono text-white hover:text-blue-100"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  {order.orderNumber || order.id.slice(0, 8)}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl bg-black/95 text-white border-white/20">
                                <DialogHeader>
                                  <DialogTitle className="text-white">
                                    Detalle de Orden {order.orderNumber || order.id.slice(0, 8)}
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-white/60">Método de Pago</p>
                                        <p className="font-semibold text-white">
                                          {getPaymentMethodLabel(order.paymentMethod)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-white/60">Caja</p>
                                        <p className="font-semibold text-white">{selectedOrder.createdBy?.userName || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-white/60">Estado</p>
                                        <StatusPill status={normalizeStatus(selectedOrder.status.name)} />
                                      </div>
                                      <div>
                                        <p className="text-sm text-white/60">Fecha</p>
                                        <p className="font-semibold text-white">
                                          {formatDateOnly(selectedOrder.createdAt)}
                                        </p>
                                      </div>
                                    </div>
                                    {selectedOrder.observations && (
                                      <div>
                                        <p className="text-sm text-white/60">Observaciones</p>
                                        <p className="font-semibold text-white">
                                          {selectedOrder.observations}
                                        </p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="mb-2 text-sm font-semibold text-white/70">Productos</p>
                                      <div className="space-y-2">
                                        {selectedOrder.items.map((item, idx) => {
                                          return (
                                            <div
                                              key={`order-detail-item-${item.id}-${idx}`}
                                              className="flex items-center justify-between rounded-lg border border-white/10 bg-gradient-blue p-3"
                                            >
                                              <div>
                                                <p className="font-medium text-white">{item.product.name}</p>
                                                <p className="text-sm text-white/60">Cantidad: {Math.floor(item.qty)}</p>
                                              </div>
                                              <p className="font-bold text-white">
                                                {formatCurrency(item.unitPrice * item.qty)}
                                              </p>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/20 pt-4">
                                      <p className="text-lg font-semibold text-white">Total</p>
                                      <p className="text-2xl font-bold text-white">
                                        {formatCurrency(selectedOrder.totalAmount)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell className="font-bold text-blue-200">{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell className="text-sm text-white/70">{order.createdBy?.userName || "N/A"}</TableCell>
                          <TableCell>
                            <StatusPill status={normalizeStatus(order.status.name)} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-white/60">
                              <Calendar className="h-3 w-3" />
                              {formatDateOnly(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  Ver Detalle
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl bg-black/95 text-white border-white/20">
                                <DialogHeader>
                                  <DialogTitle className="text-white">
                                    Detalle de Orden - N° {order.orderNumber || order.id.slice(0, 8)}
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm text-white/60">Método de Pago</p>
                                        <p className="font-semibold text-white">
                                          {getPaymentMethodLabel(order.paymentMethod)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-white/60">Caja</p>
                                        <p className="font-semibold text-white">{selectedOrder.createdBy?.userName || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-white/60">Estado</p>
                                        <StatusPill status={normalizeStatus(selectedOrder.status.name)} />
                                      </div>
                                      <div>
                                        <p className="text-sm text-white/60">Fecha</p>
                                        <p className="font-semibold text-white">
                                          {formatDateOnly(selectedOrder.createdAt)}
                                        </p>
                                      </div>
                                    </div>
                                    {selectedOrder.observations && (
                                      <div>
                                        <p className="text-sm text-white/60">Observaciones</p>
                                        <p className="font-semibold text-white">
                                          {selectedOrder.observations}
                                        </p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="mb-2 text-sm font-semibold text-white/70">Productos</p>
                                      <div className="space-y-2">
                                        {selectedOrder.items.map((item, idx) => {
                                          return (
                                            <div
                                              key={`order-action-item-${item.id}-${idx}`}
                                              className="flex items-center justify-between rounded-lg border border-white/10 bg-gradient-blue p-3"
                                            >
                                              <div>
                                                <p className="font-medium text-white">{item.product.name}</p>
                                                <p className="text-sm text-white/60">Cantidad: {Math.floor(item.qty)}</p>
                                              </div>
                                              <p className="font-bold text-white">
                                                {formatCurrency(item.unitPrice * item.qty)}
                                              </p>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/20 pt-4">
                                      <p className="text-lg font-semibold text-white">Total</p>
                                      <p className="text-2xl font-bold text-white">
                                        {formatCurrency(selectedOrder.totalAmount)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown por método de pago y caja */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-white/20 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Ventas por Caja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics.cashierBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([cashier, amount]) => (
                    <div
                      key={`cashier-${cashier}`}
                      className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-[#1E2C6D]" />
                        <span className="font-medium text-white">{cashier}</span>
                      </div>
                      <span className="font-bold text-white">{formatCurrency(amount)}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Mayor Venta */}
          <Card className="border-white/20 bg-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Mayor Venta</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                (() => {
                  const highestOrder = orders.reduce((max, order) =>
                    Number(order.totalAmount) > Number(max.totalAmount) ? order : max
                    , orders[0])
                  return (
                    <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-green-500/10 to-green-500/5 p-4 border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/20">
                          <TrendingUp className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white/60">Orden N°</p>
                          <p className="text-xl font-bold text-white">#{highestOrder.orderNumber || highestOrder.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/60">Recaudado</p>
                        <p className="text-2xl font-bold text-green-400">{formatCurrency(highestOrder.totalAmount)}</p>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <p className="text-white/50 text-center py-4">No hay ventas registradas</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparación entre eventos */}
        <Card className="border-white/20 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Comparación entre Eventos</CardTitle>
            <CardDescription className="text-white/60">Análisis de rendimiento por evento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/20 hover:bg-transparent">
                    <TableHead className="text-white/70">Evento</TableHead>
                    <TableHead className="text-white/70">Ventas Totales</TableHead>
                    <TableHead className="text-white/70">Órdenes</TableHead>
                    <TableHead className="text-white/70">Ticket Promedio</TableHead>
                    <TableHead className="text-white/70">Producto Top</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventComparison.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-white/50 py-8">
                        No hay eventos disponibles
                      </TableCell>
                    </TableRow>
                  ) : (
                    eventComparison.map((event) => {
                      const avgTicket = event.totalOrders > 0 ? event.totalSales / event.totalOrders : 0
                      return (
                        <TableRow
                          key={`comparison-${event.eventId}`}
                          className="border-b border-white/5 hover:bg-white/5"
                        >
                          <TableCell className="font-medium text-white">{event.eventName}</TableCell>
                          <TableCell className="font-bold text-white">
                            {event.isLoading ? (
                              <span className="text-white/50">Cargando...</span>
                            ) : (
                              formatCurrency(event.totalSales)
                            )}
                          </TableCell>
                          <TableCell className="text-white">
                            {event.isLoading ? (
                              <span className="text-white/50">...</span>
                            ) : (
                              event.totalOrders
                            )}
                          </TableCell>
                          <TableCell className="text-white">
                            {event.isLoading ? (
                              <span className="text-white/50">...</span>
                            ) : (
                              formatCurrency(avgTicket)
                            )}
                          </TableCell>
                          <TableCell className="text-white/70">
                            {event.isLoading ? (
                              <span className="text-white/50">...</span>
                            ) : (
                              event.topProduct
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
