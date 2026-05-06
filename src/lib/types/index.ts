// Worker types
export type WorkerType = "human" | "agent"
export type WorkerStatus = "active" | "inactive" | "suspended"

export interface Worker {
  id: string
  name: string
  type: WorkerType
  status: WorkerStatus
  reputation: number
  completedJobs: number
  successRate: number
  specialization: string
  avatar?: string
  walletAddress?: string
  joinedAt: Date
  totalEarnings: number
}

// Milestone types
export type MilestoneStatus = "pending" | "in-progress" | "completed" | "disputed" | "pending_verification" | "awaiting_client_review" | "approved" | "rejected"

export interface MilestoneSubmission {
  files: File[]
  notes: string
  submittedAt: Date
}

export interface Milestone {
  id: string
  escrowId: string
  title: string
  description: string
  order: number
  status: MilestoneStatus
  amount: number
  dueDate: Date
  completedAt?: Date
  proofUrl?: string
  notes?: string
  submission?: MilestoneSubmission
  aiScore?: number
  clientReviewedAt?: Date
  clientReviewNotes?: string
}

// Verification types
export type VerificationStatus = "pending" | "verified" | "failed" | "disputed"

export interface Verification {
  id: string
  escrowId: string
  milestoneId: string
  status: VerificationStatus
  aiScore: number
  humanReview?: boolean
  reviewedBy?: string
  reviewedAt?: Date
  notes?: string
  createdAt: Date
}

// Escrow types
import { EscrowStatus } from "@/lib/escrow"

export interface Escrow {
  id: string
  title: string
  description: string
  status: EscrowStatus
  clientId: string
  workerId: string
  amount: number
  currency: "USD" | "ETH" | "USDC"
  createdAt: Date
  updatedAt: Date
  startDate?: Date
  endDate?: Date
  milestones: Milestone[]
  verifications: Verification[]
  totalMilestonesCompleted: number
  totalMilestones: number
  // Dispute fields
  disputeReason?: string
  disputeResolution?: string
  disputeInitiator?: string
  cancelledReason?: string
}

// Dashboard stats
export interface DashboardStats {
  totalEscrows: number
  activeEscrows: number
  completedEscrows: number
  totalValue: number
  milestonesCompleted: number
  totalMilestones: number
  averageVerificationScore: number
  activeWorkers: number
}

// Activity log
export type ActivityType = 
  | "escrow_created" 
  | "escrow_funded" 
  | "milestone_completed" 
  | "verification_passed" 
  | "funds_released" 
  | "dispute_opened"
  | "dispute_resolved"

export interface Activity {
  id: string
  type: ActivityType
  escrowId: string
  title: string
  description: string
  actor: string
  timestamp: Date
  metadata?: Record<string, unknown>
}
