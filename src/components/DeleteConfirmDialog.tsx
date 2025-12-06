"use client"

import { ReactNode } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteConfirmDialogProps {
    trigger?: ReactNode
    title: string
    description: string
    onConfirm: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function DeleteConfirmDialog({
    trigger,
    title,
    description,
    onConfirm,
    open,
    onOpenChange,
}: DeleteConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
            <AlertDialogContent className="bg-gradient-to-br from-gray-950 to-black border-white/10">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/60">{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 text-white hover:bg-red-700"
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
