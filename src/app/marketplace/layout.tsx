import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import sql from '@/lib/db';
import MarketplaceLayoutClient from '@/components/MarketplaceLayoutClient';

export default async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, getUser } = getKindeServerSession();

  const authenticated = await isAuthenticated();
  const user = authenticated ? await getUser() : null;

  // Only check role if user is authenticated
  if (authenticated && user?.id) {
    try {
      const [userData] = await sql`
        SELECT role FROM users WHERE auth_id = ${user.id}
      `;

      // Block only delivery_boy from accessing marketplace
      if (userData?.role === 'delivery_boy') {
        console.log(`Blocking ${userData.role} from marketplace access`);
        redirect('/unauthorized');
      }
    } catch (error: any) {
      // Re-throw redirect errors so they work properly
      if (error?.name === 'NEXT_REDIRECT') throw error;
      console.error('Error fetching user role:', error);
    }
  }

  return (
    <MarketplaceLayoutClient
      userName={user ? `${user.given_name || ''} ${user.family_name || ''}`.trim() || user.email || 'Guest' : undefined}
      userImage={user?.picture ?? undefined}
      userEmail={user?.email || undefined}
      isAuthenticated={!!authenticated}
    >
      {children}
    </MarketplaceLayoutClient>
  );
}
