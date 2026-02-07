import { createClient } from '@/utils/supabase/server'
import { MedicineCard } from '@/components/MedicineCard'
import { Search, Filter, Sparkles, ShieldCheck, Truck, Clock, TrendingUp, ChevronRight, Pill } from 'lucide-react'
import { redirect } from 'next/navigation'
import { RealtimeMedicines } from '@/components/RealtimeMedicines'
import { RefreshButton } from '@/components/RefreshButton'
import { SearchBar } from '@/components/SearchBar'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = 'force-dynamic'

export default async function MarketplacePage(props: {
    searchParams: Promise<{ q?: string; category?: string }>
}) {
    const searchParams = await props.searchParams

    const supabase = await createClient()


    const q = searchParams.q || ''
    const category = searchParams.category || 'All'

    let medicines: any[] | null = null;

    if (q) {
        console.log(`[Page] Attempting fuzzy search for: ${q}`);
        // Try RPC first for "almost correct" spelling
        const { data: fuzzyData, error: fuzzyError } = await supabase
            .rpc('search_medicines', { search_term: q });
        
        if (!fuzzyError && fuzzyData) {
             console.log(`[Page] Fuzzy search successful. Found ${fuzzyData.length} matches.`);
             // Apply category filter in memory since RPC returned all matches
             if (category && category !== 'All') {
                 medicines = fuzzyData.filter((m: any) => m.category === category);
             } else {
                 medicines = fuzzyData;
             }
        } else {
            console.warn(`[Page] Fuzzy search unavailable (${fuzzyError?.message}), falling back to standard search.`);
        }
    }

    // Fallback or Initial Load if fuzzy search didn't run or failed
    if (!medicines) {
        let query = supabase.from('medicines').select('*')

        if (q) {
            query = query.ilike('name', `%${q}%`)
        }
        if (category && category !== 'All') {
            query = query.eq('category', category)
        }

        // default sort
        query = query.order('name')

        console.log(`[Page] Fetching medicines (Standard)... q=${q}, category=${category}`);
        const { data } = await query
        medicines = data;
    }
    
    console.log(`[Page] Final result count: ${medicines?.length || 0}`);

    const categories = ['All', 'Pain Relief', 'Antibiotics', 'Allergy', 'Vitamins', 'First Aid']

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f0fdf9] via-white to-[#e6faf5]">
            <RealtimeMedicines />
            {/* Background Elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-200/20 to-teal-100/15 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-l from-cyan-100/15 to-blue-50/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-0 w-64 h-64 bg-gradient-to-r from-mint-100/10 to-transparent rounded-full blur-2xl"></div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 md:pb-10">
                {/* Hero Section */}
                <div className="relative mb-10 md:mb-14">
                    {/* Glassmorphism Container - Increased Intensity */}
                    <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl md:rounded-4xl p-6 md:p-10 border border-white/60 shadow-2xl shadow-emerald-200/40 overflow-hidden">
                        {/* Gradient Orbs */}
                        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-r from-emerald-300/15 to-teal-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
                        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-l from-cyan-300/10 to-blue-400/5 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"></div>

                        {/* Content */}
                        <div className="relative z-10">
                            {/* Welcome and Search Row */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-10 mb-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                                            <Pill className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold text-emerald-700 bg-emerald-100/60 px-4 py-1.5 rounded-full backdrop-blur-sm">
                                            Verified Pharmacy
                                        </span>
                                    </div>

                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
                                        <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                                            Medicine Marketplace
                                        </span>
                                    </h1>
                                    <p className="text-gray-600 text-base md:text-lg font-medium max-w-2xl">
                                        Discover genuine medicines with verified quality. Fast, reliable delivery to your doorstep.
                                    </p>
                                </div>

                                <SearchBar initialQuery={q} />
                            </div>

                            {/* Trust Indicators */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100/50">
                                {[
                                    { icon: ShieldCheck, text: "Verified Quality", desc: "100% authentic" },
                                    { icon: Truck, text: "Fast Delivery", desc: "2-4 hours" },
                                    { icon: Clock, text: "24/7 Available", desc: "Always ready" },
                                    { icon: TrendingUp, text: "Best Prices", desc: "Price match" }
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all duration-300 cursor-default"
                                    >
                                        <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg">
                                            <item.icon className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{item.text}</p>
                                            <p className="text-xs text-gray-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Section */}
                <div className="mb-10 md:mb-12">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                            Categories
                            <span className="text-emerald-600 font-normal ml-2">
                                • {medicines?.length || 0} medicines
                            </span>
                        </h2>
                        <ChevronRight className="h-5 w-5 text-gray-400 md:hidden" />
                    </div>

                    {/* Scrollable Category Chips */}
                    <div className="relative">
                        <div className="flex gap-3 pb-4 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide md:scrollbar-default">
                            {categories.map((c) => (
                                <a
                                    key={c}
                                    href={`/marketplace?category=${c}&q=${q}`}
                                    className={`
                                        relative inline-flex items-center gap-2 whitespace-nowrap px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300
                                        ${category === c
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-200/50 transform scale-105'
                                            : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:text-emerald-700 border border-gray-200/60 hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-lg hover:shadow-emerald-100/30'
                                        }
                                        active:scale-95
                                    `}
                                >
                                    {category === c && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></span>
                                    )}
                                    {c}
                                    {category === c && (
                                        <Sparkles className="h-3 w-3" />
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {medicines && medicines.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {medicines.map((medicine, index) => (
                            <div
                                key={medicine.id}
                                className="transform transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="group relative h-full">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="relative h-full bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-lg shadow-emerald-100/10 hover:shadow-2xl hover:shadow-emerald-100/30 group-hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                                        <MedicineCard medicine={medicine} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Enhanced Empty State */
                    <div className="col-span-full">
                        <div className="relative py-20 md:py-32 text-center rounded-3xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-emerald-50/60 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-300/50"></div>
                            <div className="relative z-10 px-4">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-200/50">
                                    <Search className="h-12 w-12 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">No medicines found</h3>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto text-base md:text-lg">
                                    Try adjusting your search or filter to find what you need.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="/marketplace"
                                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-8 py-4 rounded-full hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300 active:scale-95 transform hover:-translate-y-0.5"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Clear All Filters
                                    </a>
                                    <RefreshButton />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Spacing */}
                <div className="h-20"></div>
            </div>

            {/* Floating Quick Actions (Mobile Only) */}
            <div className="fixed bottom-6 right-6 z-30 md:hidden">
                <button
                    className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-2xl shadow-emerald-300/50 active:scale-95 transition-all duration-300"
                    aria-label="Quick actions"
                >
                    <div className="relative">
                        <Filter className="w-6 h-6" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full animate-ping"></span>
                    </div>
                </button>
            </div>

            {/* Loading Indicator (Optional - Shows during search) */}
            {q && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
                    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl px-6 py-4 rounded-full shadow-xl shadow-emerald-100/50">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent"></div>
                        <span className="text-sm font-medium text-gray-700">Searching medicines...</span>
                    </div>
                </div>
            )}
        </div>
    )
}