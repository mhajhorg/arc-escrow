"use client"

import { Milestone } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, Music, Image as ImageIcon } from "lucide-react"
import { useState } from "react"

interface MilestoneVerificationPanelProps {
  milestone: Milestone
  onApprove?: (notes: string) => void
  onReject?: (notes: string) => void
  onDispute?: (reason: string) => void
  isLoading?: boolean
  isClient?: boolean
}

export function MilestoneVerificationPanel({
  milestone,
  onApprove,
  onReject,
  onDispute,
  isLoading = false,
  isClient = false,
}: MilestoneVerificationPanelProps) {
  const [reviewNotes, setReviewNotes] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showDisputeForm, setShowDisputeForm] = useState(false)

  if (!milestone.submission) {
    return null
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "disputed":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case "awaiting_client_review":
        return <AlertCircle className="h-5 w-5 text-blue-600" />
      case "pending_verification":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 border-green-200"
      case "rejected":
        return "bg-red-50 border-red-200"
      case "disputed":
        return "bg-orange-50 border-orange-200"
      case "awaiting_client_review":
        return "bg-blue-50 border-blue-200"
      case "pending_verification":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const getFileIcon = (file: any) => {
    if (typeof file === "string") {
      if (file.includes("image")) return <ImageIcon className="h-4 w-4 text-blue-500" />
      if (file.includes("audio")) return <Music className="h-4 w-4 text-purple-500" />
    }
    return null
  }

  return (
    <Card className={`border ${getStatusColor(milestone.status)}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Submission & Verification</CardTitle>
            {getStatusIcon(milestone.status)}
          </div>
          <Badge variant="outline">{milestone.status.replace("_", " ")}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Submission Details */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Submitted At</p>
          <p className="text-sm text-muted-foreground">
            {new Date(milestone.submission.submittedAt).toLocaleString()}
          </p>
        </div>

        {/* Files */}
        {milestone.submission.files && milestone.submission.files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Attached Files ({milestone.submission.files.length})</p>
            <div className="space-y-1">
              {milestone.submission.files.map((file: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getFileIcon(file)}
                  <span>{typeof file === "string" ? file : (file as any).name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submission Notes */}
        {milestone.submission.notes && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Submission Notes</p>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {milestone.submission.notes}
            </p>
          </div>
        )}

        {/* AI Verification Score */}
        {milestone.aiScore !== undefined && (
          <div className="space-y-2">
            <p className="text-sm font-medium">AI Verification Score</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    milestone.aiScore >= 0.8 ? "bg-green-600" : "bg-orange-600"
                  }`}
                  style={{ width: `${milestone.aiScore * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{(milestone.aiScore * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* Client Review Notes */}
        {milestone.clientReviewNotes && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Client Review Notes</p>
            <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
              {milestone.clientReviewNotes}
            </p>
            <p className="text-xs text-muted-foreground">
              Reviewed: {milestone.clientReviewedAt ? new Date(milestone.clientReviewedAt).toLocaleString() : "Pending"}
            </p>
          </div>
        )}

        {/* Client Review Actions */}
        {isClient && milestone.status === "awaiting_client_review" && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-3">
              {!showRejectForm && !showDisputeForm && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => onApprove?.(reviewNotes)}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Approve Milestone
                  </Button>
                  <Button
                    onClick={() => setShowRejectForm(true)}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => setShowDisputeForm(true)}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    Dispute
                  </Button>
                </div>
              )}

              {showRejectForm && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Explain why you're rejecting this milestone..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onReject?.(reviewNotes)}
                      disabled={isLoading || !reviewNotes.trim()}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      Confirm Rejection
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRejectForm(false)
                        setReviewNotes("")
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {showDisputeForm && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe the dispute reason..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onDispute?.(reviewNotes)}
                      disabled={isLoading || !reviewNotes.trim()}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      Open Dispute
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDisputeForm(false)
                        setReviewNotes("")
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
