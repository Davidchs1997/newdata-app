import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const hashed = await hash(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashed },
    })

    return NextResponse.json({ message: 'User created successfully', user })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
