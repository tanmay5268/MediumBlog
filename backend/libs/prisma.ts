import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

export const createPrisma = (databaseUrl: string) => {
  const adapter = new PrismaPg({ connectionString: databaseUrl })

  return new PrismaClient({ adapter }).$extends(withAccelerate())
}
