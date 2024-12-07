import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
 
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = JSON.parse(JSON.stringify(req.body));
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Invalid payload', received: body });
  }

  const { id, title, authors, media_type, copyright, translators, subjects, bookshelves, languages, formats } = body;

  if (!title || !authors || !subjects || !bookshelves || !languages || !formats) {
    return res.status(400).json({ error: 'Missing required fields', body, received: [title , !authors , !subjects , !bookshelves , !languages , !formats] });
  }

  try {
    // Check or create metadata for authors
    const authorRecords = await Promise.all(
      authors.map(async (author: any) => {
       
        const existingAuthor = await prisma.person.findUnique({
          where: { name: author.name },
        });
        if (existingAuthor) return existingAuthor;
      
        return prisma.person.create({
          data: {
            name: author.name,
            birth_year: author.birth_year,
            death_year: author.death_year,
          },
        });
      })
    );
    
    // Check or create metadata for translators
    let translatorRecords:any[] = [];
    if (translators.length > 0) {
    translatorRecords = await Promise.all(
      translators.map(async (translator: any) => {
       
        const existingTranslator = await prisma.person.findUnique({
          where: { name: translator.name },
        });
        if (existingTranslator) return existingTranslator;

        return prisma.person.create({
          data: {
            name: translator.name,
            birth_year: translator.birth_year,
            death_year: translator.death_year,
          },
        });
      })
    );
  }
  
    // Check or create metadata for bookshelves
    const bookshelfRecords = await Promise.all(
      bookshelves.map(async (shelf: string) => {
        const existingShelf = await prisma.bookshelf.findUnique({
          // @ts-ignore
          where: { name: shelf },
        });
        if (existingShelf) return existingShelf;

        return prisma.bookshelf.create({
          data: { name: shelf },
        });
      })
    );
    
    // Check or create metadata for subjects
    const subjectRecords = await Promise.all(
      subjects.map(async (subject: string) => {
        const existingSubject = await prisma.subject.findUnique({
          // @ts-ignore
          where: { name: subject },
        });
        if (existingSubject) return existingSubject;

        return prisma.subject.create({
          data: { name: subject },
        });
      })
    );
    const bookData:any = {
      id,
      title,
      media_type,
      copy_right: copyright,
      authors: {
        create: authorRecords.map((author) => ({
          person_id: author.id,
        })),
      },
      bookshelves: {
        create: bookshelfRecords.map((shelf) => ({
          shelf_id: shelf.id,
        })),
      },
      subjects: {
        create: subjectRecords.map((subject) => ({
          subject_id: subject.id,
        })),
      },
      languages: {
        create: languages.map((language: string) => ({
          language_code: language,
        })),
      }
    }
    if (translatorRecords?.length > 0) {
       bookData["translators"] = {
        create: translatorRecords.map((translator) => ({
          person_id: translator.id,
        })),
      } 
    }


    // Create the book
    const book = await prisma.book.create({
      data: bookData
    });

    res.status(201).json({ book });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error saving data', error});
  } finally {
    await prisma.$disconnect();
  }
}
