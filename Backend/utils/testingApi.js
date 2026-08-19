import OpenAI from "openai";
import dotenv from "dotenv";
// import axios from "axios";

dotenv.config();

const uri = process.env.OPENAI_API_KEY;
if (!uri) {
    throw new Error("OpenAI API key not found in environment variables");
}

const client = new OpenAI({
    apiKey: uri,
});



async function testOpenAI() {
    try {
        console.log("API key loaded:", !!process.env.OPENAI_API_KEY);

        const response = await client.responses.create({
            model: "gpt-5-mini",
            input: "hello. How are you doing today? what is springboot?",
        });

        console.log(" OpenAI is working!");
        console.log(response.output_text);
    } catch (error) {
        console.log(" OpenAI is NOT working");
        console.log("Status:", error.status);
        console.log("Message:", error.message);
    }
}

testOpenAI();