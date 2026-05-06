"use client"

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { verificationApi } from "@/lib/api"
import { Verification } from "@/lib/types"

const VERIFICATION_KEY = ["verification"]

export function useVerificationsByEscrow(escrowId: string) {
  return useQuery({
    queryKey: [...VERIFICATION_KEY, "escrow", escrowId],
    queryFn: async () => {
      const verifications = await verificationApi.getAll()
      return verifications.filter(v => v.escrowId === escrowId)
    },
    enabled: !!escrowId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useVerificationByMilestone(milestoneId: string) {
  return useQuery({
    queryKey: [...VERIFICATION_KEY, "milestone", milestoneId],
    queryFn: async () => {
      const verifications = await verificationApi.getAll()
      return verifications.filter(v => v.milestoneId === milestoneId)
    },
    enabled: !!milestoneId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useVerifyMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      escrowId,
      milestoneId,
      aiScore,
      humanReview = false,
      reviewedBy,
      notes,
    }: {
      escrowId: string
      milestoneId: string
      aiScore: number
      humanReview?: boolean
      reviewedBy?: string
      notes?: string
    }) => {
      const verification: Omit<Verification, 'id' | 'createdAt'> = {
        escrowId,
        milestoneId,
        status: aiScore >= 0.8 ? "verified" : "failed",
        aiScore,
        humanReview,
        reviewedBy,
        reviewedAt: new Date(),
        notes,
      }
      return verificationApi.create(verification)
    },
    onSuccess: (_, { escrowId, milestoneId }) => {
      queryClient.invalidateQueries({
        queryKey: [...VERIFICATION_KEY, "escrow", escrowId],
      })
      queryClient.invalidateQueries({
        queryKey: [...VERIFICATION_KEY, "milestone", milestoneId],
      })
    },
  })
}

export function useCreateVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Verification, 'id' | 'createdAt'>) => verificationApi.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: [...VERIFICATION_KEY, "escrow", data.escrowId],
      })
      queryClient.invalidateQueries({
        queryKey: [...VERIFICATION_KEY, "milestone", data.milestoneId],
      })
    },
  })
}

export function useUpdateVerification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Verification> }) =>
      verificationApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: VERIFICATION_KEY })
    },
  })
}
