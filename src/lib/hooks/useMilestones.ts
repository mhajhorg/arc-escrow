"use client"

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { milestoneApi, escrowApi } from "@/lib/api"
import { Milestone, MilestoneSubmission } from "@/lib/types"
import { runAiVerification, areAllMilestonesApproved } from "@/lib/escrow/ai-verification"

const MILESTONES_KEY = ["milestones"]

export function useMilestones(escrowId: string) {
  return useQuery({
    queryKey: [...MILESTONES_KEY, escrowId],
    queryFn: async () => {
      const milestones = await milestoneApi.getAll()
      return milestones.filter(m => m.escrowId === escrowId)
    },
    enabled: !!escrowId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useMilestone(id: string) {
  return useQuery({
    queryKey: [...MILESTONES_KEY, "detail", id],
    queryFn: () => milestoneApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Milestone, 'id'>) => milestoneApi.create(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: [...MILESTONES_KEY, data.escrowId],
      })
    },
  })
}

export function useUpdateMilestoneStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const milestone = await milestoneApi.getById(id)
      if (!milestone) throw new Error("Milestone not found")
      return milestoneApi.update(id, { status: status as any })
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: MILESTONES_KEY })
      // Also invalidate the specific milestone
      queryClient.invalidateQueries({ queryKey: [...MILESTONES_KEY, "detail", id] })
    },
  })
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Milestone> }) =>
      milestoneApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: MILESTONES_KEY })
      queryClient.invalidateQueries({ queryKey: [...MILESTONES_KEY, "detail", id] })
    },
  })
}

/**
 * Hook for submitting a milestone with files and notes
 */
export function useSubmitMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ 
      milestoneId, 
      files, 
      notes 
    }: { 
      milestoneId: string
      files: File[]
      notes: string 
    }) => {
      const milestone = await milestoneApi.getById(milestoneId)
      if (!milestone) throw new Error("Milestone not found")

      // Update milestone with submission data
      const submission: MilestoneSubmission = {
        files,
        notes,
        submittedAt: new Date()
      }

      // Run AI verification
      const updatedMilestone = { ...milestone, submission }
      const verificationResult = runAiVerification(updatedMilestone)

      // Update milestone status and verification score
      const update = {
        submission,
        status: verificationResult.status === "passed" ? "awaiting_client_review" : "pending_verification",
        aiScore: verificationResult.aiScore
      }

      return milestoneApi.update(milestoneId, update)
    },
    onSuccess: (_, { milestoneId }) => {
      queryClient.invalidateQueries({ queryKey: MILESTONES_KEY })
      queryClient.invalidateQueries({ queryKey: [...MILESTONES_KEY, "detail", milestoneId] })
      // Invalidate dashboard stats as well
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}

/**
 * Hook for client to approve a milestone
 */
export function useApproveMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ 
      milestoneId, 
      escrowId,
      notes 
    }: { 
      milestoneId: string
      escrowId: string
      notes?: string 
    }) => {
      const milestone = await milestoneApi.getById(milestoneId)
      if (!milestone) throw new Error("Milestone not found")

      return milestoneApi.update(milestoneId, {
        status: "approved",
        clientReviewedAt: new Date(),
        clientReviewNotes: notes
      })
    },
    onSuccess: async (_, { milestoneId, escrowId }) => {
      queryClient.invalidateQueries({ queryKey: MILESTONES_KEY })
      queryClient.invalidateQueries({ queryKey: [...MILESTONES_KEY, escrowId] })
      queryClient.invalidateQueries({ queryKey: [...MILESTONES_KEY, "detail", milestoneId] })
      queryClient.invalidateQueries({ queryKey: ["escrows"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })

      // Check for escrow auto-release
      try {
        const milestones = await milestoneApi.getAll()
        const escrowMilestones = milestones.filter(m => m.escrowId === escrowId)
        const allApproved = escrowMilestones.every(m => m.status === "approved")

        if (allApproved && escrowMilestones.length > 0) {
          console.log(`All milestones approved for escrow ${escrowId} - triggering auto-release`)
          // In a real app, this would trigger the escrow state machine
          // For now, we just invalidate to refresh the UI
        }
      } catch (error) {
        console.error("Failed to check escrow auto-release:", error)
      }
    },
  })
}

/**
 * Hook for client to reject a milestone
 */
export function useRejectMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ 
      milestoneId, 
      escrowId,
      notes 
    }: { 
      milestoneId: string
      escrowId: string
      notes: string 
    }) => {
      const milestone = await milestoneApi.getById(milestoneId)
      if (!milestone) throw new Error("Milestone not found")

      return milestoneApi.update(milestoneId, {
        status: "rejected",
        clientReviewedAt: new Date(),
        clientReviewNotes: notes
      })
    },
    onSuccess: (_, { milestoneId, escrowId }) => {
      queryClient.invalidateQueries({ queryKey: MILESTONES_KEY })
      queryClient.invalidateQueries({ queryKey: [...MILESTONES_KEY, escrowId] })
      queryClient.invalidateQueries({ queryKey: [...MILESTONES_KEY, "detail", milestoneId] })
      queryClient.invalidateQueries({ queryKey: ["escrows"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}

/**
 * Hook for client to dispute a milestone
 */
export function useDisputeMilestone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ 
      milestoneId, 
      escrowId,
      reason 
    }: { 
      milestoneId: string
      escrowId: string
      reason: string 
    }) => {
      const milestone = await milestoneApi.getById(milestoneId)
      if (!milestone) throw new Error("Milestone not found")

      return milestoneApi.update(milestoneId, {
        status: "disputed",
        clientReviewedAt: new Date(),
        clientReviewNotes: reason
      })
    },
    onSuccess: (_, { milestoneId, escrowId }) => {
      queryClient.invalidateQueries({ queryKey: MILESTONES_KEY })
      queryClient.invalidateQueries({ queryKey: [...MILESTONES_KEY, escrowId] })
      queryClient.invalidateQueries({ queryKey: [...MILESTONES_KEY, "detail", milestoneId] })
      queryClient.invalidateQueries({ queryKey: ["escrows"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })
    },
  })
}

export function useInvalidateMilestones() {
  const queryClient = useQueryClient()
  return (escrowId?: string) => {
    if (escrowId) {
      queryClient.invalidateQueries({
        queryKey: [...MILESTONES_KEY, escrowId],
      })
    } else {
      queryClient.invalidateQueries({ queryKey: MILESTONES_KEY })
    }
  }
}

/**
 * Hook to check and trigger escrow auto-release when all milestones are approved
 */
export function useEscrowAutoRelease() {
  const queryClient = useQueryClient()

  const checkAndReleaseEscrow = async (escrowId: string) => {
    try {
      // Get all milestones for the escrow
      const milestones = await milestoneApi.getAll()
      const escrowMilestones = milestones.filter(m => m.escrowId === escrowId)

      // Check if all milestones are approved
      const allApproved = escrowMilestones.every(m => m.status === "approved")

      if (allApproved && escrowMilestones.length > 0) {
        // Get the escrow
        const escrows = await escrowApi.getAll()
        const escrow = escrows.find(e => e.id === escrowId)

        if (escrow && escrow.status === "in_progress") {
          // Trigger escrow release
          console.log(`Auto-releasing escrow ${escrowId} - all milestones approved`)

          // In a real app, this would call the escrow state machine
          // For now, we'll just log and invalidate queries
          queryClient.invalidateQueries({ queryKey: ["escrows"] })
          queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })

          return true
        }
      }

      return false
    } catch (error) {
      console.error("Failed to check escrow auto-release:", error)
      return false
    }
  }

  return { checkAndReleaseEscrow }
}
