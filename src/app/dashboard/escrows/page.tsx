"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useEscrows } from "@/lib/hooks"
import { EscrowCard } from "@/components/escrow"
import { EscrowAction } from "@/lib/escrow"

export default function EscrowsPage() {
  const { data: escrows, isLoading } = useEscrows()

  // Mock current user - in real app this would come from auth context
  const currentUserId = "c1" // Assuming user is client for demo

  const handleEscrowAction = (
    escrowId: string,
    action: EscrowAction,
    params?: any
  ) => {
    // In a real app, this would trigger the appropriate mutation
    console.log(`Action ${action} on escrow ${escrowId}`, params)
    // For now, just log - full implementation would use the escrow state hooks
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Escrows</h1>
        <Link href="/dashboard/escrows/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Escrow
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading escrows...</p>
        </div>
      ) : !escrows || escrows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No escrows found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {escrows.map((escrow) => (
            <EscrowCard
              key={escrow.id}
              escrow={escrow}
              currentUserId={currentUserId}
              onAction={handleEscrowAction}
            />
          ))}
        </div>
      )}
    </div>
  )
}