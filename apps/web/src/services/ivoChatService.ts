// apps/web/src/services/ivoChatService.ts

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3001/api";
const API_URL = `${API_BASE_URL}/ivot/chat`;

export type ChatMessage = {
    role: "user" | "assistant" | "system";
    content: string;
};

export const IvoChatService = {
    async sendMessage(history: ChatMessage[]) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error ${response.status}: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            return data.message;
        } catch (error) {
            console.error("Error al comunicarse con Ivo-t:", error);
            throw error;
        }
    }
};
