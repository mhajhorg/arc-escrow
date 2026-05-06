"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, CheckCircle, XCircle, AlertTriangle, Bot } from "lucide-react"
import type { Verification } from "@/lib/types"

interface VerificationPanelProps {
  verifications: Verification[]
  escrowId: string
  className?: string
}

export function VerificationPanel({ verifications, escrowId, className }: VerificationPanelProps) {
  const getVerificationIcon = (status: Verification["status"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "disputed":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      default:
        return <Shield className="h-5 w-5 text-gray-400" />
    }
  }

  const getVerificationStatusColor = (status: Verification["status"]) => {
    switch (status) {
      case "verified":
        return "text-green-700 bg-green-50 border-green-200"
      case "failed":
        return "text-red-700 bg-red-50 border-red-200"
      case "disputed":
        return "text-yellow-700 bg-yellow-50 border-yellow-200"
      default:
        return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return "text-green-600"
    if (score >= 0.8) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.9) return "Excellent"
    if (score >= 0.8) return "Good"
    if (score >= 0.7) return "Fair"
    return "Poor"
  }

  const averageScore = verifications.length > 0
    ? verifications.reduce((sum, v) => sum + v.aiScore, 0) / verifications.length
    : 0

  const passedVerifications = verifications.filter(v => v.status === "verified").length
  const totalVerifications = verifications.length

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {verifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No verifications yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {Math.round(averageScore * 100)}%
              </div>
              <div className={`text-sm font-medium ${getScoreColor(averageScore)}`}>
                {getScoreLabel(averageScore)} Confidence
              </div>
              <Progress
                value={averageScore * 100}
                className="mt-3 h-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                {passedVerifications}/{totalVerifications} verifications passed
              </p>
            </div>

            {/* Individual Verifications */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Verification Details</h4>
              {verifications.map((verification) => (
                <div key={verification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getVerificationIcon(verification.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Milestone {verification.milestoneId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {verification.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(verification.aiScore)}`}>
                      {Math.round(verification.aiScore * 100)}%
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs mt-1 ${getVerificationStatusColor(verification.status)}`}
                    >
                      {verification.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Human Review */}
            {verifications.some(v => v.humanReview) && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Human Review</h4>
                {verifications
                  .filter(v => v.humanReview)
                  .map((verification) => (
                    <div key={verification.id} className="text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Reviewed by:</span> {verification.reviewedBy}
                      </p>
                      <p>
                        <span className="font-medium">Date:</span> {verification.reviewedAt?.toLocaleDateString()}
                      </p>
                      {verification.notes && (
                        <p className="mt-1">
                          <span className="font-medium">Notes:</span> {verification.notes}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}