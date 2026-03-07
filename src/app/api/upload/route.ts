import { NextRequest, NextResponse } from 'next/server';
import { createNhostClient, withAdminSession } from '@nhost/nhost-js';

const nhost = createNhostClient({
    subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN || 'ynwkhelqhehjlxlhhjfj',
    region: process.env.NEXT_PUBLIC_NHOST_REGION || 'ap-south-1',
    configure: [
        withAdminSession({
            adminSecret: process.env.NHOST_ADMIN_SECRET!,
            role: 'admin'
        })
    ]
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const bucket = (formData.get('bucket') as string) || 'default';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

        const nhostFile = new File([buffer], fileName, { type: file.type });

        const { body } = await nhost.storage.uploadFiles({
            'file[]': [nhostFile],
            'bucket-id': bucket,
        });

        const fileMetadata = body.processedFiles[0];

        if (!fileMetadata) {
            return NextResponse.json({ error: 'Upload failed: no file processed' }, { status: 500 });
        }

        const storageUrl = nhost.storage.baseURL;
        const publicUrl = `${storageUrl}/files/${fileMetadata.id}`;

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error: any) {
        console.error('Upload API error:', error);
        const errorMessage = error.body?.error?.message || error.message || 'Unknown upload error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
