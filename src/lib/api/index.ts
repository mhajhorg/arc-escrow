import {
  Worker,
  Escrow,
  Milestone,
  Verification,
  Activity,
  DashboardStats,
} from "@/lib/types"
import {
  mockWorkers,
  mockEscrows,
  mockMilestones,
  mockVerifications,
  mockActivities,
  mockDashboardStats,
} from "./mock-data"

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * API Service Interfaces
 * These define the contract for data access without any business logic
 */

export interface WorkerApi {
  getAll(): Promise<Worker[]>
  getById(id: string): Promise<Worker | null>
  create(data: Omit<Worker, 'id'>): Promise<Worker>
  update(id: string, data: Partial<Worker>): Promise<Worker | null>
  delete(id: string): Promise<boolean>
}

export interface EscrowApi {
  getAll(): Promise<Escrow[]>
  getById(id: string): Promise<Escrow | null>
  create(data: Omit<Escrow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Escrow>
  update(id: string, data: Partial<Escrow>): Promise<Escrow | null>
  delete(id: string): Promise<boolean>
}

export interface MilestoneApi {
  getAll(): Promise<Milestone[]>
  getById(id: string): Promise<Milestone | null>
  create(data: Omit<Milestone, 'id'>): Promise<Milestone>
  update(id: string, data: Partial<Milestone>): Promise<Milestone | null>
  delete(id: string): Promise<boolean>
}

export interface VerificationApi {
  getAll(): Promise<Verification[]>
  getById(id: string): Promise<Verification | null>
  create(data: Omit<Verification, 'id' | 'createdAt'>): Promise<Verification>
  update(id: string, data: Partial<Verification>): Promise<Verification | null>
  delete(id: string): Promise<boolean>
}

export interface ActivityApi {
  getAll(): Promise<Activity[]>
  getById(id: string): Promise<Activity | null>
  create(data: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity>
  delete(id: string): Promise<boolean>
}

export interface DashboardApi {
  getStats(): Promise<DashboardStats>
}

/**
 * Mock API Implementations
 * Pure data transport - no business logic, filtering, or sorting
 */

export const workerApi: WorkerApi = {
  getAll: async (): Promise<Worker[]> => {
    await delay(300)
    return [...mockWorkers]
  },

  getById: async (id: string): Promise<Worker | null> => {
    await delay(200)
    return mockWorkers.find((w) => w.id === id) || null
  },

  create: async (data: Omit<Worker, 'id'>): Promise<Worker> => {
    await delay(400)
    const newWorker: Worker = {
      id: `w${mockWorkers.length + 1}`,
      ...data,
    }
    mockWorkers.push(newWorker)
    return newWorker
  },

  update: async (id: string, data: Partial<Worker>): Promise<Worker | null> => {
    await delay(300)
    const index = mockWorkers.findIndex((w) => w.id === id)
    if (index === -1) return null
    mockWorkers[index] = { ...mockWorkers[index], ...data }
    return mockWorkers[index]
  },

  delete: async (id: string): Promise<boolean> => {
    await delay(200)
    const index = mockWorkers.findIndex((w) => w.id === id)
    if (index === -1) return false
    mockWorkers.splice(index, 1)
    return true
  },
}

export const escrowApi: EscrowApi = {
  getAll: async (): Promise<Escrow[]> => {
    await delay(300)
    return [...mockEscrows]
  },

  getById: async (id: string): Promise<Escrow | null> => {
    await delay(250)
    return mockEscrows.find((e) => e.id === id) || null
  },

  create: async (data: Omit<Escrow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Escrow> => {
    await delay(500)
    const newEscrow: Escrow = {
      id: `e${mockEscrows.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    }
    mockEscrows.push(newEscrow)
    return newEscrow
  },

  update: async (id: string, data: Partial<Escrow>): Promise<Escrow | null> => {
    await delay(400)
    const index = mockEscrows.findIndex((e) => e.id === id)
    if (index === -1) return null
    mockEscrows[index] = { ...mockEscrows[index], ...data, updatedAt: new Date() }
    return mockEscrows[index]
  },

  delete: async (id: string): Promise<boolean> => {
    await delay(300)
    const index = mockEscrows.findIndex((e) => e.id === id)
    if (index === -1) return false
    mockEscrows.splice(index, 1)
    return true
  },
}

export const milestoneApi: MilestoneApi = {
  getAll: async (): Promise<Milestone[]> => {
    await delay(250)
    return [...mockMilestones]
  },

  getById: async (id: string): Promise<Milestone | null> => {
    await delay(200)
    return mockMilestones.find((m) => m.id === id) || null
  },

  create: async (data: Omit<Milestone, 'id'>): Promise<Milestone> => {
    await delay(400)
    const newMilestone: Milestone = {
      id: `m${mockMilestones.length + 1}`,
      ...data,
    }
    mockMilestones.push(newMilestone)
    return newMilestone
  },

  update: async (id: string, data: Partial<Milestone>): Promise<Milestone | null> => {
    await delay(300)
    const index = mockMilestones.findIndex((m) => m.id === id)
    if (index === -1) return null
    mockMilestones[index] = { ...mockMilestones[index], ...data }
    return mockMilestones[index]
  },

  delete: async (id: string): Promise<boolean> => {
    await delay(200)
    const index = mockMilestones.findIndex((m) => m.id === id)
    if (index === -1) return false
    mockMilestones.splice(index, 1)
    return true
  },
}

export const verificationApi: VerificationApi = {
  getAll: async (): Promise<Verification[]> => {
    await delay(250)
    return [...mockVerifications]
  },

  getById: async (id: string): Promise<Verification | null> => {
    await delay(200)
    return mockVerifications.find((v) => v.id === id) || null
  },

  create: async (data: Omit<Verification, 'id' | 'createdAt'>): Promise<Verification> => {
    await delay(400)
    const newVerification: Verification = {
      id: `v${mockVerifications.length + 1}`,
      createdAt: new Date(),
      ...data,
    }
    mockVerifications.push(newVerification)
    return newVerification
  },

  update: async (id: string, data: Partial<Verification>): Promise<Verification | null> => {
    await delay(300)
    const index = mockVerifications.findIndex((v) => v.id === id)
    if (index === -1) return null
    mockVerifications[index] = { ...mockVerifications[index], ...data }
    return mockVerifications[index]
  },

  delete: async (id: string): Promise<boolean> => {
    await delay(200)
    const index = mockVerifications.findIndex((v) => v.id === id)
    if (index === -1) return false
    mockVerifications.splice(index, 1)
    return true
  },
}

export const activityApi: ActivityApi = {
  getAll: async (): Promise<Activity[]> => {
    await delay(300)
    return [...mockActivities]
  },

  getById: async (id: string): Promise<Activity | null> => {
    await delay(200)
    return mockActivities.find((a) => a.id === id) || null
  },

  create: async (data: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity> => {
    await delay(200)
    const newActivity: Activity = {
      id: `a${mockActivities.length + 1}`,
      timestamp: new Date(),
      ...data,
    }
    mockActivities.push(newActivity)
    return newActivity
  },

  delete: async (id: string): Promise<boolean> => {
    await delay(200)
    const index = mockActivities.findIndex((a) => a.id === id)
    if (index === -1) return false
    mockActivities.splice(index, 1)
    return true
  },
}

export const dashboardApi: DashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(400)
    return { ...mockDashboardStats }
  },
}
