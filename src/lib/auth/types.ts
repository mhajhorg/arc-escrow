/**
 * Authentication Types
 * Frontend-only auth models for role-based access control
 */

export type UserRole = "client" | "worker" | "agent"

export interface AuthUser {
  id: string
  role: UserRole
  walletAddress: string
  name: string
  email?: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  selectedRole: UserRole | null
}

export interface AuthContextType extends AuthState {
  login(user: AuthUser): Promise<void>
  logout(): Promise<void>
  selectRole(role: UserRole): void
  updateUser(user: Partial<AuthUser>): void
}
