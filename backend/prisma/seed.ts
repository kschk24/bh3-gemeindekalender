import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create categories
  // Colors chosen for WCAG AA contrast (≥4.5:1) with white text
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Kultur' },
      update: { color: '#6D28D9' },
      create: { name: 'Kultur', color: '#6D28D9' },   // violet-700  5.9:1
    }),
    prisma.category.upsert({
      where: { name: 'Sport' },
      update: { color: '#047857' },
      create: { name: 'Sport', color: '#047857' },    // emerald-700 5.5:1
    }),
    prisma.category.upsert({
      where: { name: 'Bildung' },
      update: { color: '#1D4ED8' },
      create: { name: 'Bildung', color: '#1D4ED8' },  // blue-700    6.7:1
    }),
    prisma.category.upsert({
      where: { name: 'Musik' },
      update: { color: '#B45309' },
      create: { name: 'Musik', color: '#B45309' },    // amber-700   5.1:1
    }),
    prisma.category.upsert({
      where: { name: 'Familie' },
      update: { color: '#BE185D' },
      create: { name: 'Familie', color: '#BE185D' },  // pink-700    6.0:1
    }),
    prisma.category.upsert({
      where: { name: 'Umwelt' },
      update: { color: '#0F766E' },
      create: { name: 'Umwelt', color: '#0F766E' },   // teal-700    5.5:1
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

  // Create event manager user
  const eventManagerPassword = await bcrypt.hash('event123', 10);
  await prisma.user.upsert({
    where: { email: 'event@manager.de' },
    update: {},
    create: {
      email: 'event@manager.de',
      passwordHash: eventManagerPassword,
      role: Role.EVENT_MANAGER,
    },
  });

  console.log('Created users: admin@gemeinde.de (pw: admin123), user@example.de (pw: user123), event@manager.de (pw: event123)');

  // Create sample events
  const now = new Date();
  const events = [
    {
      title: 'Sommerkonzert im Park',
      description: 'Genießen Sie einen wunderbaren Abend mit Live-Musik im Englischen Garten. Verschiedene lokale Bands spielen ein buntes Programm von Jazz bis Pop.',
      location: 'Englischer Garten',
      address: 'Englischer Garten 1, 80538 München',
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
      location: 'Olympiapark',
      address: 'Spiridon-Louis-Ring 21, 80809 München',
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
      location: 'Gasteig München',
      address: 'Rosenheimer Str. 5, 81667 München',
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
      location: 'Neues Rathaus München',
      address: 'Marienplatz 8, 80331 München',
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
      location: 'Viktualienmarkt',
      address: 'Viktualienmarkt 3, 80331 München',
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
      location: 'Theresienwiese',
      address: 'Theresienwiese, 80339 München',
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
