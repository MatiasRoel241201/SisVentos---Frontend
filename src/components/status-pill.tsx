import { cn } from "@/lib/utils"

type StatusType = "pending" | "in_progress" | "completed" | "delivered"

type StatusPillProps = {
  status: string
}

export function StatusPill({ status }: StatusPillProps) {
  // Normalizamos el estado recibido del backend
  const normalizedStatus = (() => {
    const upperStatus = status.toUpperCase()
    switch (upperStatus) {
      case "PENDING":
      case "PENDIENTE":
        return "pending"
      case "IN_PROGRESS":
      case "EN_PREPARACION":
        return "in_progress"
      case "COMPLETED":
      case "COMPLETADO":
        return "completed"
      case "DELIVERED":
      case "ENTREGADO":
        return "delivered"
      default:
        return "pending"
    }
  })() as StatusType

  const statusConfig: Record<StatusType, { label: string; color: string }> = {
    pending: {
      label: "Pendiente",
      color: "bg-red-950/30 text-red-400 border border-red-800",
    },
    in_progress: {
      label: "En Preparación",
      color: "bg-yellow-950/30 text-yellow-400 border border-yellow-800",
    },
    completed: {
      label: "Listo para Retirar",
      color: "bg-green-950/30 text-green-400 border border-green-800",
    },
    delivered: {
      label: "Entregado",
      color: "bg-blue-950/30 text-blue-400 border border-blue-800",
    },
  }

  const config = statusConfig[normalizedStatus]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all",
        config.color
      )}
    >
      {config.label}
    </span>
  )
}
