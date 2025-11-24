// apps/api/src/services/openaiService.js
const OpenAI = require("openai");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 👉 En vez de tirar error y romper la API, devolvemos un mensaje claro
if (!OPENAI_API_KEY) {
    console.warn("[openaiService] OPENAI_API_KEY no está definida en el entorno.");
}

let client = null;
if (OPENAI_API_KEY) {
    client = new OpenAI({ apiKey: OPENAI_API_KEY });
}

/**
 * history: array de mensajes tipo:
 *  [{ role: "user" | "assistant" | "system", content: "texto" }]
 */
async function getChatResponse(history, useHighIntelligence = false) {
    // Si falta la key, no rompemos la API, respondemos algo controlado
    if (!OPENAI_API_KEY || !client) {
        console.warn("[openaiService] getChatResponse llamado sin OPENAI_API_KEY");
        return "La configuración de Ivo-t no está completa en este entorno (falta OPENAI_API_KEY). Avisale al administrador.";
    }

    try {
        const model = useHighIntelligence ? "gpt-4o" : "gpt-4o-mini";

        const systemMessage = {
            role: "system",
            content:
                "Sos Ivo-t, asistente IA de Inmovia Office para una oficina inmobiliaria. " +
                "Respondé exclusivamente a preguntas relacionadas con la oficina inmobiliaria: propiedades, clientes, agenda, documentos, procesos internos, etc. " +
                "Si la consulta es sobre otro tema, responde: \"Lo siento, solo puedo ayudar con temas de la oficina inmobiliaria.\". " +
                "Mantén el tono profesional pero cercano, y si no sabés la respuesta, explícala en lugar de inventar."
        };

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
    } catch (err) {
        console.error("[openaiService] Error al llamar a OpenAI:", err);
        return "Tuve un problema al conectar con el motor de IA. Probá nuevamente en unos instantes o avisale al administrador.";
    }
}

module.exports = {
    getChatResponse,
};
