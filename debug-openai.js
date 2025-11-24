require('dotenv').config({ path: 'apps/api/.env' });
const OpenAI = require("openai");

const apiKey = process.env.OPENAI_API_KEY;

console.log("--- Debugging OpenAI Key ---");
if (!apiKey) {
    console.error("❌ Error: OPENAI_API_KEY is missing in process.env");
    process.exit(1);
}

console.log(`✅ Key found. Length: ${apiKey.length}`);
console.log(`Key start: ${apiKey.substring(0, 10)}...`);
console.log(`Key end: ...${apiKey.substring(apiKey.length - 5)}`);

const openai = new OpenAI({ apiKey });

async function test() {
    try {
        console.log("Attempting request with model: gpt-3.5-turbo...");
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Hello" }],
        });
        console.log("✅ Success! Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("❌ Request failed:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

test();
