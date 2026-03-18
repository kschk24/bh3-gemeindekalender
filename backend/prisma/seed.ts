import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Kultur' },
      update: {},
      create: { name: 'Kultur', color: '#8B5CF6' },
    }),
    prisma.category.upsert({
      where: { name: 'Sport' },
      update: {},
      create: { name: 'Sport', color: '#10B981' },
    }),
    prisma.category.upsert({
      where: { name: 'Bildung' },
      update: {},
      create: { name: 'Bildung', color: '#3B82F6' },
    }),
    prisma.category.upsert({
      where: { name: 'Musik' },
      update: {},
      create: { name: 'Musik', color: '#F59E0B' },
    }),
    prisma.category.upsert({
      where: { name: 'Familie' },
      update: {},
      create: { name: 'Familie', color: '#EC4899' },
    }),
    prisma.category.upsert({
      where: { name: 'Umwelt' },
      update: {},
      create: { name: 'Umwelt', color: '#14B8A6' },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gemeinde.de' },
    update: {},
    create: {
      email: 'admin@gemeinde.de',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { email: 'user@example.de' },
    update: {},
    create: {
      email: 'user@example.de',
      passwordHash: userPassword,
      role: Role.USER,
    },
  });

  console.log('Created users: admin@gemeinde.de (pw: admin123), user@example.de (pw: user123)');

  // Create sample events
  const now = new Date();
  const events = [
    {
      title: 'Sommerkonzert im Park',
      description: 'Genießen Sie einen wunderbaren Abend mit Live-Musik im Stadtpark. Verschiedene lokale Bands spielen ein buntes Programm von Jazz bis Pop.',
      location: 'Stadtpark',
      address: 'Parkstraße 1, 12345 Musterstadt',
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      categoryId: categories[3].id, // Musik
      requiresAccount: false,
      maxParticipants: 500,
      createdBy: admin.id,
      accessibility: {
        create: {
          wheelchairAccessible: true,
          hearingLoop: true,
          signLanguage: false,
          easyLanguage: true,
        },
      },
    },
    {
      title: 'Yoga im Freien',
      description: 'Kostenlose Yoga-Stunde für alle Levels. Bitte eigene Matte mitbringen.',
      location: 'Bürgerwiese',
      address: 'Am Rathaus 5, 12345 Musterstadt',
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000),
      categoryId: categories[1].id, // Sport
      requiresAccount: true,
      maxParticipants: 30,
      createdBy: admin.id,
      accessibility: {
        create: {
          wheelchairAccessible: true,
          hearingLoop: false,
          signLanguage: false,
          easyLanguage: true,
        },
      },
    },
    {
      title: 'Kunstausstellung: Lokale Künstler',
      description: 'Eine Ausstellung mit Werken von Künstlern aus unserer Gemeinde. Eintritt frei.',
      location: 'Kulturzentrum',
      address: 'Kulturplatz 10, 12345 Musterstadt',
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
      categoryId: categories[0].id, // Kultur
      requiresAccount: false,
      createdBy: admin.id,
      accessibility: {
        create: {
          wheelchairAccessible: true,
          hearingLoop: true,
          signLanguage: true,
          easyLanguage: true,
        },
      },
    },
    {
      title: 'Vortrag: Klimawandel und lokale Maßnahmen',
      description: 'Experten erklären, wie unsere Gemeinde zum Klimaschutz beitragen kann.',
      location: 'Rathaus, Großer Saal',
      address: 'Rathausplatz 1, 12345 Musterstadt',
      startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      categoryId: categories[5].id, // Umwelt
      requiresAccount: false,
      maxParticipants: 100,
      createdBy: admin.id,
      accessibility: {
        create: {
          wheelchairAccessible: true,
          hearingLoop: true,
          signLanguage: true,
          easyLanguage: false,
        },
      },
    },
    {
      title: 'Kinderfest',
      description: 'Ein buntes Programm für die ganze Familie mit Spielen, Basteln und Unterhaltung.',
      location: 'Marktplatz',
      address: 'Marktplatz, 12345 Musterstadt',
      startDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      categoryId: categories[4].id, // Familie
      requiresAccount: false,
      createdBy: admin.id,
      accessibility: {
        create: {
          wheelchairAccessible: true,
          hearingLoop: false,
          signLanguage: false,
          easyLanguage: true,
        },
      },
    },
  ];

  // TestFest – Demo-Event für alle Entwickler
  await prisma.event.upsert({
    where: { id: 'seed-testfest-2026' },
    update: {},
    create: {
      id: 'seed-testfest-2026',
      title: 'TestFest',
      description: 'Ein großes Gemeindefest auf der Großen Wiese mit Musik, Essen und Unterhaltung für die ganze Familie. Eintritt frei!',
      location: 'Große Wiese',
      address: 'Große Wiese 1, 12345 Musterstadt',
      startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      categoryId: categories[0].id, // Kultur
      requiresAccount: false,
      imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop',
      createdBy: admin.id,
      accessibility: {
        create: {
          wheelchairAccessible: true,
          hearingLoop: false,
          signLanguage: true,
          easyLanguage: true,
        },
      },
    },
  });

  for (const eventData of events) {
    const { accessibility, ...rest } = eventData;
    await prisma.event.create({
      data: {
        ...rest,
        accessibility,
      },
    });
  }

  console.log(`Created ${events.length + 1} sample events (incl. TestFest)`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
