import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { bookId, title } = req.body;

  if (!bookId || !title) {
    return res.status(400).json({ message: 'Missing required fields: bookId or title'});
  }

  try {
    // Define the URL for downloading the book
    const bookUrl = `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`;

    // Define the file path for saving the book
    const booksDir = path.join(process.cwd(), 'public', 'books');
    const filePath = path.join(booksDir, `${bookId}.txt`);

    // Ensure the books directory exists
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir, { recursive: true });
    }

    // Fetch the book content
    const response = await axios.get(bookUrl, { responseType: 'stream' });

    // Save the content to the file
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    // Wait for the writing to finish
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    res.status(200).json({ message: 'Book downloaded and saved successfully' });
  } catch (error) {
    console.error('Error downloading or saving the book:', error);
    res.status(500).json({ message: 'Failed to download and save the book' });
  }
}
