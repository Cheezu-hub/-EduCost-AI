const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const colleges = [
  {
    name: 'Massachusetts Institute of Technology',
    country: 'USA', city: 'Cambridge',
    degreeTypes: ['BS', 'MS', 'PhD'],
    tuitionAvg: 57986, placementRate: 94, avgSalary: 105000,
    ranking: 1, currency: 'USD',
    tags: ['STEM', 'Research', 'Ivy-Adjacent'],
  },
  {
    name: 'Stanford University',
    country: 'USA', city: 'Stanford',
    degreeTypes: ['BS', 'MS', 'MBA', 'PhD'],
    tuitionAvg: 61731, placementRate: 95, avgSalary: 112000,
    ranking: 2, currency: 'USD',
    tags: ['Tech', 'Business', 'Research'],
  },
  {
    name: 'University of Toronto',
    country: 'Canada', city: 'Toronto',
    degreeTypes: ['BS', 'MS', 'PhD'],
    tuitionAvg: 45000, placementRate: 88, avgSalary: 72000,
    ranking: 18, currency: 'CAD',
    tags: ['Research', 'Public', 'Affordable'],
  },
  {
    name: 'University of Melbourne',
    country: 'Australia', city: 'Melbourne',
    degreeTypes: ['BS', 'MS', 'MBA'],
    tuitionAvg: 38000, placementRate: 85, avgSalary: 68000,
    ranking: 33, currency: 'AUD',
    tags: ['Research', 'Business', 'International'],
  },
  {
    name: 'Indian Institute of Technology Bombay',
    country: 'India', city: 'Mumbai',
    degreeTypes: ['BTech', 'MTech', 'PhD'],
    tuitionAvg: 200000, placementRate: 92, avgSalary: 1800000,
    ranking: 149, currency: 'INR',
    tags: ['STEM', 'Engineering', 'Affordable'],
  },
  {
    name: 'University College London',
    country: 'UK', city: 'London',
    degreeTypes: ['BSc', 'MSc', 'PhD'],
    tuitionAvg: 28000, placementRate: 87, avgSalary: 42000,
    ranking: 9, currency: 'GBP',
    tags: ['Research', 'Liberal Arts', 'International'],
  },
  {
    name: 'National University of Singapore',
    country: 'Singapore', city: 'Singapore',
    degreeTypes: ['BS', 'MS', 'PhD'],
    tuitionAvg: 38000, placementRate: 90, avgSalary: 58000,
    ranking: 8, currency: 'SGD',
    tags: ['STEM', 'Business', 'Asia-Pacific'],
  },
  {
    name: 'Arizona State University Online',
    country: 'USA', city: 'Tempe',
    degreeTypes: ['BS', 'MS', 'MBA'],
    tuitionAvg: 10978, placementRate: 78, avgSalary: 61000,
    ranking: 1, currency: 'USD',
    tags: ['Online', 'Affordable', 'Flexible'],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  await prisma.user.upsert({
    where: { email: 'admin@educost.ai' },
    update: {},
    create: {
      name: 'EduCost Admin',
      email: 'admin@educost.ai',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  // Demo student
  const studentHash = await bcrypt.hash('Student@1234', 12);
  const student = await prisma.user.upsert({
    where: { email: 'demo@educost.ai' },
    update: {},
    create: {
      name: 'Demo Student',
      email: 'demo@educost.ai',
      passwordHash: studentHash,
      role: 'STUDENT',
      profile: {
        create: {
          studentType: 'INTERNATIONAL',
          country: 'India',
          currency: 'USD',
          familyIncome: 25000,
        },
      },
    },
  });

  // Colleges
  for (const college of colleges) {
    await prisma.college.upsert({
      where: { id: college.name }, // won't match, always creates
      update: college,
      create: college,
    }).catch(() => prisma.college.create({ data: college }));
  }

  console.log('✅ Seed complete');
  console.log('   Admin: admin@educost.ai / Admin@1234');
  console.log('   Demo:  demo@educost.ai  / Student@1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
