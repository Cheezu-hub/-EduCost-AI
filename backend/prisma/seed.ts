import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
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
  const studentHash = await bcrypt.hash('Student@123', 12);
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
          country: 'IN',
          currency: 'USD',
          familyIncome: 40000,
        },
      },
    },
  });

  // Colleges seed data
  const colleges = [
    {
      name: 'Massachusetts Institute of Technology',
      country: 'US',
      city: 'Cambridge, MA',
      degreeTypes: ['BS', 'MS', 'PhD', 'MBA'],
      tuitionAvg: 57986,
      placementRate: 0.97,
      avgSalary: 120000,
      ranking: 1,
      tags: ['STEM', 'Research', 'Ivy-League', 'Engineering'],
    },
    {
      name: 'Stanford University',
      country: 'US',
      city: 'Stanford, CA',
      degreeTypes: ['BS', 'MS', 'PhD', 'MBA'],
      tuitionAvg: 61731,
      placementRate: 0.96,
      avgSalary: 130000,
      ranking: 2,
      tags: ['STEM', 'Business', 'Research', 'Silicon-Valley'],
    },
    {
      name: 'Harvard University',
      country: 'US',
      city: 'Cambridge, MA',
      degreeTypes: ['BA', 'BS', 'MS', 'PhD', 'MBA', 'JD', 'MD'],
      tuitionAvg: 54768,
      placementRate: 0.98,
      avgSalary: 135000,
      ranking: 3,
      tags: ['Ivy-League', 'Research', 'Law', 'Medicine', 'Business'],
    },
    {
      name: 'University of California, Berkeley',
      country: 'US',
      city: 'Berkeley, CA',
      degreeTypes: ['BS', 'BA', 'MS', 'PhD', 'MBA'],
      tuitionAvg: 44066,
      placementRate: 0.94,
      avgSalary: 105000,
      ranking: 4,
      tags: ['STEM', 'Public', 'Research', 'Engineering'],
    },
    {
      name: 'Carnegie Mellon University',
      country: 'US',
      city: 'Pittsburgh, PA',
      degreeTypes: ['BS', 'MS', 'PhD'],
      tuitionAvg: 59864,
      placementRate: 0.95,
      avgSalary: 115000,
      ranking: 5,
      tags: ['CS', 'AI', 'Robotics', 'Engineering'],
    },
    {
      name: 'University of Toronto',
      country: 'CA',
      city: 'Toronto, ON',
      degreeTypes: ['BS', 'BA', 'MS', 'PhD', 'MBA'],
      tuitionAvg: 45000,
      placementRate: 0.91,
      avgSalary: 80000,
      ranking: 18,
      tags: ['Research', 'STEM', 'Public', 'Affordable'],
    },
    {
      name: 'Imperial College London',
      country: 'UK',
      city: 'London',
      degreeTypes: ['BSc', 'MSc', 'PhD'],
      tuitionAvg: 38000,
      placementRate: 0.93,
      avgSalary: 70000,
      ranking: 7,
      tags: ['STEM', 'Engineering', 'Research', 'Europe'],
    },
    {
      name: 'National University of Singapore',
      country: 'SG',
      city: 'Singapore',
      degreeTypes: ['BS', 'MS', 'PhD', 'MBA'],
      tuitionAvg: 29000,
      placementRate: 0.92,
      avgSalary: 75000,
      ranking: 11,
      tags: ['Asia', 'STEM', 'Business', 'Affordable'],
    },
    {
      name: 'Indian Institute of Technology Bombay',
      country: 'IN',
      city: 'Mumbai',
      degreeTypes: ['BTech', 'MTech', 'PhD', 'MBA'],
      tuitionAvg: 2200,
      placementRate: 0.95,
      avgSalary: 35000,
      ranking: 149,
      tags: ['India', 'STEM', 'Affordable', 'Engineering'],
    },
    {
      name: 'Technical University of Munich',
      country: 'DE',
      city: 'Munich',
      degreeTypes: ['BSc', 'MSc', 'PhD'],
      tuitionAvg: 3500,
      placementRate: 0.90,
      avgSalary: 65000,
      ranking: 28,
      tags: ['Europe', 'Engineering', 'Free-Tuition', 'Research'],
    },
    {
      name: 'University of Melbourne',
      country: 'AU',
      city: 'Melbourne',
      degreeTypes: ['BS', 'BA', 'MS', 'PhD', 'MBA'],
      tuitionAvg: 42000,
      placementRate: 0.89,
      avgSalary: 72000,
      ranking: 33,
      tags: ['Australia', 'Research', 'STEM', 'Business'],
    },
    {
      name: 'Georgia Institute of Technology',
      country: 'US',
      city: 'Atlanta, GA',
      degreeTypes: ['BS', 'MS', 'PhD'],
      tuitionAvg: 31370,
      placementRate: 0.93,
      avgSalary: 98000,
      ranking: 35,
      tags: ['STEM', 'Engineering', 'Public', 'Value'],
    },
  ];

  for (const college of colleges) {
    await prisma.college.upsert({
      where: { id: college.name.toLowerCase().replace(/\s+/g, '-') },
      update: college,
      create: { id: college.name.toLowerCase().replace(/\s+/g, '-'), ...college },
    });
  }

  console.log(`✅ Seeded ${colleges.length} colleges`);
  console.log(`✅ Admin: admin@educost.ai / Admin@123`);
  console.log(`✅ Demo: demo@educost.ai / Student@123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
