"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useActiveEvents } from "@/features/events/hooks/useEvents"
import { useOrders } from "@/features/orders/hooks/useOrders"
import { useAuth } from "../../Context/AuthContext"
import { OrderSheet } from "../Cashier/OrdeSheet"
import { Eye, Plus, Search, Filter } from "lucide-react"
import { OrderDetailsModal } from "../Cashier/OrderDetails"
import { StatusPill } from "../status-pill"
import { Order } from "@/features/orders/types"
import { formatEventDate } from "@/helpers/date"

export default function CajaDashboard() {
  const [selectedEventId, setSelectedEventId] = useState("")
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { user } = useAuth()
  const { data: events } = useActiveEvents()

  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) {
      const lastEvent = events[events.length - 1]
      setSelectedEventId(lastEvent.id)
    }
  }, [events, selectedEventId])

  const { data: orders, isLoading: isLoadingOrders } = useOrders(selectedEventId)

  const filteredOrders = useMemo(() => {
    if (!orders) return []

    return orders.filter((order) => {
      const matchesSearch = order.customerIdentifier?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true
      const matchesStatus = statusFilter === "all" || order.status.name === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order)
  }

  const totalOrders = orders?.length || 0
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.totalAmount), 0) || 0

  return (
    <main className="flex flex-col min-h-screen bg-black">
      <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-4">
        {/* Header */}
        <div className="backdrop-blur-lg bg-gradient-blue border border-white/20 rounded-xl p-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-300">

          {/* IZQUIERDA: Nombre del Evento y Fecha */}
          <div className="space-y-1 mb-4 md:mb-0">
            <h3 className="text-3xl font-bold text-blue-100 flex items-center">
              {events?.find((e) => e.id === selectedEventId)?.name}
            </h3>
            <p className="text-sm text-gray-200 ">
              {events?.find((e) => e.id === selectedEventId)?.startDate &&
                formatEventDate(events.find((e) => e.id === selectedEventId)!.startDate)}
            </p>
          </div>

          {/* DERECHA: Selector de Evento Moderno */}
          <div className="flex items-center space-x-3">

            <label className="text-sm font-medium text-gray-400 hidden sm:block">Cambiar Evento:</label>

            {/* El Select se integra con la estética de Glassmorphism */}
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>

              {/* El Trigger parece un botón de acción estilizado */}
              <SelectTrigger className="w-full md:w-[250px] bg-white/10 border-white/30 text-white 
                                              hover:bg-white/20 transition-colors duration-200">
                <SelectValue placeholder="Seleccionar otro evento..." />
              </SelectTrigger>

              {/* El contenido del Select mantiene el tema Oscuro */}
              <SelectContent className="bg-[var(--color-brand-black)] border-white/20">
                {events?.map((event) => (
                  <SelectItem
                    key={event.id}
                    value={event.id}
                    className="text-white hover:bg-gray-800 focus:bg-gray-800"
                  >
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>


        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="w-full sm:w-64">
            {/* Agregar Sección */}
          </div>

          {/* KPIs */}
          {selectedEventId && (
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none p-3 rounded-lg bg-gradient-to-br from-[#1E2C6D]/20 to-[#1E2C6D]/5 border border-white/20">
                <div className="text-xs text-white/60">Pedidos</div>
                <div className="text-xl font-bold text-[#1E2C6D]">{totalOrders}</div>
              </div>
              <div className="flex-1 sm:flex-none p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 border border-white/20">
                <div className="text-xs text-white/60">Ingresos</div>
                <div className="text-xl font-bold text-green-400">${totalRevenue.toFixed(2)}</div>
              </div>
              <div className="flex-1 sm:flex-none p-3 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-white/20">
                <div className="text-xs text-white/60">Ticket Promedio</div>
                <div className="text-xl font-bold text-orange-400">
                  ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00"}
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedEventId && (
          <>
            {/* Botón Nuevo Pedido y Filtros */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 bg-black">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10 h-11"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white h-11 w-full sm:w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="PENDING">Pendientes</SelectItem>
                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                    <SelectItem value="COMPLETED">Completados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => setIsOrderSheetOpen(true)}
                className="bg-gradient-blue text-whitefont-bold w-full sm:w-auto h-11"
              >
                <Plus className="mr-2 h-4 w-4" />
                Realizar Pedido
              </Button>
            </div>

            {/* Tabla de Pedidos */}
            <Card className="backdrop-blur-xl bg-white/5 border border-white-1 overflow-hidden">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white">Pedidos del Evento</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingOrders ? (
                  <div className="p-8 text-center text-white/60">Cargando pedidos...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-white/60">No hay pedidos disponibles</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-white/20 hover:bg-transparent">
                          <TableHead className="text-white/70">N° Orden</TableHead>
                          <TableHead className="text-white/70">Items</TableHead>
                          <TableHead className="text-white/70 text-right">Total</TableHead>
                          <TableHead className="text-white/70">Estado</TableHead>
                          <TableHead className="text-white/70 text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow
                            key={order.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <TableCell className="text-white font-mono text-sm">#{order.orderNumber}</TableCell>
                            <TableCell className="text-white/70">{order.items.length} item(s)</TableCell>
                            <TableCell className="text-right">
                              <span className="text-white font-bold">
                                $
                                {Number(order.totalAmount).toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <StatusPill status={order.status.name} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenOrderDetails(order)}
                                className="border border-white text-white hover:bg-blue-900 hover:text-white hover:border-blue-900"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {user && (
          <OrderSheet
            isOpen={isOrderSheetOpen}
            onClose={() => setIsOrderSheetOpen(false)}
            eventId={selectedEventId}
            userId={user.id}
          />
        )}

        <OrderDetailsModal order={selectedOrder} isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} />
      </div>
    </main>
  )
}
