import { cookies } from 'next/headers'

export interface UserSession {
    uid: string
    email: string
    role: 'patient' | 'doctor' | 'admin'
    name: string
    timestamp: number
}

/**
 * Get the current user session from cookies
 * Returns null if no session exists or session is invalid
 */
export async function getCurrentUser(): Promise<UserSession | null> {
    try {
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get('user_session')

        if (!sessionCookie) {
            return null
        }

        const session: UserSession = JSON.parse(sessionCookie.value)

        // Validate session structure
        if (!session.uid || !session.email || !session.role) {
            return null
        }

        return session
    } catch (error) {
        console.error('Error getting current user:', error)
        return null
    }
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const user = await getCurrentUser()
    return user !== null
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: 'patient' | 'doctor' | 'admin'): Promise<boolean> {
    const user = await getCurrentUser()
    return user?.role === role
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in API routes
 */
export async function requireAuth(): Promise<UserSession> {
    const user = await getCurrentUser()

    if (!user) {
        throw new Error('Authentication required')
    }

    return user
}

/**
 * Require specific role - throws error if user doesn't have the role
 * Use this in API routes
 */
export async function requireRole(role: 'patient' | 'doctor' | 'admin'): Promise<UserSession> {
    const user = await requireAuth()

    if (user.role !== role) {
        throw new Error(`Access denied. Required role: ${role}`)
    }

    return user
}
