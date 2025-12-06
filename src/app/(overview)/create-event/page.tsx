"use client"

import { useState, useMemo } from "react"
import { Calendar, Plus, Copy, Edit, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import ProtectedRoute from "@/components/ProtectedRoute"
import { useEvents, useEventMutations } from "@/features/events/hooks/useEvents"
import type { Event, CreateEventDto } from "@/features/events/types"
import { useToast } from "@/hooks/use-toast"

export default function EventosDashboard() {
  return (
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <EventosContent />
    </ProtectedRoute>
  )
}

function EventosContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "upcoming" | "completed">("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Form state
  const [formData, setFormData] = useState<CreateEventDto>({
    name: "",
    startDate: "",
    endDate: "",
  })

  const { data: events = [] } = useEvents()
  const { createEvent, updateEvent } = useEventMutations()
  const { toast } = useToast()

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase())

      let eventStatus = "upcoming"
      if (event.isClosed) eventStatus = "completed"
      else if (event.isActive) eventStatus = "active"

      const matchesStatus = statusFilter === "all" || eventStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [events, searchTerm, statusFilter])

  const resetForm = () => {
    setFormData({
      name: "",
      startDate: "",
      endDate: "",
    })
    setEditingEvent(null)
  }

  const handleSubmit = async () => {
    try {
      if (editingEvent) {
        // Update logic
        updateEvent.mutate({ id: editingEvent.id, data: formData }, {
          onSuccess: () => {
            toast({
              title: "Evento actualizado",
              description: `El evento "${formData.name}" ha sido actualizado exitosamente.`,
            })
            setIsCreateDialogOpen(false)
            resetForm()
          },
          onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido al actualizar el evento"
            toast({
              variant: "destructive",
              title: "Error al actualizar evento",
              description: errorMessage,
            })
          }
        })
      } else {
        // Create logic
        createEvent.mutate(formData, {
          onSuccess: () => {
            toast({
              title: "Evento creado",
              description: `El evento "${formData.name}" ha sido creado exitosamente.`,
            })
            setIsCreateDialogOpen(false)
            resetForm()
          },
          onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            const errorMessage = error?.response?.data?.message || error?.message || "Error desconocido al crear el evento"
            toast({
              variant: "destructive",
              title: "Error al crear evento",
              description: errorMessage,
            })
          }
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      name: event.name,
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : "",
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : "",
    })
    setIsCreateDialogOpen(true)
  }

  const handleDuplicate = (eventId: string) => {
    const eventToDuplicate = events.find(e => e.id === eventId)
    if (eventToDuplicate) {
      // Logic to pre-fill form with duplicated data could go here
      // For now just console log or implement if backend supports duplicate endpoint
      console.log("Duplicate feature pending backend support")
    }
  }

  const getStatusColor = (event: Event) => {
    if (event.isClosed) return "bg-gray-500/20 text-gray-400 border-gray-500/50"
    if (event.isActive) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
    return "bg-blue-500/20 text-blue-400 border-blue-500/50"
  }

  const getStatusLabel = (event: Event) => {
    if (event.isClosed) return "Completado"
    if (event.isActive) return "Activo"
    return "Próximo"
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Gestión de Eventos</h1>
            <p className="text-white/60 mt-1">Administra eventos y su inventario inicial</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1E2C6D] hover:bg-[#1E2C6D]/90 text-white">
                <Plus className="h-4 w-4" />
                Crear Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-black border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  {editingEvent
                    ? "Modifica los detalles del evento"
                    : "Configura un nuevo evento"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* General Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Información General</h3>
                  <div className="space-y-2">
                    <Label className="text-white">Nombre del Evento</Label>
                    <Input
                      placeholder="Ej: Evento Corporativo - Enero 2025"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Fecha Inicio</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Fecha Fin</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    resetForm()
                  }}
                  className="border-white/20 text-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !formData.name ||
                    !formData.startDate ||
                    !formData.endDate ||
                    createEvent.isPending
                  }
                  className="bg-gradient-blue text-white"
                >
                  {createEvent.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Procesando...
                    </span>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {editingEvent ? "Guardar Cambios" : "Crear Evento"}
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: "all" | "active" | "upcoming" | "completed") => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="upcoming">Próximos</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <Card
              key={`event-card-${event.id}`}
              className="bg-white/5 backdrop-blur-md border-white/20 hover:bg-white/10 transition-colors"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-white text-lg truncate">{event.name}</CardTitle>
                    <CardDescription className="text-white/60 flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      {event.startDate ? new Date(event.startDate).toLocaleDateString("es-AR") : "Sin fecha"}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(event)}>{getStatusLabel(event)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(event)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(event.id)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy className="h-3 w-3" />
                      Duplicar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="bg-white/5 backdrop-blur-md border-white/20">
            <CardContent className="py-12">
              <div className="text-center space-y-2">
                <Calendar className="h-12 w-12 text-white/40 mx-auto" />
                <p className="text-white/60">No se encontraron eventos</p>
                <p className="text-sm text-white/40">Crea tu primer evento para comenzar</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
