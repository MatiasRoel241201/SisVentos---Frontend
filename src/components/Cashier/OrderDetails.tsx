"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusPill } from "@/components/status-pill"
import { Order } from "@/features/orders/types"

interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black border pt-8 border-white/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pt-2 border-b border-white/10 pb-4">
          <DialogTitle className="text-2xl font-bold text-white">
            Detalles del Pedido
          </DialogTitle>
          <p className="text-white/60 text-sm mt-1">Orden #{order.orderNumber}</p>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4">
          {/* Estado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center py-2">
              <span className="text-white font-semibold text-sm">Estado:</span>
            </div>
            <div className="py-2 px-4">
              <StatusPill status={order.status.name} />
            </div>
          </div>

          {/* Items */}
          <Card className="">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-white">Artículos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white capitalize">{item.product.name}</p>
                    <p className="text-sm text-white/60">Cantidad: {Math.floor(Number(item.qty))}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-white font-bold">${(Number(item.unitPrice) * Number(item.qty)).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              {/* Observaciones */}
              {order.observations && (
                <Card className="bg-orange-500/10 border-orange-500/30 my-2">
                  <CardHeader>
                    <CardTitle className="text-sm text-orange-400">Observaciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 text-sm">{order.observations}</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>



          {/* Total */}
          <div className="bg-gradient-to-br from-black to-gray-700/50 border border-white/20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-white/80 font-medium">Total:</span>
              <span className="text-white font-bold text-2xl">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-white/10 mt-6 pt-6">
          <Button onClick={onClose} variant="outline" className="bg-gradient-blue border-white/20 text-white hover:bg-white/10">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
