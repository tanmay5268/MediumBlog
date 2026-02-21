import { Hono } from 'hono'
import {sign, verify} from 'hono/jwt'
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
const app = new Hono<{
    Bindings: {
        ACCELERATE_URL: string
        JWT_SECRET: string
    },
    Variables: {
        userId: number
    }
}>()
app.use('/blog/*', async (c, next) => {
    const header =c.req.header('Authorization')|| "";
    const token = header.split(" ")[1];
    const response = await verify(token, c.env.JWT_SECRET, 'HS256');
    const userId = response?.userId; // Extract user ID from the token payload
    c.set('userId', Number(response.id)); // Set user ID in the context
    console.log(response);
    if(!response){
        return c.json({
          error:"unauthorized"
        },401)
    }
    c.set('userId', Number(response.id))
    await next();
    console.log("next call");

})
app.post('/blog', async (c) => {
    // create blog post
    const body = await c.req.json();
    console.log(body);
     const  prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        accelerateUrl:c.env.ACCELERATE_URL
    }).$extends(withAccelerate())
    console.log(c.get('userId'));
    const post = await prisma.blogPost.create({
        data:{
            title:body.title,
            content:body.content,
            authorId:c.get('userId')
        }
    })
    return c.json({post,message:'Blog post created successfully'})
})
app.put('/blog/:id', async (c) => {})
app.post('/signup',async (c)=>{
    // create user
    const body = await c.req.json();
    const url = c.env.ACCELERATE_URL;
     const  prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        accelerateUrl:url
    }).$extends(withAccelerate())
    const user = await prisma.user.create({
        data:{
            name:body.name,
            email:body.email
        }
    })
    const token = await sign({id:user.id}, c.env.JWT_SECRET)
    return c.json({user,message:'User created successfully',token})
})

app.post('/signin', async (c) => {
    // sign in user
    const body = await c.req.json();
     const  prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
        accelerateUrl:c.env.ACCELERATE_URL
    }).$extends(withAccelerate())
    const user = await prisma.user.findUnique({
        where:{
            email:body.email
        }
    })
    if(!user){
        return c.json({message:'User not found'},404)
    }
    const token = await sign({id:user.id}, c.env.JWT_SECRET)
    return c.json({user,message:'User signed in successfully',token})
})


export default app
