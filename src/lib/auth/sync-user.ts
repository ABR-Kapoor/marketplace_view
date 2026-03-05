import sql from '@/lib/db';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/types';

export async function syncUserToDatabase(kindeUser: KindeUser) {
    if (!kindeUser || !kindeUser.id) {
        throw new Error('Invalid Kinde user data');
    }

    const { id: kindeId, email, given_name, family_name } = kindeUser;
    const name = `${given_name || ''} ${family_name || ''}`.trim() || 'Unknown';

    // 1. Check if user exists by auth_id (Kinde ID)
    const [existingUserByAuth] = await sql`SELECT uid, role FROM users WHERE auth_id = ${kindeId}`;

    if (existingUserByAuth) {
        // User exists, update last_login
        await sql`UPDATE users SET last_login = ${new Date().toISOString()} WHERE uid = ${existingUserByAuth.uid}`;
        return existingUserByAuth;
    }

    // 2. Check if user exists by email if provided
    if (email) {
        const [existingUserByEmail] = await sql`SELECT uid, auth_id FROM users WHERE email = ${email}`;

        if (existingUserByEmail) {
            // User exists by email but has no auth_id (or different), link Kinde ID
            const [updatedUser] = await sql`
                UPDATE users 
                SET auth_id = ${kindeId}, last_login = ${new Date().toISOString()}, is_verified = true
                WHERE uid = ${existingUserByEmail.uid}
                RETURNING *
            `;
            return updatedUser;
        }
    }

    // 3. Create new user strictly with 'patient' role
    const [newUser] = await sql`
        INSERT INTO users (auth_id, email, name, role, is_verified, is_active)
        VALUES (${kindeId}, ${email || ''}, ${name}, 'patient', true, true)
        RETURNING *
    `;

    // 4. Create patient record (although trigger might handle this, we can rely on trigger logic)
    // The DB trigger 'auto_manage_user_roles' automatically inserts into patients.

    return newUser;
}
