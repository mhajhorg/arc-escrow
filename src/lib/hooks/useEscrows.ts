"use client"

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { escrowApi } from "@/lib/api"
import { Escrow } from "@/lib/types"

const ESCROWS_KEY = ["escrows"]

export function useEscrows() {
  return useQuery({
    queryKey: ESCROWS_KEY,
    queryFn: () => escrowApi.getAll(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useEscrow(id: string) {
  return useQuery({
    queryKey: [...ESCROWS_KEY, id],
    queryFn: () => escrowApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useEscrowsByStatus(status: string) {
  return useQuery({
    queryKey: [...ESCROWS_KEY, "status", status],
    queryFn: async () => {
      const escrows = await escrowApi.getAll()
      return escrows.filter(e => e.status === status)
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useRecentEscrows(limit: number = 5) {
  return useQuery({
    queryKey: [...ESCROWS_KEY, "recent", limit],
    queryFn: async () => {
      const escrows = await escrowApi.getAll()
      return escrows
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, limit)
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateEscrow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Escrow, 'id' | 'createdAt' | 'updatedAt'>) => escrowApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESCROWS_KEY })
    },
  })
}

export function useUpdateEscrow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Escrow> }) =>
      escrowApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ESCROWS_KEY })
      queryClient.invalidateQueries({ queryKey: [...ESCROWS_KEY, id] })
    },
  })
}

export function useDeleteEscrow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => escrowApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESCROWS_KEY })
    },
  })
}
