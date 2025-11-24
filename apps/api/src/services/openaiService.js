const OpenAI = require("openai");

// Lazy-load OpenAI client
let openai = null;

function getOpenAIClient() {
    if (!openai) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY not set in environment variables.");
        }
        openai = new OpenAI({ apiKey });
    }
    return openai;
}

const SYSTEM_PROMPT = `
Sos Ivo-t, el asistente virtual inteligente de Inmovia Office.
Tu objetivo es ayudar a agentes inmobiliarios con tareas diarias.

Tono: Profesional pero cercano, eficiente y proactivo.
Idioma: Español (Argentina).

Capacidades actuales (simuladas):
- Responder preguntas sobre procesos inmobiliarios.
- Redactar textos para redes sociales o emails.
- Agendar citas (simulado).

Si te preguntan algo fuera de tu conocimiento, aclaralo amablemente.
Trata de ser conciso.
`;

/**
 * Envía un mensaje a OpenAI y retorna la respuesta.
 * @param {Array} history - Historial de mensajes [{role: 'user'|'assistant', content: '...'}]
 * @param {boolean} [useHighIntelligence=false] - Si es true, usa gpt-5.1. Si es false, usa gpt-5.1-mini.
 */
async function getChatResponse(history, useHighIntelligence = false) {
    try {
        // Intentamos obtener el cliente. Si falla (no key), saltamos al catch.
        const client = getOpenAIClient();

        // Validar historial básico
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
        ];

        // Selección de modelo según reglas de Inmovia
        const model = useHighIntelligence ? "gpt-4o" : "gpt-4o-mini";

        console.log(`[Ivo-t] Usando modelo: ${model}`);

        const completion = await client.chat.completions.create({
            model: model,
            messages: messages,
            temperature: 0.7,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error en openaiService (usando MOCK fallback):", error.message);

        // MOCK FALLBACK para que el usuario pueda probar la UI
        return "🤖 [Modo Offline] No pude conectar con mi cerebro real (OpenAI), pero estoy acá. \n\n" +
            "Posibles causas: Falta la API Key en el .env o se agotó el crédito. \n\n" +
            "Mientras tanto, puedo decirte que el sistema de Inmovia está operativo.";
    }
}

module.exports = {
    getChatResponse,
};
