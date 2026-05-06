/**
 * Authentication Context
 * Manages user authentication state and role-based access
 */

"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import type { AuthUser, AuthContextType, UserRole } from "./types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "arc_escrow_auth"
const ROLE_STORAGE_KEY = "arc_escrow_role"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  // Restore auth from storage on mount
  useEffect(() => {
    const restoreAuth = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        const storedRole = localStorage.getItem(ROLE_STORAGE_KEY)
        
        if (stored) {
          const user = JSON.parse(stored)
          setUser(user)
          setSelectedRole(storedRole as UserRole)
        } else if (process.env.NODE_ENV === "development") {
          // Mock authenticated user for development
          const mockUser: AuthUser = {
            id: "user-1",
            email: "dev@example.com",
            name: "Development User",
            role: "client",
            walletAddress: "0x1234567890abcdef"
          }
          setUser(mockUser)
          setSelectedRole("client")
          // Don't persist mock user to localStorage to avoid confusion
        }
      } catch (error) {
        console.error("Failed to restore auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    restoreAuth()
  }, [])

  const login = useCallback(async (newUser: AuthUser) => {
    setIsLoading(true)
    try {
      // Simulate login delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      setUser(newUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      // Simulate logout delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      setUser(null)
      setSelectedRole(null)
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(ROLE_STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const selectRole = useCallback((role: UserRole) => {
    setSelectedRole(role)
    localStorage.setItem(ROLE_STORAGE_KEY, role)
  }, [])

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    if (!user) return
    
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
  }, [user])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    selectedRole,
    login,
    logout,
    selectRole,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
