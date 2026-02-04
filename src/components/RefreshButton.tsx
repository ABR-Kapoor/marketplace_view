'use client'

import { RotateCcw } from 'lucide-react'

export function RefreshButton() {
    return (
        <button
            className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm text-emerald-700 font-bold px-8 py-4 rounded-full border border-emerald-200 hover:bg-emerald-50/80 hover:shadow-lg hover:shadow-emerald-100/30 transition-all duration-300 active:scale-95"
            onClick={() => window.location.reload()}
        >
            <RotateCcw className="h-4 w-4" />
            Refresh Page
        </button>
    )
}
