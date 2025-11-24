const { getChatResponse } = require("../services/openaiService");

/**
 * POST /api/chat
 * Body: { messages: [] }
 */
async function handleChat(req, res) {
    try {
        const { messages, useHighIntelligence } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Formato de mensajes inválido." });
        }

        // Llamar al servicio de OpenAI
        // useHighIntelligence viene del front (booleano)
        const reply = await getChatResponse(messages, useHighIntelligence);

        return res.json({
            role: "assistant",
            content: reply,
        });
    } catch (error) {
        console.error("Error en chatController:", error);
        return res.status(500).json({ error: "Hubo un problema procesando tu solicitud." });
    }
}

module.exports = {
    handleChat,
};
