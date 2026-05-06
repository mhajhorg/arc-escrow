"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Circle } from "lucide-react"
import type { Milestone } from "@/lib/types"

interface MilestoneTimelineProps {
  milestones: Milestone[]
  className?: string
}

export function MilestoneTimeline({ milestones, className }: MilestoneTimelineProps) {
  const getMilestoneIcon = (status: Milestone["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "disputed":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getMilestoneStatusColor = (status: Milestone["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-700 bg-green-50 border-green-200"
      case "in-progress":
        return "text-blue-700 bg-blue-50 border-blue-200"
      case "disputed":
        return "text-red-700 bg-red-50 border-red-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Milestone Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedMilestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 bg-white">
                  {getMilestoneIcon(milestone.status)}
                </div>
                {index < sortedMilestones.length - 1 && (
                  <div className={`w-0.5 h-8 mt-2 ${
                    milestone.status === "completed" ? "bg-green-300" : "bg-gray-200"
                  }`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">
                    {milestone.title}
                  </h4>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getMilestoneStatusColor(milestone.status)}`}
                  >
                    {milestone.status.replace("-", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {milestone.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-900">
                    ${milestone.amount.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    Due: {milestone.dueDate.toLocaleDateString()}
                  </span>
                </div>
                {milestone.completedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    Completed: {milestone.completedAt.toLocaleDateString()}
                  </p>
                )}
                {milestone.proofUrl && (
                  <a
                    href={milestone.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                  >
                    View Proof →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        {sortedMilestones.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Circle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No milestones defined yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}