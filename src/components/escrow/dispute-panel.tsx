"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Scale, User, MessageSquare } from "lucide-react"
import { useState } from "react"

interface DisputePanelProps {
  escrowId: string
  disputeReason?: string
  disputeResolution?: string
  disputeInitiator?: string
  isDisputed: boolean
  isResolved: boolean
  currentUserId: string
  onOpenDispute?: (reason: string) => void
  onResolveDispute?: (resolution: string) => void
  className?: string
}

export function DisputePanel({
  escrowId,
  disputeReason,
  disputeResolution,
  disputeInitiator,
  isDisputed,
  isResolved,
  currentUserId,
  onOpenDispute,
  onResolveDispute,
  className
}: DisputePanelProps) {
  const [disputeText, setDisputeText] = useState("")
  const [resolutionText, setResolutionText] = useState("")
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [showResolutionForm, setShowResolutionForm] = useState(false)

  const handleOpenDispute = () => {
    if (disputeText.trim()) {
      onOpenDispute?.(disputeText.trim())
      setDisputeText("")
      setShowDisputeForm(false)
    }
  }

  const handleResolveDispute = () => {
    if (resolutionText.trim()) {
      onResolveDispute?.(resolutionText.trim())
      setResolutionText("")
      setShowResolutionForm(false)
    }
  }

  if (isResolved) {
    return (
      <Card className={`${className} border-green-200 bg-green-50`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-green-800">
            <Scale className="h-5 w-5" />
            Dispute Resolved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Resolution</h4>
              <p className="text-sm text-gray-700">{disputeResolution}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Arbitration Complete
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isDisputed) {
    return (
      <Card className={`${className} border-red-200 bg-red-50`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Dispute Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  Initiated by: {disputeInitiator}
                </span>
              </div>
              <h4 className="font-medium text-red-800 mb-2">Dispute Reason</h4>
              <p className="text-sm text-gray-700">{disputeReason}</p>
            </div>

            {/* Resolution Form for Arbitrators/Admins */}
            {!showResolutionForm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResolutionForm(true)}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <Scale className="h-4 w-4 mr-2" />
                Resolve Dispute
              </Button>
            ) : (
              <div className="space-y-3">
                <Textarea
                  placeholder="Enter dispute resolution details..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleResolveDispute}
                    disabled={!resolutionText.trim()}
                  >
                    Submit Resolution
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowResolutionForm(false)
                      setResolutionText("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Badge variant="destructive">
              Arbitration Required
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No dispute - show option to open dispute
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Dispute Resolution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            If you encounter issues with this escrow, you can open a formal dispute.
            Disputes require arbitration and may delay fund release.
          </p>

          {!showDisputeForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDisputeForm(true)}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Open Dispute
            </Button>
          ) : (
            <div className="space-y-3">
              <Textarea
                placeholder="Describe the dispute reason in detail..."
                value={disputeText}
                onChange={(e) => setDisputeText(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleOpenDispute}
                  disabled={!disputeText.trim()}
                >
                  Submit Dispute
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDisputeForm(false)
                    setDisputeText("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}