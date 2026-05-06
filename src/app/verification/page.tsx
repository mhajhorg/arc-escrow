"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/lib/auth"
import { useEscrows, useUpdateEscrow } from "@/lib/hooks"
import { VerifyMilestoneModal } from "@/components/transaction"
import { ProtectedRoute } from "@/components/route-guards"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Shield, Zap, MessageSquare, CheckCircle2 } from "lucide-react"
import { DisputeTimeline } from "@/components/escrow/dispute-timeline"

export default function VerificationPage() {
  const { selectedRole } = useAuth()
  const { data: escrows, isLoading } = useEscrows()
  const updateEscrowMutation = useUpdateEscrow()
  const [selectedEscrow, setSelectedEscrow] = useState<string | null>(null)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentUserId = selectedRole === "client" ? "c1" : "w1"

  const workerEscrows = useMemo(
    () => escrows?.filter((escrow) => escrow.workerId === currentUserId) || [],
    [escrows, currentUserId]
  )

  const disputedEscrows = useMemo(
    () => escrows?.filter((escrow) => escrow.status === "disputed") || [],
    [escrows]
  )

  const pendingEscrows = useMemo(
    () => workerEscrows.filter((escrow) => escrow.status === "funded" || escrow.status === "in_progress"),
    [workerEscrows]
  )

  const handleOpenVerification = (escrowId: string, milestoneId: string) => {
    setSelectedEscrow(escrowId)
    setSelectedMilestoneId(milestoneId)
    setIsModalOpen(true)
  }

  const handleMarkAwaitingVerification = async (escrowId: string) => {
    try {
      await updateEscrowMutation.mutateAsync({
        id: escrowId,
        data: { status: "awaiting_verification" },
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Verification Center</p>
            <h1 className="text-3xl font-bold">Submit proof and review disputes</h1>
          </div>
          <Badge variant="secondary">Role: {selectedRole ?? "Unknown"}</Badge>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-muted/50 bg-muted p-6 text-center">
            <p className="text-muted-foreground">Loading verification tasks...</p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6">
              {(selectedRole === "worker" || selectedRole === "agent") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Pending Proof Submissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingEscrows.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p>No milestones waiting for proof submission.</p>
                      </div>
                    ) : (
                      pendingEscrows.map((escrow) => (
                        <div key={escrow.id} className="rounded-2xl border border-muted/50 bg-muted p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold">{escrow.title}</p>
                              <p className="text-sm text-muted-foreground">Client: {escrow.clientId}</p>
                            </div>
                            <Badge variant="secondary">{escrow.status.replace("_", " ")}</Badge>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {escrow.milestones.map((milestone) => (
                              <div key={milestone.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-semibold text-sm">{milestone.title}</p>
                                  <span className="text-xs text-muted-foreground">{milestone.status}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Due {new Date(milestone.dueDate).toLocaleDateString()}</p>
                                <div className="mt-3 flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium">${milestone.amount.toLocaleString()}</span>
                                  <Button size="sm" onClick={() => handleOpenVerification(escrow.id, milestone.id)}>
                                    Submit Proof
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Verification Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-muted/50 bg-muted p-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Escrows pending review</p>
                      <p className="text-xl font-semibold">{disputedEscrows.length}</p>
                    </div>
                    <Badge variant={disputedEscrows.length > 0 ? "destructive" : "secondary"}>
                      {disputedEscrows.length > 0 ? "Disputed" : "Healthy"}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <p className="text-sm">AI-verification status is updated automatically.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <p className="text-sm">Proof submission is mocked, but the UI flows are ready for real file upload.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Dispute Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {disputedEscrows.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <p>No active disputes at the moment.</p>
                    </div>
                  ) : (
                    disputedEscrows.map((escrow) => (
                      <div key={escrow.id} className="rounded-2xl border border-muted/50 bg-muted p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{escrow.title}</p>
                            <p className="text-sm text-muted-foreground">Initiated by {escrow.disputeInitiator}</p>
                          </div>
                          <Badge variant="destructive">Disputed</Badge>
                        </div>
                        <DisputeTimeline escrow={escrow} />
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Helpful Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    Use the mock verification flow to simulate milestone approval and human review.
                  </p>
                  <p>
                    All pending proof submissions are shown above. Once submitted, escrows move to verification status.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <VerifyMilestoneModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          escrowId={selectedEscrow ?? ""}
          milestoneId={selectedMilestoneId ?? ""}
          milestoneName={"Proof Submission"}
          milestoneAmount={0}
        />
      </div>
    </ProtectedRoute>
  )
}
