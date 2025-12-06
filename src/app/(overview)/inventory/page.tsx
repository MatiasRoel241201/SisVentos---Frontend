"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Plus, Edit, Trash2, AlertTriangle, Box, Layers, ChevronLeft, ChevronRight, X, Upload, DollarSign, TrendingUp, BarChart3, Scale, Utensils } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog"
import { cn } from "@/lib/utils"

import { useEvents } from "@/features/events/hooks/useEvents"
import { useToast } from "@/hooks/use-toast"
import { useEventProducts, useEventSupplies, useInventoryMutations } from "@/features/inventory/hooks/useInventory"
import { useSupplies, useSupplyMutations } from "@/features/supplies/hooks/useSupplies"
import { useProducts, useProductMutations } from "@/features/products/hooks/useProducts"
import { productsService } from "@/features/products/services/products.service"
import { inventoryService } from "@/features/inventory/services/inventory.service"
import type { Supply, CreateSupplyDto, UpdateSupplyDto } from "@/features/supplies/types"
import type { Product, CreateProductDto, UpdateProductDto, AssignSuppliesDto } from "@/features/products/types"
import type { LoadProductsDto, LoadSuppliesDto, EventProductInventory, EventSupplyInventory, UpdateProductInventoryDto, UpdateSupplyInventoryDto } from "@/features/inventory/types"

export default function InventoryPage() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <InventoryContent />
    </ProtectedRoute>
  )
}

function InventoryContent() {
  const searchParams = useSearchParams()
  const eventIdFromUrl = searchParams.get('eventId')

  const [selectedEventId, setSelectedEventId] = useState<string>("")
  const [activeTab, setActiveTab] = useState("event-products")
  const { toast } = useToast()

  // Pagination
  const [suppliesPage, setSuppliesPage] = useState(1)
  const [productsPage, setProductsPage] = useState(1)
  const itemsPerPage = 10

  // Data hooks
  const { data: events = [] } = useEvents()
  const { data: eventProductInventory = [] } = useEventProducts(selectedEventId)
  const { data: eventSupplyInventory = [] } = useEventSupplies(selectedEventId)
  const { data: allSupplies = [] } = useSupplies()
  const { data: allProducts = [] } = useProducts()

  // Paginated data
  const supplies = allSupplies.slice((suppliesPage - 1) * itemsPerPage, suppliesPage * itemsPerPage)
  const products = allProducts.slice((productsPage - 1) * itemsPerPage, productsPage * itemsPerPage)
  const suppliesPages = Math.ceil(allSupplies.length / itemsPerPage)
  const productsPages = Math.ceil(allProducts.length / itemsPerPage)

  // Mutations
  const supplyMutations = useSupplyMutations()
  const productMutations = useProductMutations()
  const inventoryMutations = useInventoryMutations(selectedEventId)

  // Supply form
  const [showSupplyDialog, setShowSupplyDialog] = useState(false)
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null)
  const [supplyForm, setSupplyForm] = useState<CreateSupplyDto>({
    name: "",
    unit: "Uni",
  })

  // Product form with recipe
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<CreateProductDto>({
    name: "",
  })
  const [useRecipe, setUseRecipe] = useState(false)
  const [recipeSupplies, setRecipeSupplies] = useState<Array<{ supplyId: string; qtyPerUnit: number }>>([])

  // Load products to event
  const [showLoadProductsDialog, setShowLoadProductsDialog] = useState(false)
  const [selectedProductsToLoad, setSelectedProductsToLoad] = useState<Array<{
    productId: string
    initialQty: number
    minQty: number
    salePrice: number
    cost?: number
    hasRecipe?: boolean
    canLoad?: boolean
    costMessage?: string
  }>>([])

  // Load supplies to event
  const [showLoadSuppliesDialog, setShowLoadSuppliesDialog] = useState(false)
  const [selectedSuppliesToLoad, setSelectedSuppliesToLoad] = useState<Array<{
    supplyId: string
    initialQty: number
    minQty: number
    cost: number
  }>>([])

  // Edit inventory product
  const [showEditProductInventoryDialog, setShowEditProductInventoryDialog] = useState(false)
  const [editingProductInventory, setEditingProductInventory] = useState<EventProductInventory | null>(null)
  const [productInventoryForm, setProductInventoryForm] = useState<UpdateProductInventoryDto>({
    currentQty: 0,
    minQty: 0,
    cost: 0,
    salePrice: 0,
  })

  // Edit inventory supply
  const [showEditSupplyInventoryDialog, setShowEditSupplyInventoryDialog] = useState(false)
  const [editingSupplyInventory, setEditingSupplyInventory] = useState<EventSupplyInventory | null>(null)
  const [supplyInventoryForm, setSupplyInventoryForm] = useState<UpdateSupplyInventoryDto>({
    currentQty: 0,
    minQty: 0,
    cost: 0,
  })

  // Delete confirmation
  const [showDeleteProductInventoryDialog, setShowDeleteProductInventoryDialog] = useState(false)
  const [deletingProductInventory, setDeletingProductInventory] = useState<EventProductInventory | null>(null)
  const [showDeleteSupplyInventoryDialog, setShowDeleteSupplyInventoryDialog] = useState(false)
  const [deletingSupplyInventory, setDeletingSupplyInventory] = useState<EventSupplyInventory | null>(null)


  // Set event from URL if provided
  useEffect(() => {
    if (eventIdFromUrl && events.length > 0) {
      const eventExists = events.find(e => e.id === eventIdFromUrl)
      if (eventExists) {
        setSelectedEventId(eventIdFromUrl)
      }
    }
  }, [eventIdFromUrl, events])

  // Reset pagination when changing tabs
  useEffect(() => {
    setSuppliesPage(1)
    setProductsPage(1)
  }, [activeTab])

  // Supply handlers
  const handleCreateSupply = async () => {
    if (!supplyForm.name) return
    await supplyMutations.createSupply.mutateAsync(supplyForm)
    setShowSupplyDialog(false)
    resetSupplyForm()
  }

  const handleUpdateSupply = async () => {
    if (!editingSupply) return
    await supplyMutations.updateSupply.mutateAsync({
      id: editingSupply.id,
      data: supplyForm as UpdateSupplyDto,
    })
    setShowSupplyDialog(false)
    setEditingSupply(null)
    resetSupplyForm()
  }

  const handleDeleteSupply = async (id: string) => {
    await supplyMutations.deleteSupply.mutateAsync(id)
  }

  const openEditSupply = (supply: Supply) => {
    setEditingSupply(supply)
    setSupplyForm({
      name: supply.name,
      unit: supply.unit,
    })
    setShowSupplyDialog(true)
  }

  const resetSupplyForm = () => {
    setSupplyForm({ name: "", unit: "Uni" })
    setEditingSupply(null)
  }

  // Product handlers
  const handleCreateProduct = async () => {
    if (!productForm.name) return

    try {
      const payload = useRecipe
        ? { name: productForm.name }
        : productForm

      const newProduct = await productMutations.createProduct.mutateAsync(payload as CreateProductDto)

      if (useRecipe && recipeSupplies.length > 0 && newProduct) {
        const assignData: AssignSuppliesDto = {
          supplies: recipeSupplies
        }
        await productMutations.assignSupplies.mutateAsync({
          id: newProduct.id,
          data: assignData
        })
      }

      setShowProductDialog(false)
      resetProductForm()
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return

    try {
      const payload = useRecipe
        ? { name: productForm.name }
        : productForm

      await productMutations.updateProduct.mutateAsync({
        id: editingProduct.id,
        data: payload as UpdateProductDto,
      })

      if (useRecipe && recipeSupplies.length > 0) {
        const assignData: AssignSuppliesDto = {
          supplies: recipeSupplies
        }
        await productMutations.assignSupplies.mutateAsync({
          id: editingProduct.id,
          data: assignData
        })
      }

      setShowProductDialog(false)
      setEditingProduct(null)
      resetProductForm()
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    await productMutations.deleteProduct.mutateAsync(id)
  }

  const openEditProduct = async (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
    })

    // Si el producto tiene receta, obtener los insumos del backend
    if (product.hasRecipe) {
      setUseRecipe(true)
      try {
        const recipe = await productsService.getSupplies(product.id)
        setRecipeSupplies(recipe.map(s => ({
          supplyId: s.supplyId,
          qtyPerUnit: Number(s.qtyPerUnit) || 1
        })))
      } catch (error) {
        console.error('Error fetching recipe:', error)
        setRecipeSupplies([])
      }
    } else if (product.supplies?.length) {
      // Fallback: si ya vienen los supplies en el objeto
      setUseRecipe(true)
      setRecipeSupplies(product.supplies.map(s => ({
        supplyId: s.supplyId,
        qtyPerUnit: Number(s.qtyPerUnit) || 1
      })))
    } else {
      setUseRecipe(false)
      setRecipeSupplies([])
    }

    setShowProductDialog(true)
  }

  const resetProductForm = () => {
    setProductForm({ name: "" })
    setEditingProduct(null)
    setUseRecipe(false)
    setRecipeSupplies([])
  }

  const addSupplyToRecipe = () => {
    setRecipeSupplies([...recipeSupplies, { supplyId: "", qtyPerUnit: 1 }])
  }

  const removeSupplyFromRecipe = (index: number) => {
    setRecipeSupplies(recipeSupplies.filter((_, i) => i !== index))
  }

  const updateRecipeSupply = (index: number, field: 'supplyId' | 'qtyPerUnit', value: string | number) => {
    const updated = [...recipeSupplies]
    if (field === 'supplyId') {
      updated[index].supplyId = value as string
    } else {
      updated[index].qtyPerUnit = parseFloat(String(value)) || 0
    }
    setRecipeSupplies(updated)
  }

  // Load products to event
  const addProductToLoad = () => {
    setSelectedProductsToLoad([
      ...selectedProductsToLoad,
      { productId: "", initialQty: 0, minQty: 0, salePrice: 0, cost: 0 }
    ])
  }

  const removeProductToLoad = (index: number) => {
    setSelectedProductsToLoad(selectedProductsToLoad.filter((_, i) => i !== index))
  }

  const updateProductToLoad = async (index: number, field: keyof typeof selectedProductsToLoad[0], value: string | number) => {
    const updated = [...selectedProductsToLoad]
    updated[index] = { ...updated[index], [field]: value }

    // Si se cambió el productId, calcular el costo
    if (field === 'productId' && value && selectedEventId) {
      try {
        const costInfo = await inventoryService.calculateProductCost(selectedEventId, value as string)
        updated[index] = {
          ...updated[index],
          cost: costInfo.calculatedCost,
          hasRecipe: costInfo.hasRecipe,
          canLoad: costInfo.canLoad,
          costMessage: costInfo.message,
        }
      } catch (error) {
        console.error('Error calculating cost:', error)
        updated[index] = {
          ...updated[index],
          cost: 0,
          hasRecipe: false,
          canLoad: true,
          costMessage: 'Error al calcular costo',
        }
      }
    }

    setSelectedProductsToLoad(updated)
  }

  const handleLoadProducts = async () => {
    if (!selectedEventId || selectedProductsToLoad.length === 0) return

    try {
      const data: LoadProductsDto = {
        products: selectedProductsToLoad
          .filter(p => p.productId && p.initialQty > 0 && p.canLoad !== false)
          .map(({ productId, initialQty, minQty, salePrice, cost }) => ({
            productId,
            initialQty,
            minQty,
            salePrice,
            cost: cost || 0
          }))
      }
      await inventoryMutations.loadProducts.mutateAsync(data)
      setShowLoadProductsDialog(false)
      setSelectedProductsToLoad([])
      toast({
        title: "Productos cargados",
        description: "Los productos se han cargado exitosamente al inventario.",
      })
    } catch (error) {
      console.error('Error loading products:', error)
      const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar los productos. Verifique que el evento tenga los insumos necesarios."
      toast({
        variant: "destructive",
        title: "Error al cargar productos",
        description: errMsg,
      })
    }
  }

  // Load supplies to event
  // Load supplies to event
  const addSupplyToLoad = () => {
    setSelectedSuppliesToLoad([
      ...selectedSuppliesToLoad,
      { supplyId: "", initialQty: 0, minQty: 0, cost: 0 }
    ])
  }

  const removeSupplyToLoad = (index: number) => {
    setSelectedSuppliesToLoad(selectedSuppliesToLoad.filter((_, i) => i !== index))
  }

  const updateSupplyToLoad = (index: number, field: keyof typeof selectedSuppliesToLoad[0], value: string | number) => {
    const updated = [...selectedSuppliesToLoad]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedSuppliesToLoad(updated)
  }

  const handleLoadSupplies = async () => {
    if (!selectedEventId || selectedSuppliesToLoad.length === 0) return

    try {
      const data: LoadSuppliesDto = {
        supplies: selectedSuppliesToLoad.filter(s => s.supplyId && s.initialQty > 0)
      }
      await inventoryMutations.loadSupplies.mutateAsync(data)
      setShowLoadSuppliesDialog(false)
      setSelectedSuppliesToLoad([])
    } catch (error) {
      console.error('Error loading supplies:', error)
    }
  }

  // Inventory Product Edit/Delete handlers
  const openEditProductInventory = (item: EventProductInventory) => {
    setEditingProductInventory(item)
    setProductInventoryForm({
      currentQty: Number(item.currentQty) || 0,
      minQty: Number(item.minQty) || 0,
      cost: Number(item.cost) || 0,
      salePrice: Number(item.salePrice) || 0,
    })
    setShowEditProductInventoryDialog(true)
  }

  const handleUpdateProductInventory = async () => {
    if (!editingProductInventory || !selectedEventId) return

    try {
      // Si tiene receta, no enviar el costo (se calcula automáticamente)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { cost: _cost, ...formWithoutCost } = productInventoryForm
      const data = editingProductInventory.hasRecipe ? formWithoutCost : productInventoryForm

      await inventoryMutations.updateProduct.mutateAsync({
        productId: editingProductInventory.productId,
        data,
      })
      setShowEditProductInventoryDialog(false)
      setEditingProductInventory(null)
      toast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado correctamente.",
      })
    } catch (error) {
      console.error('Error updating product inventory:', error)
      const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al actualizar el producto."
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: errMsg,
      })
    }
  }

  const openDeleteProductInventory = (item: EventProductInventory) => {
    setDeletingProductInventory(item)
    setShowDeleteProductInventoryDialog(true)
  }

  const handleDeleteProductInventory = async () => {
    if (!deletingProductInventory || !selectedEventId) return

    try {
      await inventoryMutations.deleteProduct.mutateAsync(deletingProductInventory.productId)
      setShowDeleteProductInventoryDialog(false)
      setDeletingProductInventory(null)
      toast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado del inventario.",
      })
    } catch (error) {
      console.error('Error deleting product inventory:', error)
      const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al eliminar el producto."
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: errMsg,
      })
    }
  }

  // Inventory Supply Edit/Delete handlers
  const openEditSupplyInventory = (item: EventSupplyInventory) => {
    setEditingSupplyInventory(item)
    setSupplyInventoryForm({
      currentQty: Number(item.currentQty) || 0,
      minQty: Number(item.minQty) || 0,
      cost: Number(item.cost) || 0,
    })
    setShowEditSupplyInventoryDialog(true)
  }

  const handleUpdateSupplyInventory = async () => {
    if (!editingSupplyInventory || !selectedEventId) return

    try {
      await inventoryMutations.updateSupply.mutateAsync({
        supplyId: editingSupplyInventory.supplyId,
        data: supplyInventoryForm,
      })
      setShowEditSupplyInventoryDialog(false)
      setEditingSupplyInventory(null)
      toast({
        title: "Insumo actualizado",
        description: "El insumo se ha actualizado correctamente.",
      })
    } catch (error) {
      console.error('Error updating supply inventory:', error)
      const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al actualizar el insumo."
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: errMsg,
      })
    }
  }

  const openDeleteSupplyInventory = (item: EventSupplyInventory) => {
    setDeletingSupplyInventory(item)
    setShowDeleteSupplyInventoryDialog(true)
  }

  const handleDeleteSupplyInventory = async () => {
    if (!deletingSupplyInventory || !selectedEventId) return

    try {
      await inventoryMutations.deleteSupply.mutateAsync(deletingSupplyInventory.supplyId)
      setShowDeleteSupplyInventoryDialog(false)
      setDeletingSupplyInventory(null)
      toast({
        title: "Insumo eliminado",
        description: "El insumo se ha eliminado del inventario.",
      })
    } catch (error) {
      console.error('Error deleting supply inventory:', error)
      const errMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al eliminar el insumo."
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: errMsg,
      })
    }
  }

  return (
    <main className="flex-1 p-6 space-y-8 bg-black min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Gestión de Inventario
          </h1>
          <p className="text-white/60">
            Administra el inventario por evento y el catálogo de insumos y productos
          </p>
        </div>

        {/* Event Selector */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-lg backdrop-blur-sm">
          <Label htmlFor="event-select" className="text-sm font-medium text-white/80 pl-2">
            Evento:
          </Label>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger id="event-select" className="w-[250px] bg-black/50 border-white/10 text-white focus:ring-offset-0 focus:ring-0">
              <SelectValue placeholder="Selecciona un evento..." />
            </SelectTrigger>
            <SelectContent className="bg-black border-white/20 text-white">
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id} className="focus:bg-white/10 focus:text-white">
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 p-1 rounded-xl h-auto">
          <TabsTrigger
            value="event-products"
            className="data-[state=active]:bg-gradient-blue data-[state=active]:text-white text-white/60 py-2.5 rounded-lg transition-all"
          >
            <Package className="h-4 w-4 mr-2" />
            Inventario Productos
          </TabsTrigger>
          <TabsTrigger
            value="event-supplies"
            className="data-[state=active]:bg-gradient-blue data-[state=active]:text-white text-white/60 py-2.5 rounded-lg transition-all"
          >
            <Box className="h-4 w-4 mr-2" />
            Inventario Insumos
          </TabsTrigger>
          <TabsTrigger
            value="product-catalog"
            className="data-[state=active]:bg-gradient-blue data-[state=active]:text-white text-white/60 py-2.5 rounded-lg transition-all"
          >
            <Layers className="h-4 w-4 mr-2" />
            Catálogo Productos
          </TabsTrigger>
          <TabsTrigger
            value="supply-catalog"
            className="data-[state=active]:bg-gradient-blue data-[state=active]:text-white text-white/60 py-2.5 rounded-lg transition-all"
          >
            <Box className="h-4 w-4 mr-2" />
            Catálogo Insumos
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Event Product Inventory */}
        <TabsContent value="event-products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Inventario de Productos</h2>
            {selectedEventId && (
              <Button
                onClick={() => {
                  setSelectedProductsToLoad([])
                  setShowLoadProductsDialog(true)
                }}
                className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-500 hover:to-blue-300 text-white border-0"
              >
                <Upload className="h-4 w-4 mr-2" />
                Cargar Productos
              </Button>
            )}
          </div>

          {!selectedEventId ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-white/5 border border-white/10 rounded-xl">
              <Package className="h-12 w-12 text-white/20" />
              <p className="text-white/60">Selecciona un evento para ver su inventario</p>
            </div>
          ) : eventProductInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-white/5 border border-white/10 rounded-xl">
              <Package className="h-12 w-12 text-white/20" />
              <p className="text-white/60">No hay productos en el inventario de este evento</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {eventProductInventory.map((item, index) => {
                const stockPercentage = Math.min(100, Math.max(0, (item.currentQty / item.initialQty) * 100))
                const isLowStock = Number(item.currentQty) <= Number(item.minQty)

                return (
                  <Card key={`${item.id}-${index}`} className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border-white/10 backdrop-blur-md hover:from-white/15 hover:to-white/10 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30 cursor-pointer">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-3 border-b border-white/5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                            <Utensils className="h-5 w-5" />
                          </div>
                          <CardTitle className="text-xl font-bold capitalize text-white group-hover:text-blue-400 transition-colors">
                            {item.product.name}
                          </CardTitle>
                        </div>
                        {item.hasRecipe && (
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]">
                            Receta
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-5">
                      {/* Stock Section */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/60 flex items-center gap-2">
                            <Package className="h-4 w-4" /> Stock Disponible
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-lg font-bold",
                              isLowStock ? "text-red-400" : "text-white"
                            )}>
                              {item.currentQty}
                            </span>
                            <span className="text-white/40 text-xs uppercase">/ {item.initialQty}</span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isLowStock ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                            )}
                            style={{ width: `${stockPercentage}%` }}
                          />
                        </div>
                        {isLowStock && (
                          <div className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20 animate-pulse">
                            <AlertTriangle className="h-3 w-3" />
                            Stock crítico (Mín: {item.minQty})
                          </div>
                        )}
                      </div>

                      {/* Financials Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-2 text-white/40 mb-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="text-xs uppercase tracking-wider">Precio Venta</span>
                          </div>
                          <p className="font-bold text-lg text-white">${Number(item.salePrice || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-black/20 rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-2 text-white/40 mb-1">
                            <TrendingUp className="h-3 w-3" />
                            <span className="text-xs uppercase tracking-wider">Costo</span>
                          </div>
                          <p className="font-bold text-lg text-white">${Number(item.cost || 0).toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Margin Footer */}
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <BarChart3 className="h-4 w-4" />
                          <span>Margen de Ganancia</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-0 px-3 py-1 text-sm font-medium">
                          {Number(item.profitMargin || 0).toFixed(1)}%
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t border-white/5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditProductInventory(item)}
                          className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteProductInventory(item)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Event Supply Inventory */}
        <TabsContent value="event-supplies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Inventario de Insumos</h2>
            {selectedEventId && (
              <Button
                onClick={() => {
                  setSelectedSuppliesToLoad([])
                  setShowLoadSuppliesDialog(true)
                }}
                className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-500 hover:to-blue-300 text-white border-0"
              >
                <Upload className="h-4 w-4 mr-2" />
                Cargar Insumos
              </Button>
            )}
          </div>

          {!selectedEventId ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-white/5 border border-white/10 rounded-xl">
              <Box className="h-12 w-12 text-white/20" />
              <p className="text-white/60">Selecciona un evento para ver su inventario</p>
            </div>
          ) : eventSupplyInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-white/5 border border-white/10 rounded-xl">
              <Box className="h-12 w-12 text-white/20" />
              <p className="text-white/60">No hay insumos en el inventario de este evento</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {eventSupplyInventory.map((item, index) => {
                const stockPercentage = Math.min(100, Math.max(0, (item.currentQty / item.initialQty) * 100))
                const isLowStock = Number(item.currentQty) <= Number(item.minQty)

                return (
                  <Card key={`${item.id}-${index}`} className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border-white/10 backdrop-blur-md hover:from-white/15 hover:to-white/10 transition-all duration-300 group hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30 cursor-pointer">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="pb-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                          <Box className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl font-bold capitalize text-white group-hover:text-purple-400 transition-colors">
                          {item.supply.name}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-5">
                      {/* Stock Section */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/60 flex items-center gap-2">
                            <Layers className="h-4 w-4" /> Stock Disponible
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-lg font-bold",
                              isLowStock ? "text-red-400" : "text-white"
                            )}>
                              {item.currentQty}
                            </span>
                            <span className="text-white/40 text-xs uppercase">/ {item.initialQty}</span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isLowStock ? "bg-red-500" : "bg-gradient-to-r from-purple-500 to-pink-500"
                            )}
                            style={{ width: `${stockPercentage}%` }}
                          />
                        </div>
                        {isLowStock && (
                          <div className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20 animate-pulse">
                            <AlertTriangle className="h-3 w-3" />
                            Stock crítico (Mín: {item.minQty})
                          </div>
                        )}
                      </div>

                      {/* Unit Info */}
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Scale className="h-4 w-4" />
                          <span>Unidad de Medida</span>
                        </div>
                        <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 px-3 py-1">
                          {item.supply.unit}
                        </Badge>
                      </div>

                      {/* Cost */}
                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <DollarSign className="h-4 w-4" />
                          <span>Costo por unidad</span>
                        </div>
                        <span className="text-white font-bold">${Number(item.cost || 0).toFixed(2)}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-3 border-t border-white/5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditSupplyInventory(item)}
                          className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteSupplyInventory(item)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Product Catalog */}
        <TabsContent value="product-catalog" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Productos ({allProducts.length})</h2>
            <Button
              onClick={() => {
                resetProductForm()
                setShowProductDialog(true)
              }}
              className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-500 hover:to-blue-300 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 backdrop-blur-md">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/80">Nombre</TableHead>
                  <TableHead className="text-white/80">Receta</TableHead>
                  <TableHead className="text-white/80">Estado</TableHead>
                  <TableHead className="text-right text-white/80">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay productos
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="border-b border-white/5 hover:bg-blue-500/10 transition-colors">
                      <TableCell className="font-medium capitalize text-white">{product.name}</TableCell>
                      <TableCell>
                        {product.hasRecipe ? (
                          <span className="text-muted-foreground text-sm">Sí</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditProduct(product)} className="hover:bg-blue-500/20 hover:text-blue-400">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DeleteConfirmDialog
                            trigger={
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                            title="¿Eliminar producto?"
                            description={`Esto desactivará "${product.name}". Esta acción no se puede deshacer.`}
                            onConfirm={() => handleDeleteProduct(product.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {productsPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                  disabled={productsPage === 1}
                  className="border-white/10 text-white hover:bg-blue-500/20 hover:text-blue-400"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-white">
                  Página {productsPage} de {productsPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProductsPage(p => Math.min(productsPages, p + 1))}
                  disabled={productsPage === productsPages}
                  className="border-white/10 text-white hover:bg-blue-500/20 hover:text-blue-400"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab 4: Supply Catalog */}
        <TabsContent value="supply-catalog" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Insumos ({allSupplies.length})</h2>
            <Button
              onClick={() => {
                resetSupplyForm()
                setShowSupplyDialog(true)
              }}
              className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-500 hover:to-blue-300 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Insumo
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/10 backdrop-blur-md">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/80">Nombre</TableHead>
                  <TableHead className="text-white/80">Unidad</TableHead>

                  <TableHead className="text-white/80">Estado</TableHead>
                  <TableHead className="text-right text-white/80">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay insumos
                    </TableCell>
                  </TableRow>
                ) : (
                  supplies.map((supply) => (
                    <TableRow key={supply.id} className="border-b border-white/5 hover:bg-purple-500/10 transition-colors">
                      <TableCell className="font-medium capitalize text-white">{supply.name}</TableCell>
                      <TableCell className="text-white/80">{supply.unit}</TableCell>
                      <TableCell>
                        <Badge variant={supply.isActive ? "default" : "secondary"}>
                          {supply.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditSupply(supply)} className="hover:bg-purple-500/20 hover:text-purple-400">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DeleteConfirmDialog
                            trigger={
                              <Button variant="ghost" size="sm" className="hover:bg-red-500/20 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            }
                            title="¿Eliminar insumo?"
                            description={`Esto desactivará "${supply.name}". Esta acción no se puede deshacer.`}
                            onConfirm={() => handleDeleteSupply(supply.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {suppliesPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSuppliesPage(p => Math.max(1, p - 1))}
                  disabled={suppliesPage === 1}
                  className="border-white/10 text-white hover:bg-purple-500/20 hover:text-purple-400"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-white">
                  Página {suppliesPage} de {suppliesPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSuppliesPage(p => Math.min(suppliesPages, p + 1))}
                  disabled={suppliesPage === suppliesPages}
                  className="border-white/10 text-white hover:bg-purple-500/20 hover:text-purple-400"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supply Dialog */}
      <Dialog open={showSupplyDialog} onOpenChange={setShowSupplyDialog}>
        <DialogContent className="bg-gradient-to-br from-gray-950 to-black border-white/10">
          <DialogHeader className="border-b border-white/10 pb-4">
            <DialogTitle className="text-xl text-white">{editingSupply ? "Editar Insumo" : "Nuevo Insumo"}</DialogTitle>
            <p className="text-xs text-white/50 mt-1">Define los detalles del insumo para tu inventario</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md rounded-lg p-4 space-y-4">
              <div>
                <Label htmlFor="supply-name" className="text-white/90">Nombre</Label>
                <Input
                  id="supply-name"
                  value={supplyForm.name}
                  onChange={(e) => setSupplyForm({ ...supplyForm, name: e.target.value })}
                  placeholder="Ej: Harina"
                  className="mt-1.5 bg-black/30 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500/50"
                />
              </div>

            </div>
            <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
              <Button variant="outline" onClick={() => setShowSupplyDialog(false)} className="bg-transparent hover:bg-purple-950 border-white/10">
                Cancelar
              </Button>
              <Button onClick={editingSupply ? handleUpdateSupply : handleCreateSupply} className="bg-purple-950 hover:bg-purple-900">
                {editingSupply ? "Guardar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-950 to-black border-white/10">
          <DialogHeader className="border-b border-white/10 pb-4">
            <DialogTitle className="text-xl text-white">{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            <p className="text-xs text-white/50 mt-1">Configura los detalles del producto y su receta</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Basic Info Section */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md rounded-lg p-4 space-y-4">
              <div>
                <Label htmlFor="product-name" className="text-white/90">Nombre del Producto</Label>
                <Input
                  id="product-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Ej: Hamburguesa Completa"
                  className="mt-1.5 bg-black/30 border-white/10 text-white placeholder:text-white/40 focus:border-blue-500/50"
                />
              </div>

            </div>

            {/* Recipe Section */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md rounded-lg p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-recipe"
                  checked={useRecipe}
                  onCheckedChange={(checked) => setUseRecipe(!!checked)}
                  className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <Label htmlFor="use-recipe" className="cursor-pointer text-white/90 text-sm">
                  Este producto tiene receta (asignar insumos)
                </Label>
              </div>

              {useRecipe && (
                <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/90">Insumos de la Receta</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSupplyToRecipe}
                      className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Insumo
                    </Button>
                  </div>

                  {recipeSupplies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 bg-white/5 border border-white/10 rounded-lg">
                      <Layers className="h-10 w-10 text-white/20 mb-2" />
                      <p className="text-sm text-white/60">No hay insumos asignados</p>
                      <p className="text-xs text-white/40 mt-1">Haz clic en &quot;Agregar Insumo&quot; para empezar</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recipeSupplies.map((item, index) => (
                        <div key={index} className="flex gap-2 items-end bg-black/20 p-3 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
                          <div className="flex-1">
                            <Label className="text-xs text-white/70">Insumo</Label>
                            <Select
                              value={item.supplyId}
                              onValueChange={(value) => updateRecipeSupply(index, 'supplyId', value)}
                            >
                              <SelectTrigger className="h-9 mt-1 bg-black/30 border-white/10 text-white focus:border-blue-500/50">
                                <SelectValue placeholder="Seleccionar..." />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-white/20">
                                {allSupplies.map((supply) => (
                                  <SelectItem key={supply.id} value={supply.id} className="text-white focus:bg-white/10">
                                    {supply.name} ({supply.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-32">
                            <Label className="text-xs text-white/70">Cantidad</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.qtyPerUnit}
                              onChange={(e) => updateRecipeSupply(index, 'qtyPerUnit', parseFloat(e.target.value) || 0)}
                              className="h-9 mt-1 bg-black/30 border-white/10 text-white focus:border-blue-500/50"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSupplyFromRecipe(index)}
                            className="h-9 bg-red-500/10 hover:bg-red-500/20 text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
              <Button variant="outline" onClick={() => setShowProductDialog(false)} className="bg-transparent hover:bg-blue-950 border-white/10">
                Cancelar
              </Button>
              <Button onClick={editingProduct ? handleUpdateProduct : handleCreateProduct} className="bg-blue-950 hover:bg-blue-900">
                {editingProduct ? "Guardar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Products Dialog */}
      <Dialog open={showLoadProductsDialog} onOpenChange={setShowLoadProductsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargar Productos al Inventario del Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-white/80 font-medium">
                  Selecciona los productos y configura su inventario inicial
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Los productos con receta calcularán el costo automáticamente
                </p>
              </div>
              <Button type="button" size="sm" onClick={addProductToLoad} className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
                <Plus className="h-4 w-4 mr-1" />
                Agregar Producto
              </Button>
            </div>

            {selectedProductsToLoad.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white/5 border border-white/10 rounded-xl">
                <Package className="h-12 w-12 text-white/20 mb-3" />
                <p className="text-white/60">No hay productos seleccionados</p>
                <p className="text-xs text-white/40 mt-1">Haz clic en &quot;Agregar Producto&quot; para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedProductsToLoad.map((item, index) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const _product = allProducts.find(p => p.id === item.productId)
                  const profitMargin = item.salePrice && item.cost ? (((item.salePrice - item.cost) / item.salePrice) * 100) : 0

                  return (
                    <div key={index} className={cn(
                      "relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border backdrop-blur-md rounded-xl p-4 transition-all duration-300 group",
                      item.canLoad === false ? "border-red-500/30 hover:border-red-500/50" : "border-white/10 hover:border-blue-500/30"
                    )}>
                      {/* Top indicator */}
                      <div className={cn(
                        "absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity",
                        item.canLoad === false ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-blue-500 to-indigo-500"
                      )} />

                      {/* Recipe Badge */}
                      {item.hasRecipe && (
                        <div className="absolute top-2 right-3">
                          <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                            Con Receta
                          </Badge>
                        </div>
                      )}

                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-3">
                          <Label className="text-xs text-white/70 mb-1.5 block">Producto</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateProductToLoad(index, 'productId', value)}
                          >
                            <SelectTrigger className="h-9 bg-black/30 border-white/10 text-white focus:border-blue-500/50">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-white/20">
                              {allProducts
                                .filter(product => {
                                  // Permitir el producto actual de esta fila
                                  if (product.id === item.productId) return true
                                  // Excluir productos ya seleccionados en otras filas
                                  return !selectedProductsToLoad.some(p => p.productId === product.id)
                                })
                                .map((product) => (
                                  <SelectItem key={product.id} value={product.id} className="text-white focus:bg-white/10">
                                    {product.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-white/70 mb-1.5 block">Stock Inicial</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.initialQty}
                            onChange={(e) => updateProductToLoad(index, 'initialQty', parseInt(e.target.value) || 0)}
                            className="h-9 bg-black/30 border-white/10 text-white focus:border-blue-500/50"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-white/70 mb-1.5 block">Stock Mínimo</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.minQty}
                            onChange={(e) => updateProductToLoad(index, 'minQty', parseInt(e.target.value) || 0)}
                            className="h-9 bg-black/30 border-white/10 text-white focus:border-blue-500/50"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-white/70 mb-1.5 block">
                            {item.hasRecipe ? "Costo (Auto)" : "Costo"}
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.cost || 0}
                            onChange={(e) => updateProductToLoad(index, 'cost', parseFloat(e.target.value) || 0)}
                            className={cn(
                              "h-9 bg-black/30 border-white/10 text-white focus:border-blue-500/50",
                              item.hasRecipe && "bg-green-500/10 border-green-500/30"
                            )}
                            disabled={!!item.hasRecipe}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-white/70 mb-1.5 block">Precio Venta</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.salePrice}
                            onChange={(e) => updateProductToLoad(index, 'salePrice', parseFloat(e.target.value) || 0)}
                            className="h-9 bg-black/30 border-white/10 text-white focus:border-blue-500/50"
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => removeProductToLoad(index)}
                            className="h-9 w-9 p-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Profit Margin Indicator */}
                      {item.salePrice > 0 && (item.cost || 0) > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs text-white/50">Margen de ganancia</span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              profitMargin > 30 ? "bg-green-500/10 text-green-400" :
                                profitMargin > 15 ? "bg-yellow-500/10 text-yellow-400" :
                                  "bg-red-500/10 text-red-400"
                            )}
                          >
                            {profitMargin.toFixed(1)}%
                          </Badge>
                        </div>
                      )}

                      {/* Cost Message */}
                      {item.costMessage && (
                        <div className={cn(
                          "mt-3 pt-3 border-t border-white/10 flex items-center gap-2",
                          item.canLoad === false ? "text-red-400" : "text-green-400"
                        )}>
                          {item.canLoad === false ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <TrendingUp className="w-4 h-4" />
                          )}
                          <span className="text-xs">{item.costMessage}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
            }

            <div className="flex justify-end pt-4 gap-2">
              <Button className="bg-transparent hover:bg-blue-950" onClick={() => setShowLoadProductsDialog(false)}>
                Cancelar
              </Button>
              <Button className="bg-blue-950 hover:bg-blue-900"
                onClick={handleLoadProducts}
                disabled={selectedProductsToLoad.length === 0 || selectedProductsToLoad.some(p => p.canLoad === false)}
              >
                Cargar {selectedProductsToLoad.filter(p => p.canLoad !== false).length} Producto(s)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Supplies Dialog */}
      <Dialog open={showLoadSuppliesDialog} onOpenChange={setShowLoadSuppliesDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cargar Insumos al Inventario del Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-white/80 font-medium">
                  Selecciona los insumos y configura su stock inicial
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Define las cantidades base para cada insumo del evento
                </p>
              </div>
              <Button type="button" size="sm" onClick={addSupplyToLoad} className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30">
                <Plus className="h-4 w-4 mr-1" />
                Agregar Insumo
              </Button>
            </div>

            {selectedSuppliesToLoad.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white/5 border border-white/10 rounded-xl">
                <Layers className="h-12 w-12 text-white/20 mb-3" />
                <p className="text-white/60">No hay insumos seleccionados</p>
                <p className="text-xs text-white/40 mt-1">Haz clic en &quot;Agregar Insumo&quot; para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedSuppliesToLoad.map((item, index) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const _supply = allSupplies.find(s => s.id === item.supplyId)

                  return (
                    <div key={index} className="relative overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md rounded-xl p-4 hover:from-white/15 hover:to-white/10 hover:border-purple-500/30 transition-all duration-300 group">
                      {/* Top indicator */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-4">
                          <Label className="text-xs text-white/70 mb-1.5 block">Insumo</Label>
                          <Select
                            value={item.supplyId}
                            onValueChange={(value) => updateSupplyToLoad(index, 'supplyId', value)}
                          >
                            <SelectTrigger className="h-9 bg-black/30 border-white/10 text-white focus:border-purple-500/50">
                              <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent className="bg-black border-white/20">
                              {allSupplies.map((supply) => (
                                <SelectItem key={supply.id} value={supply.id} className="text-white focus:bg-white/10">
                                  {supply.name} ({supply.unit})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-white/70 mb-1.5 block">Stock Inicial</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.initialQty}
                            onChange={(e) => updateSupplyToLoad(index, 'initialQty', parseInt(e.target.value) || 0)}
                            className="h-9 bg-black/30 border-white/10 text-white focus:border-purple-500/50"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-white/70 mb-1.5 block">Stock Mínimo</Label>
                          <Input
                            type="number"
                            min="0"
                            value={item.minQty}
                            onChange={(e) => updateSupplyToLoad(index, 'minQty', parseInt(e.target.value) || 0)}
                            className="h-9 bg-black/30 border-white/10 text-white focus:border-purple-500/50"
                          />
                        </div>
                        <div className="col-span-3">
                          <Label className="text-xs text-white/70 mb-1.5 block">Costo Unitario</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.cost}
                            onChange={(e) => updateSupplyToLoad(index, 'cost', parseFloat(e.target.value) || 0)}
                            className="h-9 bg-black/30 border-white/10 text-white focus:border-purple-500/50"
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => removeSupplyToLoad(index)}
                            className="h-9 w-9 p-0 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
              <Button className="bg-transparent hover:bg-purple-950" onClick={() => setShowLoadSuppliesDialog(false)}>
                Cancelar
              </Button>
              <Button className="bg-purple-950 hover:bg-purple-900"
                onClick={handleLoadSupplies}
                disabled={selectedSuppliesToLoad.length === 0}
              >
                Cargar {selectedSuppliesToLoad.length} Insumo(s)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Inventory Dialog */}
      <Dialog open={showEditProductInventoryDialog} onOpenChange={setShowEditProductInventoryDialog}>
        <DialogContent className="bg-gradient-to-br from-gray-950 to-black border-white/10">
          <DialogHeader className="border-b border-white/10 pb-4">
            <DialogTitle className="text-xl text-white">Editar Producto en Inventario</DialogTitle>
            <p className="text-xs text-white/50 mt-1">
              {editingProductInventory?.product.name}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/90">Stock Actual</Label>
                  <Input
                    type="number"
                    min="0"
                    value={productInventoryForm.currentQty}
                    onChange={(e) => setProductInventoryForm({ ...productInventoryForm, currentQty: parseInt(e.target.value) || 0 })}
                    className="mt-1.5 bg-black/30 border-white/10 text-white focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <Label className="text-white/90">Stock Mínimo</Label>
                  <Input
                    type="number"
                    min="0"
                    value={productInventoryForm.minQty}
                    onChange={(e) => setProductInventoryForm({ ...productInventoryForm, minQty: parseInt(e.target.value) || 0 })}
                    className="mt-1.5 bg-black/30 border-white/10 text-white focus:border-blue-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/90">
                    {editingProductInventory?.hasRecipe ? "Costo (Auto)" : "Costo"}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productInventoryForm.cost}
                    onChange={(e) => setProductInventoryForm({ ...productInventoryForm, cost: parseFloat(e.target.value) || 0 })}
                    className={cn(
                      "mt-1.5 bg-black/30 border-white/10 text-white focus:border-blue-500/50",
                      editingProductInventory?.hasRecipe && "bg-green-500/10 border-green-500/30"
                    )}
                    disabled={!!editingProductInventory?.hasRecipe}
                  />
                </div>
                <div>
                  <Label className="text-white/90">Precio de Venta</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={productInventoryForm.salePrice}
                    onChange={(e) => setProductInventoryForm({ ...productInventoryForm, salePrice: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5 bg-black/30 border-white/10 text-white focus:border-blue-500/50"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
              <Button variant="outline" onClick={() => setShowEditProductInventoryDialog(false)} className="bg-transparent hover:bg-blue-950 border-white/10">
                Cancelar
              </Button>
              <Button onClick={handleUpdateProductInventory} className="bg-blue-950 hover:bg-blue-900">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Supply Inventory Dialog */}
      <Dialog open={showEditSupplyInventoryDialog} onOpenChange={setShowEditSupplyInventoryDialog}>
        <DialogContent className="bg-gradient-to-br from-gray-950 to-black border-white/10">
          <DialogHeader className="border-b border-white/10 pb-4">
            <DialogTitle className="text-xl text-white">Editar Insumo en Inventario</DialogTitle>
            <p className="text-xs text-white/50 mt-1">
              {editingSupplyInventory?.supply.name}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/90">Stock Actual</Label>
                  <Input
                    type="number"
                    min="0"
                    value={supplyInventoryForm.currentQty}
                    onChange={(e) => setSupplyInventoryForm({ ...supplyInventoryForm, currentQty: parseInt(e.target.value) || 0 })}
                    className="mt-1.5 bg-black/30 border-white/10 text-white focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <Label className="text-white/90">Stock Mínimo</Label>
                  <Input
                    type="number"
                    min="0"
                    value={supplyInventoryForm.minQty}
                    onChange={(e) => setSupplyInventoryForm({ ...supplyInventoryForm, minQty: parseInt(e.target.value) || 0 })}
                    className="mt-1.5 bg-black/30 border-white/10 text-white focus:border-purple-500/50"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white/90">Costo por Unidad</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={supplyInventoryForm.cost}
                  onChange={(e) => setSupplyInventoryForm({ ...supplyInventoryForm, cost: parseFloat(e.target.value) || 0 })}
                  className="mt-1.5 bg-black/30 border-white/10 text-white focus:border-purple-500/50"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
              <Button variant="outline" onClick={() => setShowEditSupplyInventoryDialog(false)} className="bg-transparent hover:bg-purple-950 border-white/10">
                Cancelar
              </Button>
              <Button onClick={handleUpdateSupplyInventory} className="bg-purple-950 hover:bg-purple-900">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Product Inventory Confirmation */}
      <DeleteConfirmDialog
        open={showDeleteProductInventoryDialog}
        onOpenChange={setShowDeleteProductInventoryDialog}
        onConfirm={handleDeleteProductInventory}
        title="Eliminar Producto del Inventario"
        description={`¿Estás seguro de que deseas eliminar "${deletingProductInventory?.product.name}" del inventario de este evento?`}
      />

      {/* Delete Supply Inventory Confirmation */}
      <DeleteConfirmDialog
        open={showDeleteSupplyInventoryDialog}
        onOpenChange={setShowDeleteSupplyInventoryDialog}
        onConfirm={handleDeleteSupplyInventory}
        title="Eliminar Insumo del Inventario"
        description={`¿Estás seguro de que deseas eliminar "${deletingSupplyInventory?.supply.name}" del inventario de este evento?`}
      />
    </main >
  )
}
