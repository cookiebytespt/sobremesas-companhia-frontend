'use client'

import { createContext, useContext } from 'react'
import type { User } from '@/lib/api/types'

const CurrentUserContext = createContext<User | null>(null)

/** The signed-in admin, as resolved by the server layout guard. */
export function CurrentUserProvider({ user, children }: { user: User; children: React.ReactNode }) {
  return <CurrentUserContext.Provider value={user}>{children}</CurrentUserContext.Provider>
}

export function useCurrentUser(): User {
  const user = useContext(CurrentUserContext)
  if (!user) throw new Error('useCurrentUser must be used inside the backoffice layout')
  return user
}
