// User model for authentication and profile
export interface User {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
}

// User stored in localStorage (without password)
export interface AuthUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Registration data
export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
