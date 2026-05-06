"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EscrowStatusBadge } from "./escrow-status-badge"
import { MilestoneTimeline } from "./milestone-timeline"
import { VerificationPanel } from "./verification-panel"
import { ActionPanel } from "./action-panel"
import { DisputePanel } from "./dispute-panel"
import { DollarSign, Calendar, User, Bot } from "lucide-react"
import type { Escrow } from "@/lib/types"
import type { EscrowAction } from "@/lib/escrow"

interface EscrowCardProps {
  escrow: Escrow
  currentUserId: string
  showMilestones?: boolean
  showVerification?: boolean
  showActions?: boolean
  showDispute?: boolean
  onAction?: (escrowId: string, action: EscrowAction, params?: any) => void
  className?: string
}

export function EscrowCard({
  escrow,
  currentUserId,
  showMilestones = true,
  showVerification = true,
  showActions = true,
  showDispute = true,
  onAction,
  className
}: EscrowCardProps) {
  const isClient = currentUserId === escrow.clientId
  const isWorker = currentUserId === escrow.workerId

  const handleAction = (action: EscrowAction, params?: any) => {
    onAction?.(escrow.id, action, params)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{escrow.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              ID: {escrow.id}
            </p>
          </div>
          <EscrowStatusBadge status={escrow.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Amount</p>
              <p className="text-lg font-bold">
                ${escrow.amount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm">
                {escrow.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Client</p>
              <p className="text-sm font-mono">{escrow.clientId}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Worker</p>
              <p className="text-sm font-mono">{escrow.workerId}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Description</p>
          <p className="text-sm">{escrow.description}</p>
        </div>

        {/* Progress Summary */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium">Milestone Progress</p>
            <p className="text-xs text-muted-foreground">
              {escrow.totalMilestonesCompleted} of {escrow.totalMilestones} completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {escrow.totalMilestones > 0
                ? Math.round((escrow.totalMilestonesCompleted / escrow.totalMilestones) * 100)
                : 0
              }%
            </div>
            <div className="w-24 bg-secondary rounded-full h-2 mt-1">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    escrow.totalMilestones > 0
                      ? (escrow.totalMilestonesCompleted / escrow.totalMilestones) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Role Indicator */}
        <div className="flex gap-2">
          {isClient && (
            <Badge variant="outline" className="border-blue-300 text-blue-700">
              You are the Client
            </Badge>
          )}
          {isWorker && (
            <Badge variant="outline" className="border-green-300 text-green-700">
              You are the Worker
            </Badge>
          )}
        </div>

        {/* Conditional Components */}
        {showMilestones && escrow.milestones.length > 0 && (
          <MilestoneTimeline milestones={escrow.milestones} />
        )}

        {showVerification && escrow.verifications.length > 0 && (
          <VerificationPanel
            verifications={escrow.verifications}
            escrowId={escrow.id}
          />
        )}

        {showActions && (
          <ActionPanel
            escrow={escrow}
            currentUserId={currentUserId}
            onAction={handleAction}
          />
        )}

        {showDispute && (
          <DisputePanel
            escrowId={escrow.id}
            disputeReason={escrow.disputeReason}
            disputeResolution={escrow.disputeResolution}
            disputeInitiator={escrow.disputeInitiator}
            isDisputed={escrow.status === "disputed"}
            isResolved={escrow.status === "dispute_resolved"}
            currentUserId={currentUserId}
            onOpenDispute={(reason) => handleAction("open_dispute", {
              disputeReason: reason,
              disputeInitiator: currentUserId
            })}
            onResolveDispute={(resolution) => handleAction("resolve_dispute", {
              resolution,
              arbitratorId: currentUserId
            })}
          />
        )}
      </CardContent>
    </Card>
  )
}