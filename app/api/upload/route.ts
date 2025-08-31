import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const type = formData.get('type') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'tmp', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const uploadedPaths: string[] = [];

    for (const file of files) {
      // Validate file type and size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }

      // Validate file extension based on type
      const allowedExtensions = {
        screamingFrog: ['.csv', '.xls', '.xlsx'],
        ahrefs: ['.csv', '.xls', '.xlsx'],
        ga4: ['.csv', '.json'],
        gtm: ['.csv', '.json'],
        screenshots: ['.png', '.jpg', '.jpeg', '.webp'],
      };

      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions[type as keyof typeof allowedExtensions]?.includes(fileExtension)) {
        return NextResponse.json(
          { error: `Invalid file type for ${type}. Allowed: ${allowedExtensions[type as keyof typeof allowedExtensions]?.join(', ')}` },
          { status: 400 }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const filename = `${type}_${timestamp}_${randomString}${fileExtension}`;
      const filepath = join(uploadsDir, filename);

      // Write file to disk
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      uploadedPaths.push(filepath);
    }

    return NextResponse.json({
      success: true,
      paths: uploadedPaths,
      count: uploadedPaths.length,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}


