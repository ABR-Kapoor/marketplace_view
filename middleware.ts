import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth(
    async function middleware(req: any) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.nextUrl.pathname}`);
    },
    {
        isReturnToCurrentPage: true,
        publicPaths: [
            "/",
            "/api/auth/:path*",
            "/auth-callback",
            "/_next/:path*",
            "/favicon.ico",
            "/images/:path*",
            "/marketplace", // Allow browsing marketplace without login
            "/logo_transparent.png" // Allow logo access
        ]
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes - handled individually if needed)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
