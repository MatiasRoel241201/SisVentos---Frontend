"use client"

import { useState, useEffect, useMemo } from "react"
import type { Order } from "@/features/orders/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { StatusPill } from "@/components/status-pill"
import {
  Search,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useEvents } from "@/features/events/hooks/useEvents"
import { useOrders } from "@/features/orders/hooks/useOrders"

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
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
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

  // Filtrar órdenes
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customerName = order.customerIdentifier || "Cliente"
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || order.status.name === statusFilter
      // Payment method might not be available in the current type definition, handling gracefully
      const paymentMethod = order.paymentMethod || "unknown"
      const matchesPayment = paymentFilter === "all" || paymentMethod === paymentFilter

      return matchesSearch && matchesStatus && matchesPayment
    })
  }, [orders, searchTerm, statusFilter, paymentFilter])

  // Calcular métricas
  const metrics = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    const totalOrders = filteredOrders.length
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0

    const paymentMethodBreakdown = filteredOrders.reduce(
      (acc, order) => {
        const method = order.paymentMethod || "unknown"
        acc[method] = (acc[method] || 0) + Number(order.totalAmount)
        return acc
      },
      {} as Record<string, number>,
    )

    const cashierBreakdown = filteredOrders.reduce(
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
  }, [filteredOrders])

  // Comparación entre eventos (Mock por ahora, ya que requeriría datos históricos complejos)
  const eventComparison = useMemo(() => {
    return events.map((event) => ({
      eventId: event.id,
      eventName: event.name,
      totalSales: 0, // Placeholder
      totalOrders: 0, // Placeholder
      topProduct: "N/A",
    }))
  }, [events])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    return labels[method || ""] || method || "Desconocido"
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
            <Button className="bg-gradient-to-r from-[#1E2C6D] to-[#2a3d8f] hover:from-[#1E2C6D] hover:to-[#1E2C6D] text-white">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
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
              <p className="text-xs text-muted-foreground">{filteredOrders.length} filtradas</p>
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

        {/* Filtros y búsqueda */}
        <Card className="border-white/20 bg-white/5 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <Input
                  placeholder="Buscar por cliente o N° orden..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50 pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full border-white/20 bg-white/10 text-white md:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Preparación</SelectItem>
                  <SelectItem value="COMPLETADO">Completado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full border-white/20 bg-white/10 text-white md:w-[200px]">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Método de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los métodos</SelectItem>
                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
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
                    <TableHead className="text-white/70">Cliente</TableHead>
                    <TableHead className="text-white/70">Productos</TableHead>
                    <TableHead className="text-white/70">Total</TableHead>
                    <TableHead className="text-white/70">Método Pago</TableHead>
                    <TableHead className="text-white/70">Caja</TableHead>
                    <TableHead className="text-white/70">Estado</TableHead>
                    <TableHead className="text-white/70">Fecha</TableHead>
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
                      const customerDisplay = order.customerIdentifier || "Cliente"
                      const paymentMethod = order.paymentMethod
                      return (
                        <TableRow key={`order-row-${order.id}`} className="border-b border-white/5 hover:bg-white/5">
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="link"
                                  className="p-0 font-mono text-blue-950 hover:text-blue-100"
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
                                        <p className="text-sm text-white/60">Cliente</p>
                                        <p className="font-semibold text-white">
                                          {selectedOrder.customerIdentifier || "Cliente"}
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-sm text-white/60">Método de Pago</p>
                                        <p className="font-semibold text-white">
                                          {getPaymentMethodLabel(selectedOrder.paymentMethod)}
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
                                          {formatDate(selectedOrder.createdAt)}
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
                                                <p className="text-sm text-white/60">Cantidad: {item.qty}</p>
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
                          <TableCell className="font-medium text-white">{customerDisplay}</TableCell>
                          <TableCell>
                            <span className="text-sm text-white/60">
                              {order.items.reduce((sum, item) => sum + item.qty, 0)} items
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-blue-200">{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-[#1E2C6D]/30 bg-gradient-blue text-white">
                              {getPaymentMethodLabel(paymentMethod)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-white/70">{order.createdBy?.userName || "N/A"}</TableCell>
                          <TableCell>
                            <StatusPill status={normalizeStatus(order.status.name)} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-white/60">
                              <Calendar className="h-3 w-3" />
                              {formatDate(order.createdAt)}
                            </div>
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
              <CardTitle className="text-white">Ventas por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(metrics.paymentMethodBreakdown).map(([method, amount]) => (
                  <div
                    key={`payment-${method}`}
                    className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-[#1E2C6D]" />
                      <span className="font-medium text-white">{getPaymentMethodLabel(method)}</span>
                    </div>
                    <span className="font-bold text-white">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                    <TableHead className="text-white/70">Tendencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventComparison.map((event, index) => {
                    const avgTicket = event.totalOrders > 0 ? event.totalSales / event.totalOrders : 0
                    const trend = index % 2 === 0
                    return (
                      <TableRow
                        key={`comparison-${event.eventId}`}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <TableCell className="font-medium text-white">{event.eventName}</TableCell>
                        <TableCell className="font-bold text-white">{formatCurrency(event.totalSales)}</TableCell>
                        <TableCell className="text-white">{event.totalOrders}</TableCell>
                        <TableCell className="text-white">{formatCurrency(avgTicket)}</TableCell>
                        <TableCell className="text-white/70">{event.topProduct}</TableCell>
                        <TableCell>
                          {trend ? (
                            <div className="flex items-center gap-1 text-green-400">
                              <ArrowUpRight className="h-4 w-4" />
                              <span className="text-sm font-medium">+8.3%</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[#D9251C]">
                              <ArrowDownRight className="h-4 w-4" />
                              <span className="text-sm font-medium">-3.2%</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
