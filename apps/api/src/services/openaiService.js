// apps/api/src/services/openaiService.js
const OpenAI = require("openai");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Validar que la API key exista (para log claro en Render)
if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
}

// Cliente oficial de OpenAI
const client = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

/**
 * history: array de mensajes tipo:
 *  [{ role: "user" | "assistant" | "system", content: "texto" }]
 * useHighIntelligence: si true usa modelo más potente/caro.
 */
async function getChatResponse(history, useHighIntelligence = false) {
    // Modelo base: económico para uso normal, otro para modo “potente”
    const model = useHighIntelligence ? "gpt-4.1" : "gpt-4o-mini";

    // Podés ajustar este system prompt a tu gusto
    const systemMessage = {
        role: "system",
        content:
            "Sos Ivo-t, asistente IA de Inmovia Office para una oficina inmobiliaria. " +
            "Respondé en español, con tono profesional pero cercano, respuestas claras y concretas. " +
            "Si algo no lo sabés con certeza, explicalo en lugar de inventar.",
    };

    // Aseguramos que history sea array válido
    const messages = Array.isArray(history) ? history : [];
    const allMessages = [systemMessage, ...messages];

    const completion = await client.chat.completions.create({
        model,
        messages: allMessages,
    });

    const content =
        completion.choices?.[0]?.message?.content?.trim() ||
        "No pude generar una respuesta en este momento.";

    return content;
}

module.exports = {
    getChatResponse,
};
