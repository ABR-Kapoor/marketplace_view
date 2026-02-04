'use client'

import { Search, Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

export function SearchBar({ initialQuery }: { initialQuery: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(initialQuery)
    const [isPending, startTransition] = useTransition()

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams)
        if (query) {
            params.set('q', query)
        } else {
            params.delete('q')
        }
        startTransition(() => {
            router.push(`/marketplace?${params.toString()}`)
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className="w-full lg:w-auto lg:min-w-[480px]">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400/30 to-teal-400/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-emerald-600 transition-all duration-300" />
                    </div>
                    <input
                        type="text"
                        name="q"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search medicines, brands, or symptoms..."
                        className="w-full pl-12 pr-4 py-4 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-emerald-400/40 focus:border-transparent shadow-lg shadow-emerald-100/20 transition-all duration-300"
                        suppressHydrationWarning
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <button
                            type="button"
                            className="p-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors duration-200"
                            aria-label="Open filters"
                            suppressHydrationWarning
                        >
                            <Filter className="h-4 w-4 text-emerald-600" />
                        </button>
                    </div>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 ml-1.5">
                Press Enter to search • Use filters below
            </p>
        </div>
    )
}
