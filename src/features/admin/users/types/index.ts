export interface UserRole {
    role: string;
    assignedAt: string;
}

export interface User {
    id: string;
    userName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    userRoles: UserRole[];
}

export interface CreateUserDto {
    userName: string;
    password?: string;
    roleId: string;
}

export interface UpdateUserDto {
    userName?: string;
    password?: string;
    isActive?: boolean;
    roleId?: string;
}

export interface UserFilters {
    isActive?: boolean;
    limit?: number;
    offset?: number;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
}
