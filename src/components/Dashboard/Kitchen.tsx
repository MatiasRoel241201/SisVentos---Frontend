"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, ChefHat, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusPill } from "@/components/status-pill"
import { useActiveEvents } from "@/features/events/hooks/useEvents"
import { useKitchenOrders, useKitchenOrderMutations } from "@/features/kitchen/hooks/useKitchen"
import { useEventProducts } from "@/features/inventory/hooks/useInventory"
import { Order } from "@/features/orders/types"
import { formatQty } from "@/helpers/qty"

function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onStartPreparation,
  onCompletePreparation,
}: {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onStartPreparation: (orderId: string) => void
  onCompletePreparation: (orderId: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      // Consideramos que llegó al fondo si está cerca (margen de 10px) o si no hay scroll
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10 || scrollHeight <= clientHeight

      if (isBottom) {
        setHasScrolledToBottom(true)
        setShowScrollHint(false)
      } else {
        setShowScrollHint(true)
      }
    }
  }

  useEffect(() => {
    // Reset state when order changes or modal opens
    if (isOpen) {
      setHasScrolledToBottom(false)
      // Small timeout to allow render and calculation of heights
      setTimeout(checkScroll, 100)
    }
  }, [isOpen, order])

  if (!order) return null

  const getStatusInfo = (statusName: string) => {
    switch (statusName) {
      case "PENDING":
        return { label: "Pendiente", color: "bg-red-500", icon: Clock }
      case "IN_PROGRESS":
        return { label: "En Preparación", color: "bg-yellow-500", icon: ChefHat }
      case "COMPLETED":
        return { label: "Completado", color: "bg-green-500", icon: CheckCircle2 }
      default:
        return { label: "Desconocido", color: "bg-gray-500", icon: Clock }
    }
  }

  const statusInfo = getStatusInfo(order.status.name)
  const StatusIcon = statusInfo.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 bg-black border border-white/20">
        <DialogHeader className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3 text-2xl text-white">
            Pedido #{order.orderNumber}
            <Badge className={cn("text-white", statusInfo.color)}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {statusInfo.label}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {order.customerIdentifier && `Cliente: ${order.customerIdentifier} | `}
            {new Date(order.createdAt).toLocaleString("es-AR")}
          </DialogDescription>
        </DialogHeader>

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex-1 overflow-y-auto p-6 space-y-4 relative"
        >
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
            <h3 className="font-semibold text-lg text-white">Items del Pedido</h3>
            {order.items.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="flex justify-between items-center py-2 border-b border-white/10 last:border-0"
              >
                <div>
                  <p className="font-medium capitalize text-white">{item.product.name}</p>
                  <p className="text-sm text-white/60">Cantidad: {formatQty(item.qty)}</p>
                </div>
                <p className="font-semibold text-white">${(Number(item.unitPrice) * item.qty).toFixed(2)}</p>
              </div>
            ))}

            {order.observations && (
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 mt-4">
                <h3 className="font-semibold text-sm text-orange-400 mb-2">Observaciones</h3>
                <p className="text-sm text-white/80">{order.observations}</p>
              </div>
            )}
          </div>
        </div>

        {showScrollHint && !hasScrolledToBottom && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm flex items-center justify-centeranimate-bounce border border-white/20 pointer-events-none z-50">
            Scrollea para confirmar <ChevronDown className="ml-2 h-4 w-4" />
          </div>
        )}

        <div className="p-6 pt-4 border-t border-white/10 bg-black flex-shrink-0 space-y-4 relative z-10">
          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-white">Total</span>
            <span className="text-white">${Number(order.totalAmount).toFixed(2)}</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Cerrar
            </Button>
            {order.status.name === "PENDING" && (
              <Button
                disabled={!hasScrolledToBottom}
                onClick={() => {
                  onStartPreparation(order.id)
                  onClose()
                }}
                className="flex-1 bg-red-500 hover:bg-yellow-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Iniciar Preparación
              </Button>
            )}
            {order.status.name === "IN_PROGRESS" && (
              <Button
                disabled={!hasScrolledToBottom}
                onClick={() => {
                  onCompletePreparation(order.id)
                  onClose()
                }}
                className="flex-1 bg-yellow-500 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar Completado
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function OrderCard({
  order,
  onStartPreparation,
  onCompletePreparation,
  onClick,
}: {
  order: Order
  onStartPreparation: (orderId: string) => void
  onCompletePreparation: (orderId: string) => void
  onClick: () => void
}) {
  const getStatusConfig = (statusName: string) => {
    switch (statusName) {
      case "PENDING":
        return {
          bgColor: "bg-red-950/20",
          borderColor: "border-l-red-500",
          icon: Clock,
          actionLabel: "Iniciar",
          actionColor: "bg-red-500 hover:bg-red-600",
          nextAction: onStartPreparation,
        }
      case "IN_PROGRESS":
        return {
          bgColor: "bg-yellow-950/20",
          borderColor: "border-l-yellow-500",
          icon: ChefHat,
          actionLabel: "Completar",
          actionColor: "bg-yellow-500 hover:bg-yellow-600",
          nextAction: onCompletePreparation,
        }
      case "COMPLETED":
        return {
          bgColor: "bg-green-950/20",
          borderColor: "border-l-green-500",
          icon: CheckCircle2,
          actionLabel: null,
          actionColor: "",
          nextAction: null,
        }
      default:
        return {
          bgColor: "bg-gray-950/20",
          borderColor: "border-l-gray-500",
          icon: Clock,
          actionLabel: null,
          actionColor: "",
          nextAction: null,
        }
    }
  }

  const config = getStatusConfig(order.status.name)

  return (
    <Card
      className={cn("border-l-4 transition-all hover:shadow-lg cursor-pointer h-full flex flex-col", config.bgColor, config.borderColor)}
      onClick={onClick}
    >
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-light text-white mb-1">Pedido #{order.orderNumber}</h3>
          </div>
          <StatusPill status={order.status.name} />
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item, idx) => (
            <div key={`${order.id}-${item.id}-${idx}`} className="flex justify-between text-base">
              <span className="font-medium capitalize text-white">
                {formatQty(item.qty)}x {item.product.name}
              </span>
            </div>
          ))}
        </div>

        {/* Observaciones */}
        {order.observations && (
          <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <p className="text-sm text-orange-300">{order.observations}</p>
          </div>
        )}

        {/* Spacer para empujar el footer hacia abajo */}
        <div className="flex-grow"></div>

        <div className="flex items-center justify-between pt-4 border-t mt-auto">
          <div className="text-lg font-bold text-white">
            Total: <span className="text-white">${Number(order.totalAmount).toFixed(2)}</span>
          </div>
          {config.actionLabel && config.nextAction && (
            <Button
              onClick={(e) => {
                e.stopPropagation()
                config.nextAction!(order.id)
              }}
              className={cn("text-white", config.actionColor)}
            >
              {config.actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function CocinaDashboard() {
  const [selectedEventId, setSelectedEventId] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null) // null = mostrar todos

  const { data: events } = useActiveEvents()
  const { data: orders, isLoading: isLoadingOrders } = useKitchenOrders(selectedEventId)
  const { data: products } = useEventProducts(selectedEventId)
  const { startPreparation, completePreparation } = useKitchenOrderMutations(selectedEventId)

  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id)
    }
  }, [events, selectedEventId])

  const handleStartPreparation = (orderId: string) => {
    startPreparation.mutate(orderId)
  }

  const handleCompletePreparation = (orderId: string) => {
    completePreparation.mutate(orderId)
  }

  const pendingOrders = orders?.filter((o) => o.status.name === "PENDING") || []
  const inProgressOrders = orders?.filter((o) => o.status.name === "IN_PROGRESS") || []
  const completedOrders = orders?.filter((o) => o.status.name === "COMPLETED") || []



  const lowStockProducts = products?.filter((p) => p.currentQty > 0 && p.currentQty <= 5) || []
  const outOfStockProducts = products?.filter((p) => p.currentQty === 0) || []

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Panel de Cocina</h1>
          </div>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[250px] bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Selecciona un evento" />
            </SelectTrigger>
            <SelectContent className="bg-black border-white/20">
              {events?.map((event) => (
                <SelectItem key={event.id} value={event.id} className="text-white hover:bg-gray-800 focus:bg-gray-800">
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <Card className="border-l-4 border-l-orange-500 bg-orange-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-400 mb-2">Alertas de Inventario</h3>
                  {outOfStockProducts.length > 0 && (
                    <p className="text-sm text-orange-300 mb-1">
                      <span className="font-medium">Sin stock:</span>{" "}
                      {outOfStockProducts.map((p) => p.product.name).join(", ")}
                    </p>
                  )}
                  {lowStockProducts.length > 0 && (
                    <p className="text-sm text-orange-300">
                      <span className="font-medium">Stock bajo:</span>{" "}
                      {lowStockProducts.map((p) => `${p.product.name} (${p.currentQty})`).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            className={cn(
              "border-l-4 border-l-red-500 cursor-pointer transition-all hover:shadow-md hover:shadow-red-500/30",
              statusFilter === "PENDING" && "bg-red-500/30"
            )}
            onClick={() => setStatusFilter(statusFilter === "PENDING" ? null : "PENDING")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pendientes</p>
                  <p className="text-3xl font-bold text-red-600">{pendingOrders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-950 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-l-4 border-l-yellow-500 cursor-pointer transition-all hover:shadow-md hover:shadow-yellow-500/30",
              statusFilter === "IN_PROGRESS" && "bg-yellow-500/30"
            )}
            onClick={() => setStatusFilter(statusFilter === "IN_PROGRESS" ? null : "IN_PROGRESS")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">En Preparación</p>
                  <p className="text-3xl font-bold text-yellow-600">{inProgressOrders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-950 flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={cn(
              "border-l-4 border-l-green-500 cursor-pointer transition-all hover:shadow-md hover:shadow-green-500/30",
              statusFilter === "COMPLETED" && "bg-green-500/30"
            )}
            onClick={() => setStatusFilter(statusFilter === "COMPLETED" ? null : "COMPLETED")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completados</p>
                  <p className="text-3xl font-bold text-green-600">{completedOrders.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-950 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedEventId && (
          <div className="space-y-6">
            {isLoadingOrders ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E2C6D] mx-auto"></div>
                <p className="text-muted-foreground mt-4">Cargando pedidos...</p>
              </div>
            ) : orders && orders.length > 0 ? (
              <>
                {/* Pendientes */}
                {(!statusFilter || statusFilter === "PENDING") && pendingOrders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Pendientes ({pendingOrders.length})
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {pendingOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onStartPreparation={handleStartPreparation}
                          onCompletePreparation={handleCompletePreparation}
                          onClick={() => setSelectedOrder(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* En Preparación */}
                {(!statusFilter || statusFilter === "IN_PROGRESS") && inProgressOrders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-yellow-600 mb-4 flex items-center gap-2">
                      <ChefHat className="h-5 w-5" />
                      En Preparación ({inProgressOrders.length})
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {inProgressOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onStartPreparation={handleStartPreparation}
                          onCompletePreparation={handleCompletePreparation}
                          onClick={() => setSelectedOrder(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Completados */}
                {(!statusFilter || statusFilter === "COMPLETED") && completedOrders.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Completados ({completedOrders.length})
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {completedOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onStartPreparation={handleStartPreparation}
                          onCompletePreparation={handleCompletePreparation}
                          onClick={() => setSelectedOrder(order)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <ChefHat className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay pedidos</h3>
                  <p className="text-muted-foreground">Los pedidos aparecerán aquí cuando se realicen</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStartPreparation={handleStartPreparation}
          onCompletePreparation={handleCompletePreparation}
        />
      </div>
    </div>
  )
}
