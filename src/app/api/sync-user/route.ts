import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import sql from '@/lib/db';

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

        const [existingUser] = await sql`SELECT * FROM users WHERE auth_id = ${kindeUser.id}`;

        if (existingUser) {
            if (existingUser.role !== 'patient') {
                return NextResponse.json({ error: 'Access denied: User is not a patient' }, { status: 403 });
            }

            await sql`UPDATE users SET last_login = ${new Date().toISOString()} WHERE uid = ${existingUser.uid}`;

            return NextResponse.json({ user: existingUser });
        } else {
            console.log('User not found in DB, creating new patient account...', kindeUser.email);

            const [newUser] = await sql`
                INSERT INTO users (auth_id, email, name, role, is_active, is_verified, phone, profile_image_url, updated_at)
                VALUES (${kindeUser.id}, ${kindeUser.email}, ${`${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim() || kindeUser.email}, 'patient', true, true, ${kindeUser.phone_number || null}, ${kindeUser.picture || null}, ${new Date().toISOString()})
                RETURNING *
            `;

            return NextResponse.json({ user: newUser });
        }

    } catch (error) {
        console.error('Sync user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
