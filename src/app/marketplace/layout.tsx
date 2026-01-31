import { Navbar } from '@/components/Navbar'
import { getCartCount } from '@/utils/cart'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const dynamic = 'force-dynamic'

export default async function MarketplaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const cartCount = await getCartCount()
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    const userName = user ? `${user.given_name || ''} ${user.family_name || ''}`.trim() : undefined;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-teal-100 selection:text-teal-900">
            <Navbar cartCount={cartCount} userName={userName} />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
