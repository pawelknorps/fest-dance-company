import { create } from 'zustand'

interface LoadState {
  items: Map<string, number>
  totalProgress: number
  isComplete: boolean
  hasStarted: boolean
  registerItem: (id: string) => void
  updateProgress: (id: string, progress: number) => void
  completeItem: (id: string) => void
}

export const useLoadOrchestrator = create<LoadState>((set, get) => ({
  items: new Map(),
  totalProgress: 0,
  isComplete: false,
  hasStarted: false,

  registerItem: (id) => {
    set((state) => {
      if (state.items.has(id)) return state
      const newItems = new Map(state.items)
      newItems.set(id, 0)
      return { items: newItems, isComplete: false, hasStarted: true }
    })
  },

  updateProgress: (id, progress) => {
    set((state) => {
      const newItems = new Map(state.items)
      newItems.set(id, Math.min(progress, 1))
      
      const allValues = Array.from(newItems.values())
      const avg = allValues.reduce((a, b) => a + b, 0) / (allValues.length || 1)
      
      
      return { 
        items: newItems, 
        totalProgress: avg,
        isComplete: avg >= 1
      }
    })
  },

  completeItem: (id) => {
    get().updateProgress(id, 1)
  }
}))
