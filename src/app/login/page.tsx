'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()

    useEffect(() => {
        router.push('/api/auth/login')
    }, [router])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-10 w-10 text-teal-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Redirecting to secure login...</p>
            </div>
        </div>
    )
}
