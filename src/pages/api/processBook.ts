import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import axios, { AxiosError } from 'axios';

const prisma = new PrismaClient();
const booksDir = path.join(process.cwd(), 'public', 'books');

interface AIProviderResponse {
  choices: any;
  lang: never[];
  sentiment_analysis: any;
  plot_summary: any;
  summary: any;
  ar_translate: string;
  en_summary: string;
  ar_summary: string;
  main_chars: string[];
  main_idea: string;
}

const aiProviderConfig = {
    endpoint: process.env.AI_API_ENDPOINT || "",
    apiKey: process.env.AI_API_KEY || "",
};

// Function to send a chunk to the AI API
const processChunk = async (chunk: string): Promise<AIProviderResponse> => {
  try {
    const response = await axios.post<AIProviderResponse>(
      aiProviderConfig.endpoint,
      {
        stream: false,
        model: "gpt-3.5-turbo-0125",
        messages: [
          {
            role: "user",
            content: `${chunk} From this passage, please: 
              1. Summarize the paragraph.
              2. Identify the main characters.
              3. Plot Summary
              4. Sentiment Analysis
              Return the results in JSON format with the following keys: 
              'summary','main_chars', 'plot_summary', 'sentiment_analysis' if the paragraph doesn't have information return the same keys with empty strings.`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${aiProviderConfig.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const choices = response.data?.choices;
    const responseItems = choices.map((choice: { message: { content: string } }) => {
      try {
        return JSON.parse(choice.message?.content.replace("```", "").replace("json", ""));
      } catch (e) {
        console.log(e)
        return {};
      }
    });
    return responseItems.length === 1 ? responseItems[0] : responseItems;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error("Error calling AI API:", axiosError.response?.data || axiosError.message);
    throw new Error("AI API call failed");
  }
};

// Generator wrapper to process chunks sequentially
function* chunkProcessor(chunks: string[]): Generator<Promise<AIProviderResponse>, void, unknown> {
  for (const chunk of chunks) {
    yield processChunk(chunk); // Yield a Promise for each chunk
  }
}

// Sequential execution of the generator
async function processChunksSequentially(chunks: string[]): Promise<AIProviderResponse[]> {
  const results: AIProviderResponse[] = [];
  const generator = chunkProcessor(chunks);

  for (const promise of generator) {
    const result = await promise; // Process the Promise sequentially
    results.push(result); // Accumulate the result
  }

  return results;
}

// Function to split text into chunks
const splitTextIntoChunks = (text: string, chunkSize = 16000): string[] => {
  let paragraphs = text.split("\r\n");
  paragraphs = paragraphs.filter(p => p.length > 0);
  const chunks: string[] = [];
  let tmp = "";
  paragraphs.forEach((p, i) => {
    if (p.length < chunkSize) {
      if (tmp.length + p.length > chunkSize) {
        chunks.push(tmp);
        const prevParagraph = (i > 0 && paragraphs[i - 1].length + p.length < chunkSize) ? paragraphs[i - 1] + "\r\n" : ""; 
        tmp = prevParagraph + p;
      } else {
        tmp += p + "\r\n";
      }
    }
  });
  return chunks;
};
async function insertCharacters(mainChars: any[], bookId: number) {
  try {
    // Check if main_chars is available in the response and it's an array

    if (!Array.isArray(mainChars) || mainChars.length === 0) {
      console.log('No valid characters data available.');
      return;
    }

    // Validate and filter the data to ensure each character has the necessary fields
    const validCharacters = mainChars.filter((char: any) => {
      return char?.name && char?.classification && char?.alignment;
    });

    if (validCharacters.length === 0) {
      console.log('No valid characters to insert.');
      return;
    }

    // Insert valid characters into the database
    const insertedCharacters = await prisma.character.createMany({
      data: validCharacters.map((char: any) => ({
        name: char.name,
        classification: char.classification,
        alignment: char.alignment,
        bookId: bookId, // Ensure the bookId is passed correctly
      })),
    });
    return insertedCharacters;
  } catch (error) {
    console.error('Error inserting characters:', error);
  } finally {
    await prisma.$disconnect();
  }
}
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { id }: { id: number } = req.body;
  if (!id) {
    return res.status(400).json({ message: "Missing 'id' in request body" });
  }

  try {
    // Step 1: Read the book file
    const filePath = path.join(booksDir, `${id}.txt`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Book file not found" });
    }
    const text = fs.readFileSync(filePath, 'utf-8');

    // Step 2: Split text into chunks
    const chunks = splitTextIntoChunks(text);

    // Step 3: Process chunks sequentially
    const results = await processChunksSequentially(chunks);

    // Step 4: Combine results
    const summary = results.map((r) => r.summary).join("\n");
    const plot_summary = results.map((r) => r.plot_summary).join("\n");
    const sentiment_analysis = results.map((r) => r.sentiment_analysis).join("\n");
    const mainCharacters = results.flatMap((r) => r.main_chars || []);
    const lastRequestContent = `Here is the summary of the story : ${summary} and this is the plot summary of the story: ${plot_summary} and the main charchters in each chunk ${mainCharacters.join("\n")}
                and the sentiment analysis of each chuck seperated by new line ${sentiment_analysis}
                1. Combine the summary and plot summary into one coherent, structured text that focuses on the plot of the story..
                2. Analyze the names of the given characters, and the other information provided, and give me a list of the characters in the book without repetition and with the clearest name for each character. Note that one character was mentioned with several descriptions or names, classify the characters by two classifications: A- (Main character, Secondary character, Tertiary character) B- is the character: Good, bad, or neutral. I want the outcome always to be in the form of an array of objects, each object should contanin {name, classification, alignment}.
                3. Using the book summary, plot summary, and sentiment analysis sequence, give me a summary of the sentiment analysis of the book and its developments. always return as plain text and the key below.
                4.translate the plot summary into arabic
                Return the results in JSON format with the following keys: 
                'plot_summary','main_chars', 'sentiment_analysis', 'arabic_translate'`
   
    const response = await axios.post<AIProviderResponse>(
        aiProviderConfig.endpoint,
        {
          stream: false,
          model:"gpt-3.5-turbo-0125",
          messages: [
            {
              role: "user",
              content: lastRequestContent,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${aiProviderConfig.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      const choices = response.data?.choices;
      
      const responseItems = choices.map((choice: { message: { content: string } }) => {
        try {
           return JSON.parse(choice.message?.content.replace("```", "").replace("json", ""));
        } catch (e) {
          console.log(e)
          return {};
        }
      });
       
      if (responseItems?.length) {
        await prisma.plotSummary.deleteMany({
          where: {
            bookId: id, 
          },
        });
        const plotSummary = await prisma.plotSummary.create({
          data: {
            summary: responseItems[0]?.plot_summary || "",
            arabicTranslate: responseItems[0]?.arabic_translate || "",
            bookId: id, // The bookId is passed as a variable
          },
        });
        await prisma.sentimentAnalysis.deleteMany({
          where: {
            bookId: id, 
          },
        });
        const sentimentAnalysis = await prisma.sentimentAnalysis.create({
          data: {
            sentiment: responseItems[0]?.sentiment_analysis || "", // Insert sentiment text
            bookId: id, // The bookId is passed as a parameter
          },
        });
        await prisma.character.deleteMany({
          where: {
            bookId: id, 
          },
        });
        const charchters = insertCharacters(responseItems[0]?.main_chars, id)
        const aiData = {
          plotSummary,
          sentimentAnalysis,
          charchters
        }
        return res.status(200).json({
          message: "Processing complete",
          data : {aiData, id},
        });
      }
    return res.status(200).json({ message: "No response generated" });
  } catch (error) {
    console.error("Error processing book:", (error as Error).message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
