import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE = { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } };

export async function GET(request: NextRequest) {
    try {
        const { getUser, isAuthenticated } = getKindeServerSession();

        if (!(await isAuthenticated())) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const kindeUser = await getUser();
        if (!kindeUser || !kindeUser.id) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const googleName = `${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim() || kindeUser.email;
        const googlePicture = kindeUser.picture || null;
        const googleEmail = kindeUser.email || null;

        const [existingUser] = await sql`SELECT * FROM users WHERE auth_id = ${kindeUser.id}`;

        if (existingUser) {
            // Sync Google data on every login:
            // - name/email: fill in if empty in DB (preserves manually set values)
            // - profile_image_url: fill in if null (preserves user-uploaded photos)
            const [updatedUser] = await sql`
                UPDATE users
                SET
                    last_login = ${new Date().toISOString()},
                    name = COALESCE(NULLIF(name, ''), ${googleName}),
                    email = COALESCE(email, ${googleEmail}),
                    profile_image_url = COALESCE(profile_image_url, ${googlePicture}),
                    updated_at = ${new Date().toISOString()}
                WHERE uid = ${existingUser.uid}
                RETURNING *
            `;

            return NextResponse.json({ user: updatedUser }, NO_CACHE);
        } else {
            // New user from Google sign-in via marketplace — create as patient
            console.log('New user via Google, creating patient account...', kindeUser.email);

            const [newUser] = await sql`
                INSERT INTO users (auth_id, email, name, role, is_active, is_verified, phone, profile_image_url, updated_at)
                VALUES (
                    ${kindeUser.id},
                    ${googleEmail},
                    ${googleName},
                    'patient',
                    true,
                    true,
                    ${kindeUser.phone_number || null},
                    ${googlePicture},
                    ${new Date().toISOString()}
                )
                RETURNING *
            `;

            return NextResponse.json({ user: newUser }, NO_CACHE);
        }

    } catch (error) {
        console.error('Sync user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
