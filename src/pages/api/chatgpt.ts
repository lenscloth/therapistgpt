import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const chatHistory = req.body;

  console.log(chatHistory);
  console.log(process.env['OPENAI_API_KEY']);
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: chatHistory,
    stream: false,
  });

  console.log(completion);
  const chatGptResponse = completion.choices[0].message?.content;

  res.status(200).json({ chatGptResponse });
}
