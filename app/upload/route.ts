import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file: File | null = formData.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Asegurarse de que exista la carpeta temporal
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, file.name);
  await writeFile(filePath, buffer);

  return NextResponse.json({ message: 'File uploaded successfully', filePath });
}
