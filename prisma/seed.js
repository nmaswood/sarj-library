import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const languages = [
  { code: 'en', language: 'English' },
  { code: 'es', language: 'Spanish' },
  { code: 'fr', language: 'French' },
  { code: 'de', language: 'German' },
  { code: 'it', language: 'Italian' },
  { code: 'zh', language: 'Chinese' },
  { code: 'ja', language: 'Japanese' },
  { code: 'ko', language: 'Korean' },
  { code: 'ar', language: 'Arabic' },
  { code: 'ru', language: 'Russian' },
];

async function main() {
  console.log('Seeding languages...');
  
  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: {
        code: lang.code,
        language: lang.language,
      },
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
