import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { syncUserToDatabase } from "@/lib/auth/sync-user";

export default async function AuthCallbackPage() {
  const { getUser, isAuthenticated } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    redirect("/api/auth/login");
  }

  const user = await getUser();
  
  if (user) {
    try {
      // Cast to any to bypass strict type check if needed, or rely on compatible structure
      await syncUserToDatabase(user as any);
    } catch (error) {
      console.error("Failed to sync user:", error);
    }
  }

  redirect("/");
}
