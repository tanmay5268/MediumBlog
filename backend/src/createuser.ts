import {prisma} from '../libs/prisma'


async function main() {
 await prisma.user.create({
    data:{
        name:"rahul",
        email:"rahul.mewati95@gmail.com",
        password:"rahul@2006",
    }
 })
}
main().then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
