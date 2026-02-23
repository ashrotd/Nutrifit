import { create } from 'zustand'
import { UserProfile } from '../types'

interface AppState {
  // Auth
  user: UserProfile | null
  isLoading: boolean
  isOnboarded: boolean

  // Actions
  setUser: (user: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setOnboarded: (onboarded: boolean) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isLoading: true,
  isOnboarded: false,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
  reset: () => set({ user: null, isLoading: false, isOnboarded: false }),
}))