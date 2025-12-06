"use client"

import { useState } from "react"
import { useUsers } from "@/features/users/hooks/useUsers"
import { useUserMutations } from "@/features/users/hooks/useUserMutations"
import { useRoles } from "@/features/users/hooks/useRoles"
import type { User, CreateUserDto } from "@/features/users/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { UserPlus, Shield, ChefHat, CreditCard, Lock, Power, PowerOff, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UserManagement() {
    const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined)
    const [searchTerm, setSearchTerm] = useState("")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const { toast } = useToast()

    // Form states
    const [newUser, setNewUser] = useState<CreateUserDto>({
        userName: "",
        password: "",
        roleId: "",
    })
    const [newPassword, setNewPassword] = useState("")

    // Hooks
    const { data: users = [], isLoading } = useUsers({ isActive: filterActive })
    const { data: roles = [] } = useRoles()
    const { createUser, toggleActiveUser, resetPassword } = useUserMutations()

    const handleCreateUser = () => {
        if (!newUser.userName || !newUser.password || !newUser.roleId) {
            toast({
                title: "Campos incompletos",
                description: "Por favor complete todos los campos",
                variant: "destructive",
            })
            return
        }

        // Validar contraseña robusta
        const passwordRegex = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
        if (newUser.password && (newUser.password.length < 6 || !passwordRegex.test(newUser.password))) {
            toast({
                title: "Contraseña inválida",
                description: "La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número",
                variant: "destructive",
            })
            return
        }

        createUser.mutate(newUser, {
            onSuccess: () => {
                toast({
                    title: "Usuario creado",
                    description: "El usuario ha sido creado exitosamente",
                })
                setShowCreateDialog(false)
                setNewUser({ userName: "", password: "", roleId: "" })
            },
            onError: (error: Error) => {
                toast({
                    title: "Error",
                    description: error.message || "No se pudo crear el usuario",
                    variant: "destructive",
                })
            }
        })
    }

    const handleToggleActive = (user: User) => {
        toggleActiveUser.mutate({ id: user.id, isActive: !user.isActive }, {
            onSuccess: () => {
                toast({
                    title: user.isActive ? "Usuario desactivado" : "Usuario activado",
                    description: `El usuario ha sido ${user.isActive ? 'desactivado' : 'activado'} exitosamente`,
                })
            },
            onError: (error: Error) => {
                toast({
                    title: "Error",
                    description: error.message || "No se pudo cambiar el estado del usuario",
                    variant: "destructive",
                })
            }
        })
    }

    const handleResetPassword = () => {
        if (!selectedUser || !newPassword) {
            toast({
                title: "Campos incompletos",
                description: "Por favor ingrese una contraseña",
                variant: "destructive",
            })
            return
        }

        // Validar contraseña robusta
        const passwordRegex = /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
        if (newPassword.length < 6 || !passwordRegex.test(newPassword)) {
            toast({
                title: "Contraseña inválida",
                description: "La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número",
                variant: "destructive",
            })
            return
        }

        resetPassword.mutate({ id: selectedUser.id, newPassword }, {
            onSuccess: () => {
                toast({
                    title: "Contraseña blanqueada",
                    description: "La contraseña ha sido blanqueada exitosamente",
                })
                setShowPasswordDialog(false)
                setNewPassword("")
                setSelectedUser(null)
            },
            onError: (error: Error) => {
                toast({
                    title: "Error",
                    description: error.message || "No se pudo blanquear la contraseña",
                    variant: "destructive",
                })
            }
        })
    }

    const filteredUsers = users.filter((user) => user.userName.toLowerCase().includes(searchTerm.toLowerCase()))

    const getRoleIcon = (roleName: string) => {
        const normalizedRole = roleName.toLowerCase();
        if (normalizedRole.includes("admin")) return <Shield className="h-4 w-4" />;
        if (normalizedRole.includes("caj")) return <CreditCard className="h-4 w-4" />;
        if (normalizedRole.includes("cocin")) return <ChefHat className="h-4 w-4" />;
        return <Shield className="h-4 w-4" />;
    }

    const getRoleBadgeColor = (roleName: string) => {
        const normalizedRole = roleName.toLowerCase();
        if (normalizedRole.includes("admin")) return "bg-[#1E2C6D] text-white";
        if (normalizedRole.includes("caj")) return "bg-[#D9251C] text-white";
        if (normalizedRole.includes("cocin")) return "bg-gradient-to-r from-[#1E2C6D] to-[#D9251C] text-white";
        return "bg-gray-500 text-white";
    }

    const activeUsers = users.filter((u) => u.isActive).length
    const inactiveUsers = users.filter((u) => !u.isActive).length

    return (
        <div className="min-h-screen bg-black text-white p-6">
            {/* Header con estadísticas */}
            <div className="mb-8" >
                <div className="flex items-center justify-between mb-6">
                    <div className="mb-4">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Gestión de Usuarios
                        </h1>
                        <p className="text-white/60 mt-2">Administra usuarios, roles y permisos del sistema</p>
                    </div>

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-[#1E2C6D] to-[#D9251C] text-white hover:opacity-90">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Crear Usuario
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black border-white/20 text-white">
                            <DialogHeader>
                                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                                <DialogDescription className="text-white/60">
                                    Complete los datos para crear un nuevo usuario en el sistema
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <Label htmlFor="userName">Nombre de Usuario</Label>
                                    <Input
                                        id="userName"
                                        placeholder="usuario123"
                                        value={newUser.userName}
                                        onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                                        className="bg-white/5 border-white/20 text-white"
                                    />
                                    <p className="text-xs text-white/40 mt-1">El nombre de usuario no se puede cambiar después</p>
                                </div>

                                <div>
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Password123"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="bg-white/5 border-white/20 text-white"
                                    />
                                    <p className="text-xs text-white/40 mt-1">
                                        Mínimo 6 caracteres, debe incluir mayúscula, minúscula y número
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="role">Rol</Label>
                                    <Select value={newUser.roleId} onValueChange={(value) => setNewUser({ ...newUser, roleId: value })}>
                                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                                            <SelectValue placeholder="Seleccionar rol" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-black border-white/20 text-white">
                                            {roles.map((role) => (
                                                <SelectItem key={role.id} value={role.id} className="hover:bg-white/10">
                                                    <div className="flex items-center gap-2">
                                                        {getRoleIcon(role.name)}
                                                        <span className="capitalize">{role.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleCreateUser}
                                    disabled={createUser.isPending}
                                    className="flex-1 bg-gradient-to-r from-[#1E2C6D] to-[#D9251C] text-white"
                                >
                                    {createUser.isPending ? "Creando..." : "Crear Usuario"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Cards de estadísticas */}
                <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
                    <Card className="bg-white/5 border-white/20 backdrop-blur-xl p-6 w-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/60 text-sm">Total Usuarios</p>
                                <p className="text-3xl font-bold mt-1">{users.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-gradient-to-br from-[#1E2C6D] to-[#D9251C] rounded-xl flex items-center justify-center">
                                <UserPlus className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white/5 border-white/20 backdrop-blur-xl p-6 w-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/60 text-sm">Activos</p>
                                <p className="text-3xl font-bold mt-1">{activeUsers}</p>
                            </div>
                            <div className="h-12 w-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center">
                                <Power className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white/5 border-white/20 backdrop-blur-xl p-6 w-full">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/60 text-sm">Inactivos</p>
                                <p className="text-3xl font-bold mt-1">{inactiveUsers}</p>
                            </div>
                            <div className="h-12 w-12 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center">
                                <PowerOff className="h-6 w-6 text-red-500" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <Card className="bg-white/5 border-white/20 backdrop-blur-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input
                            placeholder="Buscar por nombre de usuario..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-white/5 border-white/20 text-white"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={filterActive === undefined ? "default" : "outline"}
                            onClick={() => setFilterActive(undefined)}
                            className={
                                filterActive === undefined
                                    ? "bg-gradient-to-r from-[#1E2C6D] to-[#D9251C] text-white"
                                    : "border-white/20 text-white hover:bg-white/10"
                            }
                        >
                            Todos
                        </Button>
                        <Button
                            variant={filterActive === true ? "default" : "outline"}
                            onClick={() => setFilterActive(true)}
                            className={
                                filterActive === true ? "bg-green-500 text-white" : "border-white/20 text-white hover:bg-white/10"
                            }
                        >
                            Activos
                        </Button>
                        <Button
                            variant={filterActive === false ? "default" : "outline"}
                            onClick={() => setFilterActive(false)}
                            className={
                                filterActive === false ? "bg-red-500 text-white" : "border-white/20 text-white hover:bg-white/10"
                            }
                        >
                            Inactivos
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Tabla de usuarios */}
            <Card className="bg-white/5 border-white/20 backdrop-blur-xl overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead className="text-white/80">Usuario</TableHead>
                            <TableHead className="text-white/80">Rol</TableHead>
                            <TableHead className="text-white/80">Estado</TableHead>
                            <TableHead className="text-white/80">Fecha de Creación</TableHead>
                            <TableHead className="text-white/80 text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-white/60">
                                    Cargando usuarios...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-white/60">
                                    No se encontraron usuarios
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-medium text-white">{user.userName}</TableCell>
                                    <TableCell>
                                        {user.userRoles && user.userRoles.length > 0 ? (
                                            <Badge className={`${getRoleBadgeColor(user.userRoles[0].role.name)} capitalize`}>
                                                <span className="flex items-center gap-2">
                                                    {getRoleIcon(user.userRoles[0].role.name)}
                                                    {user.userRoles[0].role.name}
                                                </span>
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-white/60 border-white/20">Sin Rol</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={user.isActive ? "default" : "secondary"}
                                            className={
                                                user.isActive
                                                    ? "bg-green-500/20 border border-green-500/30 text-green-500"
                                                    : "bg-red-500/20 border border-red-500/30 text-red-500"
                                            }
                                        >
                                            {user.isActive ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-white/60">
                                        {new Date(user.createdAt).toLocaleDateString("es-AR", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.isActive ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleActive(user)}
                                                    disabled={toggleActiveUser.isPending}
                                                    className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                                                >
                                                    <PowerOff className="h-4 w-4 mr-1" />
                                                    Desactivar
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleToggleActive(user)}
                                                    disabled={toggleActiveUser.isPending}
                                                    className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                                                >
                                                    <Power className="h-4 w-4 mr-1" />
                                                    Activar
                                                </Button>
                                            )}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user)
                                                    setShowPasswordDialog(true)
                                                }}
                                                className="border-white/20 text-white hover:bg-white/10"
                                            >
                                                <Lock className="h-4 w-4 mr-1" />
                                                Blanquear
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Dialog para blanquear contraseña */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="bg-black border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle>Blanquear Contraseña</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Ingrese la nueva contraseña para el usuario <strong>{selectedUser?.userName}</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="newPassword">Nueva Contraseña</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Password123"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-white/5 border-white/20 text-white"
                            />
                            <p className="text-xs text-white/40 mt-1">
                                Mínimo 6 caracteres, debe incluir mayúscula, minúscula y número
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowPasswordDialog(false)
                                setNewPassword("")
                                setSelectedUser(null)
                            }}
                            className="flex-1 border-white/20 text-white hover:bg-white/10"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleResetPassword}
                            disabled={resetPassword.isPending}
                            className="flex-1 bg-gradient-to-r from-[#1E2C6D] to-[#D9251C] text-white"
                        >
                            {resetPassword.isPending ? "Blanqueando..." : "Blanquear Contraseña"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
