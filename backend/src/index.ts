import { Hono } from 'hono'
import { createPrisma } from '../libs/prisma'
enum HttpStatus {
    // 2xx Success
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    RESET_CONTENT = 205,
    PARTIAL_CONTENT = 206,

    // 3xx Redirection
    MULTIPLE_CHOICES = 300,
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,

    // 4xx Client Error
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    CONFLICT = 409,
    GONE = 410,
    UNPROCESSABLE_ENTITY = 422,
    TOO_MANY_REQUESTS = 429,

    // 5xx Server Error
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
}
type Bindings = {
    DATABASE_URL: string
}
const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
    return c.text('Hello Hono!')
})
app.get('/api/v1/blog/bulk', (c) => {
    return c.json({
        "blog": []
    })
})

app.get('/api/v1/blog/:id', (c) => {
    const Id = c.req.param('id')
    return c.json({ id: Id })
})
app.post('/api/v1/user/signup', async (c) => {
    const url = c.env.DATABASE_URL;
    const prisma = createPrisma(url);
    const body = await c.req.json();
    try {
        await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: body.password,
            }
        })
        return c.json({
            message: "user created"
        }, HttpStatus.CREATED)
    } catch (error) {
        return c.json({
            message: "Check your requestbody"
        }, HttpStatus.BAD_REQUEST)
    }

})

app.post('/api/v1/user/signin', (c) => {
    return c.text("helo");
})
app.post('/api/v1/blog', (c) => {
    return c.text("helo");
})

app.put('/api/v1/blog', (c) => {
    return c.text("helo");
})
export default app
