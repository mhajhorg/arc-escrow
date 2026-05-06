"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Play,
  CheckCircle,
  Shield,
  Send,
  AlertTriangle,
  Scale,
  X
} from "lucide-react"
import { useEscrowState, EscrowStateMachine, type EscrowAction } from "@/lib/escrow"
import type { Escrow } from "@/lib/types"

interface ActionPanelProps {
  escrow: Escrow
  currentUserId: string
  onAction?: (action: EscrowAction, params?: any) => void
  className?: string
}

export function ActionPanel({ escrow, currentUserId, onAction, className }: ActionPanelProps) {
  const {
    canTransition,
    fundEscrow,
    startWork,
    requestVerification,
    verifyEscrow,
    releaseFunds,
    openDispute,
    resolveDispute,
    cancelEscrow
  } = useEscrowState(escrow.id)

  const isClient = currentUserId === escrow.clientId
  const isWorker = currentUserId === escrow.workerId

  const getActionButton = (
    action: EscrowAction,
    label: string,
    icon: React.ReactNode,
    variant: "default" | "secondary" | "destructive" | "outline" = "default",
    params?: any
  ) => {
    const validation = canTransition(action, params)
    const isEnabled = validation.valid

    return (
      <Button
        key={action}
        variant={variant}
        size="sm"
        disabled={!isEnabled}
        onClick={() => onAction?.(action, params)}
        className="flex items-center gap-2"
      >
        {icon}
        {label}
        {!isEnabled && (
          <Badge variant="outline" className="ml-2 text-xs">
            Blocked
          </Badge>
        )}
      </Button>
    )
  }

  const getAvailableActions = () => {
    const actions = []

    // Client actions
    if (isClient) {
      if (canTransition("fund").valid) {
        actions.push(
          getActionButton(
            "fund",
            "Fund Escrow",
            <DollarSign className="h-4 w-4" />,
            "default"
          )
        )
      }

      if (canTransition("open_dispute").valid) {
        actions.push(
          getActionButton(
            "open_dispute",
            "Open Dispute",
            <AlertTriangle className="h-4 w-4" />,
            "destructive"
          )
        )
      }

      if (canTransition("cancel").valid) {
        actions.push(
          getActionButton(
            "cancel",
            "Cancel Escrow",
            <X className="h-4 w-4" />,
            "outline"
          )
        )
      }
    }

    // Worker actions
    if (isWorker) {
      if (canTransition("start_work").valid) {
        actions.push(
          getActionButton(
            "start_work",
            "Start Work",
            <Play className="h-4 w-4" />
          )
        )
      }

      if (canTransition("request_verification").valid) {
        actions.push(
          getActionButton(
            "request_verification",
            "Request Verification",
            <CheckCircle className="h-4 w-4" />
          )
        )
      }

      if (canTransition("open_dispute").valid) {
        actions.push(
          getActionButton(
            "open_dispute",
            "Open Dispute",
            <AlertTriangle className="h-4 w-4" />,
            "destructive"
          )
        )
      }
    }

    // System/Admin actions (for verification and dispute resolution)
    if (canTransition("verify").valid) {
      actions.push(
        getActionButton(
          "verify",
          "Verify Work",
          <Shield className="h-4 w-4" />,
          "secondary"
        )
      )
    }

    if (canTransition("release_funds").valid) {
      actions.push(
        getActionButton(
          "release_funds",
          "Release Funds",
          <Send className="h-4 w-4" />
        )
      )
    }

    if (canTransition("resolve_dispute").valid) {
      actions.push(
        getActionButton(
          "resolve_dispute",
          "Resolve Dispute",
          <Scale className="h-4 w-4" />,
          "secondary"
        )
      )
    }

    return actions
  }

  const availableActions = getAvailableActions()
  const isTerminal = EscrowStateMachine.isTerminalState(escrow.status)

  if (availableActions.length === 0 && isTerminal) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Escrow Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-2" />
            <p className="text-sm text-gray-600">
              This escrow is in a terminal state and no further actions are available.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (availableActions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">No Actions Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            No actions are currently available for this escrow in its current state.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Available Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {availableActions}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <p>Actions are enabled based on escrow state and your role.</p>
        </div>
      </CardContent>
    </Card>
  )
}