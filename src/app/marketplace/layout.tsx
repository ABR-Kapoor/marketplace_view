import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from '@supabase/supabase-js';
import { Navbar } from '@/components/Navbar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      // Don't redirect, just log the error
    }

    // Block doctors and clinics from accessing marketplace
    if (userData?.role && userData.role !== 'patient') {
      console.log(`Blocking ${userData.role} from marketplace access`);
      redirect('/unauthorized');
    }
  }

  return (
    <>
      <Navbar 
        userName={user ? `${user.given_name || ''} ${user.family_name || ''}`.trim() || user.email || 'Guest' : undefined} 
        userImage={user?.picture || undefined}
        isAuthenticated={authenticated}
      />
      {children}
    </>
  );
}
