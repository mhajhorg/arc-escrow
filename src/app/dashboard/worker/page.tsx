"use client"

import Link from "next/link"
import { StatusCard } from "@/components/status-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Clock, Shield, Users, Play, CheckCircle } from "lucide-react"
import { useEscrows, useDashboardStats } from "@/lib/hooks"
import { EscrowStateMachine } from "@/lib/escrow"

export default function WorkerDashboardPage() {
  const { data: allEscrows } = useEscrows()
  const { data: stats } = useDashboardStats()

  // Filter escrows for current worker
  const currentUserId = "w1" // Mock - in real app from auth
  const workerEscrows = allEscrows?.filter(e => e.workerId === currentUserId) || []

  // Calculate worker-specific stats
  const activeJobs = workerEscrows.filter(e => e.status === "in_progress").length
  const availableJobs = workerEscrows.filter(e => e.status === "funded").length
  const completedJobs = workerEscrows.filter(e => e.status === "released").length
  const totalEarnings = workerEscrows
    .filter(e => e.status === "released")
    .reduce((sum, e) => sum + e.amount, 0)

  // Get pending milestones across all worker's escrows
  const pendingMilestones = workerEscrows
    .filter(e => e.status === "in_progress")
    .reduce((sum, e) => sum + (e.totalMilestones - e.totalMilestonesCompleted), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Worker Dashboard</h1>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Agent Worker
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Active Jobs"
          value={String(activeJobs)}
          status="success"
          icon={<Play className="h-4 w-4" />}
        />
        <StatusCard
          title="Available Jobs"
          value={String(availableJobs)}
          status={availableJobs > 0 ? "warning" : "success"}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatusCard
          title="Pending Milestones"
          value={String(pendingMilestones)}
          status={pendingMilestones > 0 ? "warning" : "success"}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatusCard
          title="Total Earnings"
          value={`$${totalEarnings.toLocaleString()}`}
          status="success"
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            {workerEscrows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No jobs assigned yet</p>
                <p className="text-sm">New escrows will appear here when assigned</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workerEscrows.slice(0, 3).map((escrow) => (
                  <div key={escrow.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{escrow.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Client: {escrow.clientId}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={
                            escrow.status === "in_progress"
                              ? "default"
                              : escrow.status === "funded"
                              ? "secondary"
                              : escrow.status === "released"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {escrow.status.replace("_", " ")}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ${escrow.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Milestones: {escrow.totalMilestonesCompleted}/{escrow.totalMilestones}
                      </div>
                    </div>
                    <div className="text-right">
                      {escrow.status === "funded" && (
                        <Button size="sm" className="mb-2">
                          <Play className="h-4 w-4 mr-1" />
                          Start Work
                        </Button>
                      )}
                      {escrow.status === "in_progress" && (
                        <Link href="/dashboard/worker/milestones/submit">
                          <Button size="sm" variant="outline">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Submit Milestone
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Success Rate</span>
                <span className="text-lg font-bold text-green-600">98%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg. Verification Score</span>
                <span className="text-lg font-bold text-blue-600">
                  {stats?.averageVerificationScore ? Math.round(stats.averageVerificationScore * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Projects</span>
                <span className="text-lg font-bold">{workerEscrows.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reputation</span>
                <div className="flex items-center">
                  <span className="text-lg font-bold mr-1">4.9</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}