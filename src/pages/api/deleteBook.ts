import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const booksDir = path.join(process.cwd(), 'public', 'books');
    const filePath = path.join(booksDir, `${id}.txt`);
    // Remove the book from the database
    await prisma.book.delete({
      where: { id },
    });

    // Remove the file from the system
    const absoluteFilePath = path.resolve('./books', filePath);
    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
    }

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Failed to delete book' });
  }
}
