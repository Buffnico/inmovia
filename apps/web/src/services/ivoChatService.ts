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
    },

    async createAgendaEventFromIvo(eventData: any, inviteesUserIds: string[] = []) {
        const body = {
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            durationMinutes: eventData.durationMinutes ?? 60,
            location: eventData.location ?? "",
            description: eventData.description ?? "",
            invitees: inviteesUserIds,
        };

        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/agenda/ivot/schedule`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error("Error creando evento desde Ivo-t: " + text);
        }

        return res.json();
    }
};

function getHistoryKey(userId: string, context: "panel" | "fab") {
    return `ivot_history_${userId}_${context}`;
}

export function loadIvoHistory(userId: string, context: "panel" | "fab") {
    if (!userId) return [];
    const key = getHistoryKey(userId, context);
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

export function saveIvoHistory(userId: string, context: "panel" | "fab", messages: any[]) {
    if (!userId) return;
    const key = getHistoryKey(userId, context);
    // Limit to last 50 messages
    const trimmed = messages.slice(-50);
    window.localStorage.setItem(key, JSON.stringify(trimmed));
}
