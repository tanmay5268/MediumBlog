import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";

export const userRouter = new Hono<{
    Bindings: {
        ACCELERATE_URL: string
        JWT_SECRET: string
    }
}>()

userRouter.post('/signup', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        accelerateUrl: c.env.ACCELERATE_URL
    }).$extends(withAccelerate())
    const user = await prisma.user.create({
        data: {
            email: body.email,
            name: body.name,
        }
    })
    const token = await sign({ id: user.id }, c.env.JWT_SECRET)
    return c.json({ user, message: 'User created successfully', token })
})

userRouter.post('/signin', async (c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        accelerateUrl: c.env.ACCELERATE_URL
    }).$extends(withAccelerate())
    const user = await prisma.user.findUnique({
        where: {
            email: body.email
        }
    })
    if (!user) {
        return c.json({ message: 'User not found' }, 404)
    }
    const token = await sign({ id: user.id }, c.env.JWT_SECRET)
    return c.json({ user, message: 'User signed in successfully', token })
})
