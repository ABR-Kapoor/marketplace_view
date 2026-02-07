import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { createClient } from '@/utils/supabase/server';

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

        const supabase = await createClient();

        // Check if user exists in database
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', kindeUser.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user:', fetchError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        if (existingUser) {
            // Check if user is a patient
            if (existingUser.role !== 'patient') {
                return NextResponse.json({ error: 'Access denied: User is not a patient' }, { status: 403 });
            }

            // Update last login
            await supabase
                .from('users')
                .update({
                    last_login: new Date().toISOString(),
                })
                .eq('uid', existingUser.uid);

            return NextResponse.json({ user: existingUser });
        } else {
            // Auto-create patient user for marketplace
            console.log('User not found in DB, creating new patient account...', kindeUser.email);

            // 1. Create User with role 'patient'
            const { data: newUser, error: createUserError } = await supabase
                .from('users')
                .insert({
                    auth_id: kindeUser.id,
                    email: kindeUser.email,
                    name: `${kindeUser.given_name || ''} ${kindeUser.family_name || ''}`.trim() || kindeUser.email,
                    role: 'patient',
                    is_active: true,
                    is_verified: true,
                    phone: kindeUser.phone_number || null,
                    profile_image_url: kindeUser.picture || null,
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (createUserError) {
                console.error('Error creating user:', createUserError);
                return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
            }

            // 2. Create Patient Profile (will be auto-created by trigger, but we can verify)
            // The database trigger should handle this automatically

            return NextResponse.json({ user: newUser });
        }

    } catch (error) {
        console.error('Sync user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
