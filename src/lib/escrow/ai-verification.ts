import type { Milestone } from "@/lib/types"

export interface AiVerificationResult {
  aiScore: number
  status: "passed" | "failed"
  reason?: string
}

/**
 * Run AI verification on a milestone submission
 * 
 * Mock implementation - in production this would call an AI service
 * 
 * @param milestone - The milestone with submission data
 * @returns Verification result with score and status
 */
export function runAiVerification(milestone: Milestone): AiVerificationResult {
  try {
    // Check if submission exists and has files
    if (!milestone.submission) {
      return {
        aiScore: 0,
        status: "failed",
        reason: "No submission found"
      }
    }

    const { files, notes } = milestone.submission

    // Validation logic
    if (!files || files.length === 0) {
      return {
        aiScore: 0,
        status: "failed",
        reason: "No proof files submitted"
      }
    }

    // Mock AI scoring logic
    // In production, this would send files to an AI service for analysis
    let baseScore = 0.8 // Base score if files exist

    // Boost score for multiple proofs
    if (files.length >= 2) {
      baseScore += 0.1
    }

    // Boost score for detailed notes
    if (notes && notes.length > 50) {
      baseScore += 0.05
    }

    // Cap at 1.0
    const aiScore = Math.min(baseScore, 1.0)

    // Pass if score >= 0.8
    const status = aiScore >= 0.8 ? "passed" : "failed"

    return {
      aiScore,
      status,
      reason: status === "failed" ? "Insufficient verification score" : undefined
    }
  } catch (error) {
    console.error("AI verification error:", error)
    return {
      aiScore: 0,
      status: "failed",
      reason: "Verification process failed"
    }
  }
}

/**
 * Check if all milestones in an escrow are approved
 */
export function areAllMilestonesApproved(milestones: Milestone[]): boolean {
  if (milestones.length === 0) return false
  return milestones.every(m => m.status === "approved")
}
