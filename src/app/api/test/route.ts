import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.categories.findMany()
  return Response.json({ data: categories })
}