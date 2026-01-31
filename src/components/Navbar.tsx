'use client'

import Link from 'next/link'
import { ShoppingCart, LogOut, User } from 'lucide-react'
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export function Navbar({ cartCount = 0, userName }: { cartCount?: number; userName?: string }) {
    return (
        <nav className="sticky top-0 z-50 bg-transparent transition-all duration-300 backdrop-blur-[2px]">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/marketplace" className="flex items-center gap-3 group">
                    <div className="relative h-10 w-10 hover:opacity-90 transition-opacity">
                        <img src="/logo_transparent.png" alt="AuraMart Logo" className="h-full w-full object-contain" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent tracking-tight">
                        AuraMart
                    </span>
                </Link>
                <div className="flex items-center gap-8">
                    <Link href="/marketplace/orders" className="text-base font-semibold text-gray-700 hover:text-emerald-700 transition-colors">
                        My Orders
                    </Link>
                    <Link href="/marketplace/cart" className="relative p-2 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all group">
                        <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full animate-pulse-primary">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    {userName && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/60 border border-emerald-100 rounded-full backdrop-blur-md shadow-sm">
                            <User className="h-5 w-5 text-emerald-600" />
                            <span className="text-base font-bold text-gray-800">{userName}</span>
                        </div>
                    )}
                    <LogoutLink
                        className="flex items-center gap-2 px-4 py-2 text-base font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="hidden sm:inline">Logout</span>
                    </LogoutLink>
                </div>
            </div>
        </nav>
    )
}
