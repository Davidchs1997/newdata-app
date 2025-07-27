import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return NextResponse.json(user);
}
