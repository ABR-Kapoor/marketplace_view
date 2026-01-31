import { createClient } from '@supabase/supabase-js';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/types';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function syncUserToDatabase(kindeUser: KindeUser) {
    if (!kindeUser || !kindeUser.id || !kindeUser.email) {
        throw new Error('Invalid Kinde user data');
    }

    const { id: kindeId, email, given_name, family_name } = kindeUser;
    const name = `${given_name || ''} ${family_name || ''}`.trim() || 'Unknown';

    // 1. Check if user exists by auth_id (Kinde ID)
    const { data: existingUserByAuth, error: authError } = await supabaseAdmin
        .from('users')
        .select('uid, role')
        .eq('auth_id', kindeId)
        .single();

    if (authError && authError.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error('Error checking user by auth_id:', authError);
    }

    if (existingUserByAuth) {
        // User exists, update last_login
        await supabaseAdmin
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('uid', existingUserByAuth.uid);

        return existingUserByAuth;
    }

    // 2. Check if user exists by email (Migration scenario)
    const { data: existingUserByEmail, error: emailError } = await supabaseAdmin
        .from('users')
        .select('uid, auth_id')
        .eq('email', email)
        .single();

    if (emailError && emailError.code !== 'PGRST116') {
        console.error('Error checking user by email:', emailError);
    }

    if (existingUserByEmail) {
        // User exists by email but has no auth_id (or different), link Kinde ID
        const { data: updatedUser, error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                auth_id: kindeId,
                last_login: new Date().toISOString(),
                is_verified: true // Assume verified if coming from Kinde
            })
            .eq('uid', existingUserByEmail.uid)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating user auth_id:', updateError);
            throw updateError;
        }
        return updatedUser;
    }

    // 3. Create new user
    // We strictly enforce role = 'patient' for this flow
    const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
            auth_id: kindeId,
            email: email,
            role: 'patient',
            name: name,
            is_verified: true,
            is_active: true,
        })
        .select()
        .single();

    if (createError) {
        console.error('Error creating new user:', createError);
        throw createError;
    }

    // 4. Create patient record
    // Logic: Only if role is patient, which it is.
    // Use upsert to handle potential duplicates safely
    const { error: patientError } = await supabaseAdmin
        .from('patients')
        .upsert({
            uid: newUser.uid,
            // Optional: map other fields if available
        }, { onConflict: 'uid' });

    if (patientError) {
        console.error('Error creating patient record:', patientError);
        // Note: We might want to rollback user creation here, but for now we log.
    }

    return newUser;
}
