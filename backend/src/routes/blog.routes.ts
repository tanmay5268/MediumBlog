import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import {verify} from "hono/jwt";

export const blogRouter = new Hono<{
    Bindings: {
        ACCELERATE_URL: string
        JWT_SECRET: string
    }
    Variables: {
        userId: number
    }
}>()
blogRouter.use(async (c, next) => {
    const jwt = c.req.header('Authorization');
	if (!jwt) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	const token = jwt.split(' ')[1];
	const payload = await verify(token, c.env.JWT_SECRET, 'HS256');
	if (!payload) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	c.set('userId', Number(payload.id));
	await next()
});

blogRouter.post('/',async(c)=>{
    const body = await c.req.json();
         const  prisma = new PrismaClient({
            log: ['query', 'info', 'warn', 'error'],
            accelerateUrl:c.env.ACCELERATE_URL
        }).$extends(withAccelerate())
        const post = await prisma.blogPost.create({
            data:{
                title:body.title,
                content:body.content,
                authorId:c.get('userId')
            }
        })
        return c.json({post,message:'Blog post created successfully'})
})

blogRouter.put('/', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		log: ['query', 'info', 'warn', 'error'],
        accelerateUrl: c.env.ACCELERATE_URL
	}).$extends(withAccelerate());

	const body = await c.req.json();
	prisma.blogPost.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});

	return c.text('updated post');
});

blogRouter.get('/:id', async (c) => {
	const id = c.req.param('id');
	const prisma = new PrismaClient({
		log: ['query', 'info', 'warn', 'error'],
        accelerateUrl:c.env.ACCELERATE_URL
	}).$extends(withAccelerate());

	const post = await prisma.blogPost  .findUnique({
		where: {
			id: Number(id)
		}
	});

	return c.json(post);
})
