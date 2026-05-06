"use client"

import { StatusCard } from "@/components/status-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Shield, Users, DollarSign } from "lucide-react"
import { useDashboardStats, useRecentActivities, useRecentEscrows } from "@/lib/hooks"
import { EscrowStateMachine } from "@/lib/escrow"

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activities, isLoading: activitiesLoading } =
    useRecentActivities(5)
  const { data: escrows, isLoading: escrowsLoading } = useRecentEscrows(2)

  // Calculate derived stats from escrow state engine
  const activeEscrows = escrows?.filter(e => EscrowStateMachine.isActiveState(e.status)).length || 0
  const completedEscrows = escrows?.filter(e => e.status === "released").length || 0
  const totalValue = escrows?.reduce((sum, e) => sum + e.amount, 0) || 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Active Escrows"
          value={statsLoading ? "..." : String(activeEscrows)}
          status="success"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatusCard
          title="Milestone Progress"
          value={
            statsLoading
              ? "..."
              : `${stats?.milestonesCompleted || 0}/${stats?.totalMilestones || 0}`
          }
          status={
            stats && stats.milestonesCompleted === stats.totalMilestones
              ? "success"
              : "warning"
          }
          icon={<Clock className="h-4 w-4" />}
        />
        <StatusCard
          title="AI Verification"
          value={
            statsLoading
              ? "..."
              : `${Math.round((stats?.averageVerificationScore || 0) * 100)}%`
          }
          status="success"
          icon={<Shield className="h-4 w-4" />}
        />
        <StatusCard
          title="Active Workers"
          value={statsLoading ? "..." : String(stats?.activeWorkers || 0)}
          status="success"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Escrows</CardTitle>
          </CardHeader>
          <CardContent>
            {escrowsLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : escrows && escrows.length > 0 ? (
              <div className="space-y-4">
                {escrows.map((escrow) => (
                  <div key={escrow.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{escrow.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {escrow.description.substring(0, 40)}...
                      </p>
                    </div>
                    <div className="text-right">
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
                      <p className="text-sm text-muted-foreground mt-1">
                        ${escrow.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No escrows found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {activity.type === "milestone_completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : activity.type === "verification_passed" ? (
                        <Shield className="h-5 w-5 text-blue-600" />
                      ) : (
                        <DollarSign className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No activity found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}