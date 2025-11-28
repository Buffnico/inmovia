const AgendaModel = require('../models/agendaModel');

/**
 * Maneja la lógica de recordatorios en la Agenda interna.
 * 
 * @param {Object} oldContact - Estado anterior del contacto.
 * @param {Object} newContact - Nuevo estado del contacto.
 * @returns {Promise<Object>} - Retorna objeto vacío o info útil (ya no dependemos de IDs externos).
 */
async function handleContactReminders(oldContact, newContact) {

    // 1. CUMPLEAÑOS
    // Borrar futuros para regenerar (estrategia simple para mantener consistencia)
    AgendaModel.deleteFutureEventsByContact(newContact.id, ['cumpleanios']);

    if (newContact.recordarCumpleanios && newContact.fechaCumpleanios) {
        const events = [];
        const [year, month, day] = newContact.fechaCumpleanios.split('-').map(Number);

        // Generar próximos 5 años
        const today = new Date();
        const currentYear = today.getFullYear();

        for (let i = 0; i < 5; i++) {
            const targetYear = currentYear + i;
            // Crear fecha en string YYYY-MM-DD
            // Nota: mes es 0-indexed en Date, pero input es 1-indexed.
            // Simple string manipulation is safer for YYYY-MM-DD
            const dateStr = `${targetYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            if (dateStr < today.toISOString().split('T')[0]) continue; // Skip past

            events.push({
                contactId: newContact.id,
                title: `🎂 Cumpleaños de ${newContact.nombre} ${newContact.apellido}`,
                date: dateStr,
                startTime: "09:00", // Default
                endTime: "10:00",
                type: "cumpleanios",
                assignedUserId: newContact.ownerId || newContact.agentId, // Assign to owner
                description: `Recordatorio de cumpleaños. Link: #/contactos/${newContact.id}`
            });
        }
        AgendaModel.createMany(events);
    }

    // 2. MUDANZA
    AgendaModel.deleteFutureEventsByContact(newContact.id, ['mudanza']);

    if (newContact.recordarMudanza && newContact.fechaMudanza) {
        const events = [];
        const [year, month, day] = newContact.fechaMudanza.split('-').map(Number);
        const today = new Date();
        const currentYear = today.getFullYear();

        for (let i = 0; i < 5; i++) {
            const targetYear = currentYear + i;
            const dateStr = `${targetYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            if (dateStr < today.toISOString().split('T')[0]) continue;

            events.push({
                contactId: newContact.id,
                title: `📦 Aniversario mudanza ${newContact.nombre} ${newContact.apellido}`,
                date: dateStr,
                startTime: "09:00",
                endTime: "10:00",
                type: "mudanza",
                assignedUserId: newContact.ownerId || newContact.agentId,
                description: `Aniversario de mudanza. Link: #/contactos/${newContact.id}`
            });
        }
        AgendaModel.createMany(events);
    }

    // 3. FEEDBACK RECURRENTE
    AgendaModel.deleteFutureEventsByContact(newContact.id, ['feedback']);

    if (newContact.feedbackReminder && newContact.feedbackReminder.enabled) {
        const { frequencyDays, occurrences, note, startDate } = newContact.feedbackReminder;
        const start = startDate ? new Date(startDate) : new Date();
        const events = [];

        for (let i = 0; i < occurrences; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + (i * frequencyDays));

            const dateStr = date.toISOString().split('T')[0];

            events.push({
                contactId: newContact.id,
                title: `Feedback - ${newContact.nombre} ${newContact.apellido}`,
                date: dateStr,
                startTime: "10:00",
                endTime: "10:30",
                type: "feedback",
                assignedUserId: newContact.ownerId || newContact.agentId,
                description: `${note || 'Seguimiento programado'}\nLink: #/contactos/${newContact.id}`
            });
        }
        AgendaModel.createMany(events);
    }

    return {}; // No necesitamos devolver IDs ya que no los guardamos en el contacto
}

module.exports = {
    handleContactReminders
};
