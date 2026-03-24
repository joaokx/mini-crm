import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@yoog.com.br';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await prisma.user.create({
            data: {
                name: 'Yoog Admin',
                email,
                password: hashedPassword,
            }
        });
        console.log('✅ Usuário admin criado: admin@yoog.com.br (senha: 123456)');
    } else {
        console.log('ℹ️ O usuário admin já existe.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
