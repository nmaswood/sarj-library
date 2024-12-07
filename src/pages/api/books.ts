import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Fetch books with related data, including PlotSummary, Character, and SentimentAnalysis
      const books = await prisma.book.findMany({
        include: {
          authors: {
            include: { person: true },
          },
          translators: {
            include: { person: true },
          },
          subjects: {
            include: { subject: true },
          },
          bookshelves: {
            include: { shelf: true },
          },
          languages: true,
          formats: true,
          plotSummaries: {
            select: {
              summary: true, // English summary
              arabicTranslate: true, // Arabic summary
            },
          },
          characters: true, // Include characters related to the book
          sentimentAnalyses: true, // Include sentiment analysis related to the book
        },
      });
      
      const formattedBooks = books.map((book) => {
        const plotSummary = book?.plotSummaries?.[0] || {};
        const sentimentAnalysis = book?.sentimentAnalyses?.[0] || {};
        

        const characters = book?.characters || [];
        console.log(characters);
        const aiData = {
          summary: plotSummary.summary || '',
          plot_summary: {
            summary: plotSummary.summary || '',
            arabic: plotSummary.arabicTranslate || '',
          },
          main_chars: characters?.map((char) => char) || [],
          sentiment_analysis: sentimentAnalysis?.sentiment || '',
          languages: book?.languages?.map((language) => language.language_code) || [],
        };
      
        return {
          id: book.id,
          title: book.title,
          authors: book?.authors?.map((author) => ({
            name: author.person.name,
            birth_year: author.person.birth_year,
            death_year: author.person.death_year,
          })) || [],
          translators: book?.translators?.map((translator) => ({
            name: translator.person.name,
            birth_year: translator.person.birth_year,
            death_year: translator.person.death_year,
          })) || [],
          subjects: book?.subjects?.map((subject) => subject.subject.name) || [],
          bookshelves: book?.bookshelves?.map((bookshelf) => bookshelf.shelf.name) || [],
          languages: book?.languages?.map((language) => language.language_code) || [],
          copyright: book.copy_right || false,
          media_type: book.media_type || '',
          local: true,
          aiData,
        };
      });
    

      return res.status(200).json(formattedBooks);
    } else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
}
