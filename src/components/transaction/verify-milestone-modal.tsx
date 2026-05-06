import React, { useState, useCallback } from "react"
import { useTransaction } from "@/lib/transaction"
import { useUpdateEscrow } from "@/lib/hooks/useEscrows"
import { useCreateVerification } from "@/lib/hooks/useVerification"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react"

interface VerifyMilestoneModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  escrowId: string
  milestoneId: string
  milestoneName: string
  milestoneAmount: number
  escrowCurrency?: string
}

export function VerifyMilestoneModal({
  isOpen,
  onOpenChange,
  escrowId,
  milestoneId,
  milestoneName,
  milestoneAmount,
  escrowCurrency = "USDC",
}: VerifyMilestoneModalProps) {
  const transaction = useTransaction()
  const updateEscrowMutation = useUpdateEscrow()
  const createVerificationMutation = useCreateVerification()

  const [verificationScore, setVerificationScore] = useState<string>("85")
  const [requiresHumanReview, setRequiresHumanReview] = useState(false)
  const [notes, setNotes] = useState<string>("")
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleVerify = useCallback(async () => {
    const score = parseInt(verificationScore)
    if (isNaN(score) || score < 0 || score > 100) {
      alert("Please enter a valid verification score (0-100)")
      return
    }

    if (!termsAccepted) {
      alert("Please accept the verification terms")
      return
    }

    try {
      // Initiate transaction
      await transaction.initiate("verify", escrowId)

      // Confirm transaction (simulates blockchain confirmation)
      await transaction.confirm()

      // Create verification record
      await createVerificationMutation.mutateAsync({
        escrowId,
        milestoneId,
        verificationScore: score,
        notes,
        requiresHumanReview,
        timestamp: new Date().toISOString(),
        verifier: "ai-agent", // Will be replaced with actual user role
      } as any)

      // Update milestone status to "verified"
      await updateEscrowMutation.mutateAsync({
        id: escrowId,
        data: {
          status: "milestone_verified" as any,
        },
      })

      // Reset form after success
      setVerificationScore("85")
      setRequiresHumanReview(false)
      setNotes("")
      setTermsAccepted(false)
    } catch (error) {
      console.error("Verification failed:", error)
    }
  }, [
    verificationScore,
    termsAccepted,
    notes,
    requiresHumanReview,
    transaction,
    escrowId,
    milestoneId,
    updateEscrowMutation,
    createVerificationMutation,
  ])

  const handleClose = () => {
    if (transaction.transaction.status !== "pending" && transaction.transaction.status !== "confirming") {
      transaction.reset()
      setVerificationScore("85")
      setRequiresHumanReview(false)
      setNotes("")
      setTermsAccepted(false)
      onOpenChange(false)
    }
  }

  const isLoading = transaction.transaction.status === "pending" || transaction.transaction.status === "confirming"
  const isSuccess = transaction.transaction.status === "success"
  const isError = transaction.transaction.status === "error"
  const score = parseInt(verificationScore) || 0

  // Determine score color
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600"
    if (s >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Verify Milestone</DialogTitle>
          <DialogDescription>
            Submit AI verification for milestone completion
          </DialogDescription>
        </DialogHeader>

        {/* Idle State - Form */}
        {transaction.transaction.status === "idle" && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Milestone Details */}
            <div>
              <Label className="text-xs text-muted-foreground">Milestone</Label>
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium">{milestoneName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Amount: {milestoneAmount} {escrowCurrency}
                </p>
              </div>
            </div>

            {/* Verification Score */}
            <div>
              <Label htmlFor="score">AI Verification Score (%)</Label>
              <div className="flex gap-2">
                <Input
                  id="score"
                  type="number"
                  placeholder="0-100"
                  value={verificationScore}
                  onChange={(e) => setVerificationScore(e.target.value)}
                  min="0"
                  max="100"
                  disabled={isLoading}
                />
                <div className={`flex items-center font-bold ${getScoreColor(score)}`}>
                  {score}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {score >= 80
                  ? "✓ Verified"
                  : score >= 60
                    ? "⚠ Needs Review"
                    : "✗ Not Verified"}
              </p>
            </div>

            {/* Verification Notes */}
            <div>
              <Label htmlFor="notes">Verification Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional verification notes or observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                className="resize-none h-24"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {notes.length}/500 characters
              </p>
            </div>

            {/* Human Review Toggle */}
            <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted rounded-lg">
              <input
                type="checkbox"
                checked={requiresHumanReview}
                onChange={(e) => setRequiresHumanReview(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4"
              />
              <span className="text-sm">
                Flag for human review
              </span>
            </label>

            {/* Verification Confirmation */}
            <label className="flex items-start gap-2 cursor-pointer p-2 hover:bg-muted rounded-lg">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 mt-1"
              />
              <span className="text-sm text-muted-foreground">
                I confirm this milestone verification is accurate based on AI analysis
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerify}
                disabled={!termsAccepted || isLoading || score < 60}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Verification"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Pending State - Processing */}
        {transaction.transaction.status === "pending" && (
          <div className="space-y-4 py-8 text-center">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Processing verification...
            </p>
          </div>
        )}

        {/* Confirming State - Waiting for Confirmation */}
        {transaction.transaction.status === "confirming" && (
          <div className="space-y-4 py-8">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Confirming Verification</p>
              <p className="text-xs text-muted-foreground mt-2">
                Block {transaction.transaction.confirmations} of 3
              </p>
            </div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full ${
                    i < transaction.transaction.confirmations
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className="space-y-4 py-8">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-medium">Verification Submitted!</p>
              <p className="text-sm text-muted-foreground">
                Milestone &quot;{milestoneName}&quot; verified with score {verificationScore}%
              </p>
              {requiresHumanReview && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Flagged for human review
                  </AlertDescription>
                </Alert>
              )}
            </div>
            {transaction.transaction.data?.hash && (
              <div className="p-3 bg-muted rounded-lg break-all text-xs font-mono">
                <p className="text-muted-foreground mb-1">Transaction Hash:</p>
                <p>{transaction.transaction.data.hash}</p>
              </div>
            )}
            <Button
              onClick={() => {
                transaction.reset()
                onOpenChange(false)
              }}
              className="w-full"
            >
              Close
            </Button>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="space-y-4 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {transaction.transaction.data?.error || "Verification submission failed"}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  transaction.reset()
                  setVerificationScore("85")
                  setRequiresHumanReview(false)
                }}
                className="flex-1"
              >
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
