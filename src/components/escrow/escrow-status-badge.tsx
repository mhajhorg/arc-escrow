"use client"

import { Badge } from "@/components/ui/badge"
import { EscrowStatus } from "@/lib/escrow"

interface EscrowStatusBadgeProps {
  status: EscrowStatus
  className?: string
}

export function EscrowStatusBadge({ status, className }: EscrowStatusBadgeProps) {
  const getStatusConfig = (status: EscrowStatus) => {
    switch (status) {
      case "draft":
        return {
          variant: "outline" as const,
          label: "Draft",
          className: "border-slate-300 text-slate-600"
        }
      case "funded":
        return {
          variant: "secondary" as const,
          label: "Funded",
          className: "bg-blue-50 text-blue-700 border-blue-200"
        }
      case "in_progress":
        return {
          variant: "default" as const,
          label: "In Progress",
          className: "bg-green-600 hover:bg-green-700"
        }
      case "awaiting_verification":
        return {
          variant: "secondary" as const,
          label: "Awaiting Verification",
          className: "bg-yellow-50 text-yellow-700 border-yellow-200"
        }
      case "approved":
        return {
          variant: "default" as const,
          label: "Approved",
          className: "bg-emerald-600 hover:bg-emerald-700"
        }
      case "released":
        return {
          variant: "secondary" as const,
          label: "Released",
          className: "bg-slate-50 text-slate-700 border-slate-200"
        }
      case "disputed":
        return {
          variant: "destructive" as const,
          label: "Disputed",
          className: "bg-red-600 hover:bg-red-700"
        }
      case "dispute_resolved":
        return {
          variant: "secondary" as const,
          label: "Dispute Resolved",
          className: "bg-purple-50 text-purple-700 border-purple-200"
        }
      case "cancelled":
        return {
          variant: "outline" as const,
          label: "Cancelled",
          className: "border-red-300 text-red-600"
        }
      default:
        return {
          variant: "outline" as const,
          label: status,
          className: ""
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className || ""}`}
    >
      {config.label}
    </Badge>
  )
}