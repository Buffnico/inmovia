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

        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const today = `${yyyy}-${mm}-${dd}`;

        const systemMessage = {
            role: "system",
            content:
                `Sos Ivo-t, asistente IA de Inmovia Office. Tu foco principal son temas inmobiliarios, de la oficina y del sistema Inmovia (documentos, propiedades, agenda, etc.), pero también podés ayudar con otras consultas generales siempre que sean seguras y respetuosas. Respondé con claridad y profesionalismo.
                
                Hoy es ${today} (zona horaria Buenos Aires, UTC-3). 
                Siempre que el usuario hable de "hoy", "mañana", "el viernes", etc., 
                calcula la fecha real usando esta referencia y usa SIEMPRE el año ${yyyy}, 
                salvo que el usuario diga explícitamente otro año.

                También podés ayudar al usuario a agendar eventos en su agenda de Inmovia.
                Si el usuario dice cosas como “agendame…”, “crear evento…”, “poné en la agenda…”, primero hacé preguntas para aclarar:
                - Título del evento
                - Fecha (día, mes, año)
                - Hora
                - Duración aproximada
                - Lugar
                - Si quiere invitar a alguien de la oficina

                Cuando tengas todos los datos y el usuario confirme, respondé normalmente y, al final de tu mensaje, agregá un bloque especial con este formato EXACTO:
                <event> {"type":"schedule_event","title":"...","date":"YYYY-MM-DD","time":"HH:MM","durationMinutes":60,"location":"...","description":"...","invitees":[]} </event>
                
                "invitees" debe ser una lista de nombres o mails que el usuario mencionó (ej.: ["Juan Pérez", "maria@ejemplo.com"]).
                No uses backticks ni Markdown dentro de ese bloque.
                Siempre que armes el <event>...</event>, asumí horario de Argentina (UTC-3) salvo que el usuario diga otra cosa.
                `
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
