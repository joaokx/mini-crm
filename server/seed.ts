import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Admin user
    const email = 'admin@yoog.com.br';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await prisma.user.create({
            data: { name: 'Yoog Admin', email, password: hashedPassword }
        });
        console.log('✅ Usuário admin criado: admin@yoog.com.br (senha: 123456)');
    } else {
        console.log('ℹ️ O usuário admin já existe.');
    }

    // Sample patients
    const patientsData = [
        { name: 'Ana Paula Souza', phone: '11987654321' },
        { name: 'Carlos Eduardo Lima', phone: '11976543210' },
        { name: 'Fernanda Costa', phone: '11965432109' },
        { name: 'Roberto Almeida', phone: '11954321098' },
        { name: 'Mariana Oliveira', phone: '11943210987' },
    ];

    const existingPatients = await prisma.patient.count();
    if (existingPatients === 0) {
        const patients = await Promise.all(
            patientsData.map(p => prisma.patient.create({ data: p }))
        );
        console.log(`✅ ${patients.length} pacientes de exemplo criados.`);

        // Sample services
        const servicesData = [
            { description: 'Consulta de rotina', patientId: patients[0].id, status: 'FINALIZADO' },
            { description: 'Avaliação inicial', patientId: patients[1].id, status: 'EM_ATENDIMENTO' },
            { description: 'Retorno pós-exames', patientId: patients[2].id, status: 'AGUARDANDO' },
            { description: 'Triagem de emergência', patientId: patients[3].id, status: 'AGUARDANDO' },
            { description: 'Consulta de acompanhamento', patientId: patients[4].id, status: 'FINALIZADO' },
            { description: 'Exame de rotina', patientId: patients[0].id, status: 'AGUARDANDO' },
        ];

        const services = await Promise.all(
            servicesData.map(s => prisma.service.create({ data: s }))
        );
        console.log(`✅ ${services.length} atendimentos de exemplo criados.`);
    } else {
        console.log('ℹ️ Dados de exemplo já existem.');
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
