import { PrismaClient } from '@prisma/client'

declare global {
  // Evita que Next.js cree múltiples instancias del cliente en desarrollo
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
