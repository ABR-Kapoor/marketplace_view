import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE = { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } };

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const uid = searchParams.get('uid');

        if (!uid) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const [user] = await sql`SELECT * FROM users WHERE uid = ${uid}`;
        const [patient] = await sql`SELECT * FROM patients WHERE uid = ${uid}`;

        // Also fetch doctor-specific data if the user is a doctor
        let doctor = null;
        if (user?.role === 'doctor') {
            const [doctorRow] = await sql`SELECT * FROM doctors WHERE uid = ${uid}`;
            doctor = doctorRow || null;
        }

        return NextResponse.json(
            { success: true, user, patient: patient || null, doctor: doctor || null },
            NO_CACHE
        );
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { uid, user, patient } = await request.json();

        if (!uid) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Update users table (name, phone, profile_image_url) — same for all roles
        if (user) {
            const setFields: string[] = [];
            const values: any[] = [uid];

            if (user.name !== undefined) {
                setFields.push('name = $' + (values.length + 1));
                values.push(user.name);
            }
            if (user.phone !== undefined) {
                setFields.push('phone = $' + (values.length + 1));
                values.push(user.phone);
            }
            if (user.profile_image_url !== undefined) {
                setFields.push('profile_image_url = $' + (values.length + 1));
                values.push(user.profile_image_url);
            }

            if (setFields.length > 0) {
                await sql.unsafe(`UPDATE users SET ${setFields.join(', ')} WHERE uid = $1`, values);
            }
        }

        // Update address: route to doctors or patients table based on role
        if (patient) {
            const [currentUser] = await sql`SELECT role FROM users WHERE uid = ${uid}`;
            const role = currentUser?.role;

            const addr = {
                address_line1: patient.address_line1 !== undefined ? patient.address_line1 : null,
                address_line2: patient.address_line2 !== undefined ? patient.address_line2 : null,
                city: patient.city !== undefined ? patient.city : null,
                state: patient.state !== undefined ? patient.state : null,
                postal_code: patient.postal_code !== undefined ? patient.postal_code : null,
            };

            if (role === 'doctor') {
                // Doctors: write address to doctors table
                const [existingDoctor] = await sql`SELECT did FROM doctors WHERE uid = ${uid}`;
                if (existingDoctor) {
                    await sql`
                        UPDATE doctors
                        SET address_line1 = ${addr.address_line1},
                            address_line2 = ${addr.address_line2},
                            city = ${addr.city},
                            state = ${addr.state},
                            postal_code = ${addr.postal_code}
                        WHERE uid = ${uid}
                    `;
                }
                // If no doctor record exists yet (shouldn't happen but safe guard)
            } else {
                // Patients and other roles: write address to patients table
                const [existingPatient] = await sql`SELECT pid FROM patients WHERE uid = ${uid}`;
                if (existingPatient) {
                    await sql`
                        UPDATE patients
                        SET address_line1 = ${addr.address_line1},
                            address_line2 = ${addr.address_line2},
                            city = ${addr.city},
                            state = ${addr.state},
                            postal_code = ${addr.postal_code}
                        WHERE uid = ${uid}
                    `;
                } else {
                    await sql`
                        INSERT INTO patients (uid, address_line1, address_line2, city, state, postal_code)
                        VALUES (${uid}, ${addr.address_line1}, ${addr.address_line2}, ${addr.city}, ${addr.state}, ${addr.postal_code})
                    `;
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Profile updated successfully' }, NO_CACHE);
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({
            error: 'Failed to update profile',
            details: error.message || 'Unknown error'
        }, { status: 500 });
    }
}
