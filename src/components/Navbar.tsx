'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, LogOut, User, Menu, X, ClipboardList } from 'lucide-react'
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export function Navbar({ cartCount = 0, userName, userImage, isAuthenticated = false }: { cartCount?: number; userName?: string; userImage?: string | null; isAuthenticated?: boolean }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 transition-all duration-300 backdrop-blur-md border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/marketplace" className="flex items-center gap-2 md:gap-3 group shrink-0">
                    <div className="relative h-12 w-12 md:h-14 md:w-14 hover:opacity-90 transition-opacity">
                        <img src="/logo_transparent.png" alt="AuraMart Logo" className="h-full w-full object-contain" />
                    </div>
                    <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent tracking-tight">
                        AuraMart
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                    {isAuthenticated && (
                        <Link href="/marketplace/orders" className="text-sm font-semibold text-gray-700 hover:text-emerald-700 transition-colors">
                            My Orders
                        </Link>
                    )}
                    <Link href="/marketplace/cart" className="relative p-2 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all group">
                        <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full animate-pulse-primary">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    {isAuthenticated ? (
                        <>
                            {userName && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-100 rounded-full shadow-sm">
                                    {userImage ? (
                                        <img src={userImage} alt={userName} className="h-6 w-6 rounded-full object-cover border border-emerald-200" />
                                    ) : (
                                        <User className="h-4 w-4 text-emerald-600" />
                                    )}
                                    <span className="text-sm font-bold text-gray-800 max-w-[100px] truncate">{userName}</span>
                                </div>
                            )}
                            <LogoutLink
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Logout"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </LogoutLink>
                        </>
                    ) : (
                        <Link
                            href="/api/auth/login"
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm"
                        >
                            <User className="h-5 w-5" />
                            <span>Login</span>
                        </Link>
                    )}
                </div>

                {/* Mobile Actions */}
                <div className="flex md:hidden items-center gap-3">
                    <Link href="/marketplace/cart" className="relative p-2 text-gray-700">
                        <ShoppingCart className="h-6 w-6" />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-xl animate-in slide-in-from-top-2 p-4 flex flex-col gap-4">
                     {isAuthenticated ? (
                        <>
                            {userName && (
                                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
                                    {userImage ? (
                                        <img src={userImage} alt={userName} className="h-8 w-8 rounded-full object-cover border border-emerald-200" />
                                    ) : (
                                        <User className="h-5 w-5 text-emerald-600" />
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Signed in as</span>
                                        <span className="text-sm font-bold text-gray-900">{userName}</span>
                                    </div>
                                </div>
                            )}
                            <Link 
                                href="/marketplace/orders" 
                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl font-semibold transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <ClipboardList className="h-5 w-5" />
                                My Orders
                            </Link>
                            <LogoutLink
                                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors w-full text-left"
                            >
                                <LogOut className="h-5 w-5" />
                                Logout
                            </LogoutLink>
                        </>
                    ) : (
                        <Link
                            href="/api/auth/login"
                            className="flex items-center gap-3 px-4 py-3 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-semibold transition-colors w-full"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <User className="h-5 w-5" />
                            Login
                        </Link>
                    )}
                </div>
            )}
        </nav>
    )
}
