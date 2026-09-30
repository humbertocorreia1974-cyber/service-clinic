const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const senha = bcrypt.hashSync('Demo@1234', 10);

async function main() {
  const users = [
    { email: 'admin@demo.app', name: 'Administrador Demo', role: 'admin' },
    { email: 'cliente@demo.app', name: 'Cliente Demo', role: 'cliente' },
    { email: 'gerente@demo.app', name: 'Gerente Demo', role: 'gerente' },
    { email: 'tecnico@demo.app', name: 'Técnico Demo', role: 'tecnico' },
    { email: 'jogador@demo.app', name: 'Jogador Demo', role: 'user' },
  ];
  const created = {};
  try {
    for (const u of users) {
      created[u.role] = await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: { email: u.email, name: u.name, passwordHash: senha, role: u.role, plan: 'pro', termsAcceptedAt: new Date() },
      });
    }
  } catch (e) { console.warn('[seed] pulou User:', e.message); }

  const admin = created.admin;
  const clienteUser = created.cliente;
  const tecnicoUser = created.tecnico;

  let client;
  try {
    client = await prisma.client.upsert({
      where: { cnpj: '12.345.678/0001-90' },
      update: {},
      create: {
        userId: clienteUser?.id, razaoSocial: 'Clínica Odonto Sorriso LTDA', nomeFantasia: 'Odonto Sorriso',
        cnpj: '12.345.678/0001-90', email: 'contato@odontosorriso.com.br', phone: '(24) 3344-5566',
        whatsapp: '(24) 99876-5432', addressStreet: 'Rua das Flores', addressNumber: '120',
        addressDistrict: 'Centro', addressCity: 'Volta Redonda', addressState: 'RJ', addressZip: '27253-000',
        latitude: -22.5231, longitude: -44.1042, notes: 'Cliente demo', active: true,
      },
    });
  } catch (e) { console.warn('[seed] pulou Client:', e.message); }

  let client2;
  try {
    client2 = await prisma.client.upsert({
      where: { cnpj: '98.765.432/0001-10' },
      update: {},
      create: {
        razaoSocial: 'Consultório Dental Vida LTDA', nomeFantasia: 'Dental Vida',
        cnpj: '98.765.432/0001-10', email: 'contato@dentalvida.com.br', phone: '(24) 3322-1100',
        whatsapp: '(24) 99123-4567', addressStreet: 'Av. Amaral Peixoto', addressNumber: '450',
        addressDistrict: 'Centro', addressCity: 'Barra Mansa', addressState: 'RJ', addressZip: '27310-000',
        latitude: -22.5443, longitude: -44.1712, active: true,
      },
    });
  } catch (e) { console.warn('[seed] pulou Client2:', e.message); }

  let tech;
  try {
    if (tecnicoUser) {
      tech = await prisma.technician.upsert({
        where: { userId: tecnicoUser.id },
        update: {},
        create: {
          userId: tecnicoUser.id, name: 'Carlos Andrade', phone: '(24) 99888-7777',
          email: 'tecnico@demo.app', cities: ['Volta Redonda', 'Barra Mansa', 'Resende'],
          specialties: ['cadeira_odontologica', 'autoclave', 'compressor'], active: true,
        },
      });
    }
  } catch (e) { console.warn('[seed] pulou Technician:', e.message); }

  let equip;
  try {
    if (client) {
      const n = await prisma.equipment.count();
      if (n === 0) {
        await prisma.equipment.createMany({
          data: [
            { clientId: client.id, category: 'cadeira_odontologica', brand: 'Dabi Atlante', model: 'Eagle', serialNumber: 'CAD-001', location: 'Sala 1', active: true },
            { clientId: client.id, category: 'autoclave', brand: 'Cristófoli', model: 'Vitale 21', serialNumber: 'AUT-002', location: 'Esterilização', active: true },
            { clientId: client2.id, category: 'compressor', brand: 'Schulz', model: 'MSV 6', serialNumber: 'CMP-003', location: 'Casa de máquinas', active: true },
          ],
        });
      }
      equip = await prisma.equipment.findFirst({ where: { clientId: client.id } });
    }
  } catch (e) { console.warn('[seed] pulou Equipment:', e.message); }

  try {
    if (client && admin) {
      const n = await prisma.serviceOrder.count();
      if (n === 0) {
        await prisma.serviceOrder.createMany({
          data: [
            { code: 'OS-0001', clientId: client.id, equipmentId: equip?.id, technicianId: tech?.id, createdById: admin.id, assignedToId: tecnicoUser?.id, type: 'preventiva', status: 'concluida', priority: 'normal', description: 'Manutenção preventiva da cadeira', city: 'Volta Redonda', totalValue: 350.00, scheduledAt: new Date(), finishedAt: new Date() },
            { code: 'OS-0002', clientId: client.id, createdById: admin.id, type: 'corretiva', status: 'em_andamento', priority: 'alta', description: 'Autoclave não aquece', city: 'Volta Redonda', totalValue: 480.00, scheduledAt: new Date() },
            { code: 'OS-0003', clientId: client2.id, createdById: admin.id, type: 'higienizacao_ac', status: 'aberta', priority: 'baixa', description: 'Higienização do compressor', city: 'Barra Mansa', totalValue: 200.00 },
          ],
        });
      }
    }
  } catch (e) { console.warn('[seed] pulou ServiceOrder:', e.message); }

  try {
    if (client && admin) {
      const n = await prisma.contract.count();
      if (n === 0) {
        await prisma.contract.createMany({
          data: [
            { code: 'CT-0001', clientId: client.id, equipmentId: equip?.id, createdById: admin.id, title: 'Contrato Preventivo Anual', periodicity: 'trimestral', value: 900.00, startDate: new Date(), endDate: new Date(Date.now() + 365 * 864e5), nextVisitAt: new Date(Date.now() + 30 * 864e5), status: 'ativo', autoRenew: true },
            { code: 'CT-0002', clientId: client2.id, createdById: admin.id, title: 'Contrato Mensal Compressor', periodicity: 'mensal', value: 250.00, startDate: new Date(), endDate: new Date(Date.now() + 180 * 864e5), nextVisitAt: new Date(Date.now() + 15 * 864e5), status: 'ativo', autoRenew: true },
          ],
        });
      }
    }
  } catch (e) { console.warn('[seed] pulou Contract:', e.message); }

  try {
    if (client && admin) {
      const n = await prisma.visit.count();
      if (n === 0) {
        await prisma.visit.createMany({
          data: [
            { clientId: client.id, technicianId: tech?.id, createdById: admin.id, assignedToId: tecnicoUser?.id, scheduledAt: new Date(Date.now() + 2 * 864e5), durationMin: 90, city: 'Volta Redonda', status: 'agendada', notes: 'Levar peças de reposição' },
            { clientId: client2.id, technicianId: tech?.id, createdById: admin.id, scheduledAt: new Date(Date.now() + 5 * 864e5), durationMin: 60, city: 'Barra Mansa', status: 'confirmada', confirmedVia: 'whatsapp' },
          ],
        });
      }
    }
  } catch (e) { console.warn('[seed] pulou Visit:', e.message); }

  try {
    if (client) {
      const n = await prisma.invoice.count();
      if (n === 0) {
        await prisma.invoice.createMany({
          data: [
            { number: 'NF-0001', clientId: client.id, issueDate: new Date(), dueDate: new Date(Date.now() + 15 * 864e5), subtotal: 350.00, discount: 0, total: 350.00, status: 'pendente' },
            { number: 'NF-0002', clientId: client2.id, issueDate: new Date(Date.now() - 30 * 864e5), dueDate: new Date(Date.now() - 15 * 864e5), paidAt: new Date(Date.now() - 10 * 864e5), subtotal: 250.00, discount: 0, total: 250.00, status: 'paga' },
          ],
        });
      }
    }
  } catch (e) { console.warn('[seed] pulou Invoice:', e.message); }

  try {
    const n = await prisma.part.count();
    if (n === 0) {
      await prisma.part.createMany({
        data: [
          { sku: 'PC-001', name: 'Resistência Autoclave', category: 'autoclave', brand: 'Cristófoli', compatibleWith: ['Vitale 21'], costPrice: 80.00, salePrice: 150.00, stockQty: 10, minStockQty: 2, unit: 'un', publicVisible: true, active: true },
          { sku: 'PC-002', name: 'Óleo Compressor', category: 'compressor', brand: 'Schulz', compatibleWith: ['MSV 6'], costPrice: 40.00, salePrice: 90.00, stockQty: 20, minStockQty: 5, unit: 'L', publicVisible: true, active: true },
          { sku: 'PC-003', name: 'Filtro Cadeira', category: 'cadeira', brand: 'Dabi Atlante', compatibleWith: ['Eagle'], costPrice: 25.00, salePrice: 60.00, stockQty: 15, minStockQty: 3, unit: 'un', publicVisible: true, active: true },
        ],
      });
    }
  } catch (e) { console.warn('[seed] pulou Part:', e.message); }

  try {
    if (client) {
      const n = await prisma.lead.count();
      if (n === 0) {
        await prisma.lead.createMany({
          data: [
            { clientId: client.id, assignedToId: admin?.id, name: 'João Silva', email: 'joao@email.com', phone: '(24) 99999-1111', source: 'site', status: 'novo', notes: 'Interessado em contrato' },
            { clientId: client2.id, assignedToId: admin?.id, name: 'Maria Souza', email: 'maria@email.com', phone: '(24) 99999-2222', source: 'indicacao', status: 'contatado' },
          ],
        });
      }
    }
  } catch (e) { console.warn('[seed] pulou Lead:', e.message); }

  try {
    if (admin) {
      const n = await prisma.notification.count();
      if (n === 0) {
        await prisma.notification.createMany({
          data: [
            { userId: admin.id, title: 'Nova OS criada', message: 'OS-0002 aguardando técnico', read: false },
            { userId: admin.id, title: 'Contrato vencendo', message: 'CT-0002 vence em 15 dias', read: false },
          ],
        });
      }
    }
  } catch (e) { console.warn('[seed] pulou Notification:', e.message); }
}

main().then(()=>prisma.$disconnect()).catch(async(e)=>{console.error('[seed] ERRO:',e.message);await prisma.$disconnect();process.exitCode = 0;});