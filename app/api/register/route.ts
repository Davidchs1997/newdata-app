import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validación básica
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 409 })
    }

    // Encriptar la contraseña
    const hashedPassword = await hash(password, 10)

    // Crear el nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      { message: 'User created successfully.', user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER_POST_ERROR]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
