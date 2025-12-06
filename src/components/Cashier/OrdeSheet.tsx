"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Minus, Trash2, Loader2 } from "lucide-react"
import { useCreateOrder } from "@/features/orders/hooks/useCreateOrder"
import { useAvailableProducts } from "@/features/inventory/hooks/useInventory"
import { useProductRecipe } from "@/features/products/hooks/useProducts"
import { PaymentMethod } from "@/features/orders/types"
import { EventProductInventory } from "@/features/inventory/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  removedIngredients: string[]
}

interface OrderSheetProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  userId: string
}

export function OrderSheet({ isOpen, onClose, eventId }: OrderSheetProps) {
  const [items, setItems] = useState<OrderItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO")

  const { mutate: createOrder, isPending: isCreating } = useCreateOrder(eventId)
  const { data: products, isLoading: isLoadingProducts } = useAvailableProducts(eventId)

  const handleAddItem = (product: EventProductInventory) => {
    const existingItem = items.find((i) => i.id === product.productId)
    if (existingItem) {
      setItems(items.map((i) => (i.id === product.productId ? { ...i, quantity: i.quantity + 1 } : i)))
    } else {
      setItems([
        ...items,
        {
          id: product.productId,
          name: product.product.name,
          price: Number(product.salePrice),
          quantity: 1,
          removedIngredients: [],
        },
      ])
    }
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id))
  }

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id)
    } else {
      setItems(items.map((i) => (i.id === id ? { ...i, quantity: newQuantity } : i)))
    }
  }

  const handleRemoveIngredient = (itemId: string, ingredientName: string) => {
    setItems(
      items.map((i) =>
        i.id === itemId
          ? {
            ...i,
            removedIngredients: i.removedIngredients.includes(ingredientName)
              ? i.removedIngredients.filter((ing) => ing !== ingredientName)
              : [...i.removedIngredients, ingredientName],
          }
          : i,
      ),
    )
  }

  const generateObservations = () => {
    const observations: string[] = []
    items.forEach((item) => {
      if (item.removedIngredients.length > 0) {
        const removedList = item.removedIngredients.join(", ")
        observations.push(`${item.name}: Sin ${removedList}`)
      }
    })
    return observations.length > 0 ? observations.join("; ") : ""
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleConfirm = () => {
    const observations = generateObservations()
    createOrder(
      {
        items: items.map((i) => ({ productId: i.id, qty: i.quantity })),
        paymentMethod,
        observations,
      },
      {
        onSuccess: () => {
          setItems([])
          setPaymentMethod("EFECTIVO")
          onClose()
        },
      },
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-black border-2 border-white text-white max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Realizar Pedido</DialogTitle>
        </DialogHeader>
        <div className="flex h-full overflow-hidden">
          {/* LEFT COLUMN - PRODUCTS */}
          <div className="flex-1 border-r-2 border-white/20 flex flex-col overflow-hidden">
            <div className="p-6 border-b-2 border-white/20 space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/70 mb-2 block">Método de Pago</label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger className="bg-white/10 border-white/30 text-white h-10">
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20 text-white">
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 border-white/20 bg-black">
              <h2 className="text-2xl font-bold text-white">Seleccionar productos</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingProducts ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {products?.map((item) => (
                    <div key={item.productId} className="relative">
                      <button
                        onClick={() => handleAddItem(item)}
                        className="w-full p-4 bg-gradient-to-br from-[#1E2C6D]/80 to-[#1E2C6D]/40 hover:from-[#1E2C6D] hover:to-[#1E2C6D]/60 border border-white/20 rounded-lg text-white font-medium transition-all active:scale-95 group text-left"
                      >
                        <div className="text-base font-bold capitalize">{item.product.name}</div>
                        <div className="text-white text-sm font-semibold mt-1">${Number(item.salePrice).toFixed(2)}</div>
                        <div className="text-white/50 text-xs mt-1">Stock: {item.currentQty}</div>
                      </button>
                      {item.hasRecipe && (
                        <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-xs">
                          Receta
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - ORDER */}
          <div className="w-96 flex flex-col pt-8 bg-black overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {items.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/40 text-sm">
                  Agrega productos al pedido
                </div>
              ) : (
                items.map((item) => (
                  <OrderItemCard
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                    onRemoveIngredient={handleRemoveIngredient}
                  />
                ))
              )}
            </div>

            <div className="border-t-2 border-white/20 p-6 space-y-3">
              <div className="bg-white/5 border border-white/20 rounded-lg p-3">
                <p className="text-white/60 text-xs font-semibold mb-1">Total</p>
                <p className="text-3xl font-black text-white">${total.toFixed(2)}</p>
              </div>
              <Button
                onClick={handleConfirm}
                disabled={items.length === 0 || isCreating}
                className="w-full bg-gradient-blue hover:blue-200 text-white font-bold h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Confirmar Pedido"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function OrderItemCard({
  item,
  onQuantityChange,
  onRemove,
  onRemoveIngredient,
}: {
  item: OrderItem
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onRemoveIngredient: (itemId: string, ingredientName: string) => void
}) {
  const { data: recipe } = useProductRecipe(item.id)

  return (
    <div className="space-y-2">
      <div className="bg-white/5 border border-white/20 rounded-lg p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-white font-bold text-sm capitalize">{item.name}</p>
            <p className="text-white text-sm font-bold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="p-1.5 hover:bg-[#D9251C]/20 rounded transition-all"
          >
            <Trash2 className="h-4 w-4 text-[#D9251C]" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <Minus className="h-4 w-4 text-white" />
          </button>
          <span className="flex-1 text-center text-white font-bold text-sm bg-white/5 rounded py-1">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Ingredients */}
        {recipe && recipe.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-xs text-white/60 mb-2">Quitar:</p>
            <div className="flex flex-wrap gap-1">
              {recipe.map((ingredient) => {
                const isRemoved = item.removedIngredients.includes(ingredient.supply.name)
                return (
                  <button
                    key={ingredient.supply.id}
                    onClick={() => onRemoveIngredient(item.id, ingredient.supply.name)}
                    className={`text-xs px-2 py-1 rounded transition-all ${isRemoved
                      ? "bg-red-500/20 text-red-300 line-through"
                      : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                  >
                    {ingredient.supply.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
