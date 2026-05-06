"use client"

import Link from "next/link"
import { StatusCard } from "@/components/status-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Clock, Shield, Users, Plus, Eye } from "lucide-react"
import { useEscrows, useDashboardStats } from "@/lib/hooks"
import { EscrowStateMachine } from "@/lib/escrow"

export default function ClientDashboardPage() {
  const { data: allEscrows } = useEscrows()
  const { data: stats } = useDashboardStats()

  // Filter escrows for current client
  const currentUserId = "c1" // Mock - in real app from auth
  const clientEscrows = allEscrows?.filter(e => e.clientId === currentUserId) || []

  // Calculate client-specific stats
  const activeEscrows = clientEscrows.filter(e => EscrowStateMachine.isActiveState(e.status)).length
  const completedEscrows = clientEscrows.filter(e => e.status === "released").length
  const totalValue = clientEscrows.reduce((sum, e) => sum + e.amount, 0)
  const pendingVerification = clientEscrows.filter(e => e.status === "awaiting_verification").length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <Link href="/dashboard/escrows/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Escrow
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Active Escrows"
          value={String(activeEscrows)}
          status="success"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatusCard
          title="Completed Projects"
          value={String(completedEscrows)}
          status="success"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatusCard
          title="Awaiting Verification"
          value={String(pendingVerification)}
          status={pendingVerification > 0 ? "warning" : "success"}
          icon={<Shield className="h-4 w-4" />}
        />
        <StatusCard
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          status="success"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/escrows/new">
              <Button className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Create New Escrow
              </Button>
            </Link>
            <Link href="/dashboard/client/milestones">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Review Milestones ({pendingVerification})
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Escrows</CardTitle>
          </CardHeader>
          <CardContent>
            {clientEscrows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No escrows yet</p>
                <p className="text-sm">Create your first escrow to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientEscrows.slice(0, 3).map((escrow) => (
                  <div key={escrow.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{escrow.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {escrow.description.substring(0, 40)}...
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            escrow.status === "released"
                              ? "secondary"
                              : EscrowStateMachine.isActiveState(escrow.status)
                              ? "default"
                              : "outline"
                          }
                        >
                          {escrow.status.replace("_", " ")}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ${escrow.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/dashboard/escrows/new">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Escrow
                </Button>
              </Link>
              <Link href="/dashboard/workers">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Workers
                </Button>
              </Link>
              <Link href="/verification">
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  View Verification Status
                </Button>
              </Link>
              <Link href="/dashboard/payments">
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment History
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}