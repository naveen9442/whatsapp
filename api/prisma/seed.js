const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const AGENT_NAMES = [
  { name: 'Rajesh Sharma', phone: '+919810123456' },
  { name: 'Priya Patel', phone: '+919820234567' },
  { name: 'Amit Verma', phone: '+919830345678' },
  { name: 'Sneha Reddy', phone: '+919840456789' },
  { name: 'Vikram Malhotra', phone: '+919850567890' },
];

const CONTACT_NAMES = [
  'Aarav Kumar', 'Diya Mehta', 'Vivaan Gupta', 'Ananya Singh', 'Aditya Joshi',
  'Ishaan Bansal', 'Riya Chawla', 'Kabir Das', 'Myra Saxena', 'Arjun Kapoor',
  'Saanvi Deshmukh', 'Reyansh Nair', 'Kavya Pillai', 'Ayaan Bhatt', 'Aanya Rao',
  'Dhruv Sen', 'Pari Agarwal', 'Krishna Iyer', 'Avani Kulkarni', 'Shaurya Bose',
  'Meera Jain', 'Devansh Roy', 'Siya Nambiar', 'Atharv Menon', 'Prisha Ghosh',
  'Aryan Hegde', 'Sara Sethi', 'Rudra Pandey', 'Tara Trivedi', 'Rohan Bhatia',
  'Anvi Varma', 'Manan Tiwari', 'Kiara Shukla', 'Yash Pathak', 'Zoya Khan',
  'Advait Dixit', 'Navya Mishra', 'Samarth Kashyap', 'Bhavya Grover', 'Darsh Mittal',
  'Tanvi Chauhan', 'Lakshya Somani', 'Charvi Ahuja', 'Rishi Kaul', 'Gauri Deol',
  'Nirvaan Goel', 'Isha Talwar', 'Parth Bajaj', 'Kriti Mathur', 'Madhav Rastogi'
];

async function seed() {
  console.log('🚀 Starting database seed...');

  // 1. Create or update Demo Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: { name: 'Demo Company' },
    create: {
      id: 'tenant-demo',
      name: 'Demo Company',
      slug: 'demo',
    },
  });
  console.log(`✅ Tenant created/updated: ${tenant.name} (${tenant.id})`);

  // 2. Create Users
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.com' } },
    update: { passwordHash: adminHash, role: 'ADMIN' },
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.com',
      passwordHash: adminHash,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const viewerHash = await bcrypt.hash('viewer123', 10);
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'viewer@demo.com' } },
    update: { passwordHash: viewerHash, role: 'VIEWER' },
    create: {
      tenantId: tenant.id,
      email: 'viewer@demo.com',
      passwordHash: viewerHash,
      name: 'Viewer User',
      role: 'VIEWER',
    },
  });
  console.log('✅ Users created: admin@demo.com and viewer@demo.com');

  // 3. Create 5 Agents
  const agentRecords = [];
  for (const ag of AGENT_NAMES) {
    const record = await prisma.agent.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: ag.name } },
      update: { phone: ag.phone },
      create: {
        tenantId: tenant.id,
        name: ag.name,
        phone: ag.phone,
      },
    });
    agentRecords.push(record);
  }
  console.log(`✅ Created ${agentRecords.length} agents`);

  // 4. Create 50 Contacts
  const contactRecords = [];
  for (let i = 0; i < CONTACT_NAMES.length; i++) {
    const phone = `+9198${(10000000 + i * 137).toString().slice(0, 8)}`;
    const contact = await prisma.contact.upsert({
      where: { tenantId_phone: { tenantId: tenant.id, phone } },
      update: { name: CONTACT_NAMES[i] },
      create: {
        tenantId: tenant.id,
        phone,
        name: CONTACT_NAMES[i],
      },
    });
    contactRecords.push(contact);
  }
  console.log(`✅ Created ${contactRecords.length} contacts`);

  // 5. Generate 30 days of historical data
  console.log('⏳ Generating 30 days of message and payment activity...');
  const now = new Date();

  await prisma.dailyMetric.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.payment.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.paymentLink.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.message.deleteMany({ where: { tenantId: tenant.id } });

  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - dayOffset));
    const dayStr = date.toISOString().slice(0, 10);
    const daySeed = (dayOffset * 17) % 50;
    const msgCount = 50 + daySeed;

    const agentStats = new Map();
    for (const ag of agentRecords) {
      agentStats.set(ag.id, {
        sent: 0,
        delivered: 0,
        read: 0,
        failed: 0,
        replies: 0,
        linksShared: 0,
        paymentsReceived: 0,
        amountReceived: 0,
      });
    }

    for (let m = 0; m < msgCount; m++) {
      const agent = agentRecords[(m + dayOffset) % agentRecords.length];
      const contact = contactRecords[(m * 3 + dayOffset) % contactRecords.length];
      const stats = agentStats.get(agent.id);

      const hour = 9 + (m % 10);
      const minute = (m * 7) % 60;
      const sentTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hour, minute));

      const roll = (m * 13 + dayOffset * 7) % 100;
      let status = 'READ';
      let deliveredTime = new Date(sentTime.getTime() + 15000);
      let readTime = new Date(sentTime.getTime() + 45000);
      let failedTime = null;
      let error = null;

      if (roll < 10) {
        status = 'FAILED';
        deliveredTime = null;
        readTime = null;
        failedTime = new Date(sentTime.getTime() + 5000);
        error = 'User phone unreachable or opted out';
        stats.failed++;
      } else if (roll < 45) {
        status = 'DELIVERED';
        readTime = null;
        stats.delivered++;
      } else {
        status = 'READ';
        stats.read++;
      }

      stats.sent++;

      const waMsgId = `wamid.HBgL${dayOffset}_${m}_${Date.now().toString(36)}`;
      const outbound = await prisma.message.create({
        data: {
          tenantId: tenant.id,
          waMessageId: waMsgId,
          direction: 'OUTBOUND',
          status,
          agentId: agent.id,
          contactId: contact.id,
          body: `Hello ${contact.name}, this is ${agent.name} regarding your request.`,
          sentAt: sentTime,
          deliveredAt: deliveredTime,
          readAt: readTime,
          failedAt: failedTime,
          error,
          createdAt: sentTime,
        },
      });

      if (status !== 'FAILED' && (roll % 3 === 0)) {
        const replyTime = new Date(sentTime.getTime() + 120000);
        await prisma.message.create({
          data: {
            tenantId: tenant.id,
            waMessageId: `wamid.inbound_${dayOffset}_${m}`,
            direction: 'INBOUND',
            status: 'SENT',
            agentId: agent.id,
            contactId: contact.id,
            body: 'Thanks for reaching out! Please share the invoice link.',
            sentAt: replyTime,
            createdAt: replyTime,
          },
        });
        stats.replies++;

        if (roll % 2 === 0) {
          const linkTime = new Date(replyTime.getTime() + 60000);
          const linkRef = `plink_${dayOffset}_${m}`;
          const amount = [499, 999, 1499, 2499, 4999][(m + dayOffset) % 5];
          const isPaid = roll % 4 !== 0;

          const linkMsg = await prisma.message.create({
            data: {
              tenantId: tenant.id,
              waMessageId: `wamid.link_${dayOffset}_${m}`,
              direction: 'OUTBOUND',
              status: 'READ',
              agentId: agent.id,
              contactId: contact.id,
              body: `Here is your payment link: https://rzp.io/l/${linkRef} for Rs.${amount}`,
              sentAt: linkTime,
              deliveredAt: new Date(linkTime.getTime() + 5000),
              readAt: new Date(linkTime.getTime() + 15000),
              createdAt: linkTime,
            },
          });
          stats.sent++;
          stats.read++;
          stats.linksShared++;

          const pl = await prisma.paymentLink.create({
            data: {
              tenantId: tenant.id,
              providerRef: linkRef,
              provider: 'razorpay',
              amount,
              currency: 'INR',
              status: isPaid ? 'PAID' : 'SHARED',
              messageId: linkMsg.id,
              sharedAt: linkTime,
              paidAt: isPaid ? new Date(linkTime.getTime() + 300000) : null,
              createdAt: linkTime,
            },
          });

          if (isPaid) {
            const payTime = new Date(linkTime.getTime() + 300000);
            await prisma.payment.create({
              data: {
                tenantId: tenant.id,
                providerRef: `pay_${linkRef}`,
                paymentLinkId: pl.id,
                amount,
                currency: 'INR',
                status: 'captured',
                paidAt: payTime,
                createdAt: payTime,
              },
            });
            stats.paymentsReceived++;
            stats.amountReceived += amount;
          }
        }
      }
    }

    for (const [agId, stat] of agentStats.entries()) {
      await prisma.dailyMetric.upsert({
        where: {
          tenantId_date_agentId: {
            tenantId: tenant.id,
            date,
            agentId: agId,
          },
        },
        update: {
          messagesSent: stat.sent,
          delivered: stat.delivered,
          read: stat.read,
          failed: stat.failed,
          replies: stat.replies,
          linksShared: stat.linksShared,
          paymentsReceived: stat.paymentsReceived,
          amountReceived: stat.amountReceived,
        },
        create: {
          tenantId: tenant.id,
          date,
          agentId: agId,
          messagesSent: stat.sent,
          delivered: stat.delivered,
          read: stat.read,
          failed: stat.failed,
          replies: stat.replies,
          linksShared: stat.linksShared,
          paymentsReceived: stat.paymentsReceived,
          amountReceived: stat.amountReceived,
        },
      });
    }

    if (dayOffset % 5 === 0) {
      console.log(`  Processed day ${dayStr} (Offset -${dayOffset}d)`);
    }
  }

  console.log('🎉 Seed completed successfully!');
}

seed()
  .catch((err) => {
    console.error('❌ Seed error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
