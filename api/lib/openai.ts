import OpenAI from "openai";
import 'dotenv/config'

export const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,

})

console.log(process.env.OPEN_AI_KEY);
