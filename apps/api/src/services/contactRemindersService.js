const googleCalendar = require('../googleCalendar');

/**
 * Maneja la lógica de recordatorios de cumpleaños y mudanza en Google Calendar.
 * 
 * @param {Object} oldContact - Estado anterior del contacto (para detectar cambios).
 * @param {Object} newContact - Nuevo estado del contacto.
 * @returns {Promise<Object>} - Retorna un objeto con los IDs de eventos actualizados { cumpleCalendarEventId, mudanzaCalendarEventId }
 */
async function handleContactReminders(oldContact, newContact) {
    const resultIds = {
        cumpleCalendarEventId: newContact.cumpleCalendarEventId || null,
        mudanzaCalendarEventId: newContact.mudanzaCalendarEventId || null
    };

    // --- CUMPLEAÑOS ---
    try {
        if (newContact.recordarCumpleanios && newContact.fechaCumpleanios) {
            // Caso: Activar o Actualizar
            const eventData = {
                summary: `🎂 Cumpleaños de ${newContact.nombre} ${newContact.apellido}`,
                description: `Recordatorio de cumpleaños.\nContacto: ${newContact.nombre} ${newContact.apellido}\nLink: #/contactos/${newContact.id}`,
                start: {
                    date: newContact.fechaCumpleanios, // YYYY-MM-DD
                    timeZone: 'America/Argentina/Buenos_Aires'
                },
                end: {
                    date: newContact.fechaCumpleanios, // Google Calendar all-day events are inclusive start, exclusive end? Usually for single day start=end is fine or end=start+1
                    // Para eventos de todo el día, Google recomienda start.date y end.date. 
                    // Si es un solo día, end debería ser el día siguiente.
                    // Pero para recurrencia anual, mejor definimos RRULE.
                },
                recurrence: ['RRULE:FREQ=YEARLY'],
                extendedProperties: {
                    private: {
                        type: 'CUMPLE',
                        contactId: newContact.id
                    }
                }
            };

            // Ajuste de fecha de fin para evento de todo el día (start + 1 día)
            const startDate = new Date(newContact.fechaCumpleanios);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            eventData.end.date = endDate.toISOString().split('T')[0];


            if (resultIds.cumpleCalendarEventId) {
                // Ya existía, actualizamos
                // Solo si cambió la fecha o el nombre
                if (oldContact.fechaCumpleanios !== newContact.fechaCumpleanios ||
                    oldContact.nombre !== newContact.nombre ||
                    oldContact.apellido !== newContact.apellido) {
                    console.log(`[ContactService] Actualizando evento cumple ${resultIds.cumpleCalendarEventId}`);
                    await googleCalendar.updateEvent(resultIds.cumpleCalendarEventId, eventData);
                }
            } else {
                // No existía, creamos
                console.log(`[ContactService] Creando evento cumple para ${newContact.nombre}`);
                const created = await googleCalendar.createEvent(eventData);
                resultIds.cumpleCalendarEventId = created.id;
            }

        } else {
            // Caso: Desactivar (o falta fecha)
            if (resultIds.cumpleCalendarEventId) {
                console.log(`[ContactService] Borrando evento cumple ${resultIds.cumpleCalendarEventId}`);
                await googleCalendar.deleteEvent(resultIds.cumpleCalendarEventId).catch(err => console.warn("Error borrando evento (puede que ya no exista):", err.message));
                resultIds.cumpleCalendarEventId = null;
            }
        }
    } catch (error) {
        console.error("Error gestionando recordatorio de cumpleaños:", error.message);
        // No fallamos la request completa, solo logueamos
    }

    // --- MUDANZA ---
    try {
        if (newContact.recordarMudanza && newContact.fechaMudanza) {
            const eventData = {
                summary: `📦 Aniversario mudanza de ${newContact.nombre} ${newContact.apellido}`,
                description: `Recordatorio de aniversario de mudanza.\nContacto: ${newContact.nombre} ${newContact.apellido}\nLink: #/contactos/${newContact.id}`,
                start: {
                    date: newContact.fechaMudanza,
                    timeZone: 'America/Argentina/Buenos_Aires'
                },
                end: {}, // Se llena abajo
                recurrence: ['RRULE:FREQ=YEARLY'],
                extendedProperties: {
                    private: {
                        type: 'MUDANZA',
                        contactId: newContact.id
                    }
                }
            };

            const startDate = new Date(newContact.fechaMudanza);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            eventData.end.date = endDate.toISOString().split('T')[0];

            if (resultIds.mudanzaCalendarEventId) {
                if (oldContact.fechaMudanza !== newContact.fechaMudanza ||
                    oldContact.nombre !== newContact.nombre) {
                    console.log(`[ContactService] Actualizando evento mudanza ${resultIds.mudanzaCalendarEventId}`);
                    await googleCalendar.updateEvent(resultIds.mudanzaCalendarEventId, eventData);
                }
            } else {
                console.log(`[ContactService] Creando evento mudanza para ${newContact.nombre}`);
                const created = await googleCalendar.createEvent(eventData);
                resultIds.mudanzaCalendarEventId = created.id;
            }

        } else {
            if (resultIds.mudanzaCalendarEventId) {
                console.log(`[ContactService] Borrando evento mudanza ${resultIds.mudanzaCalendarEventId}`);
                await googleCalendar.deleteEvent(resultIds.mudanzaCalendarEventId).catch(err => console.warn("Error borrando evento:", err.message));
                resultIds.mudanzaCalendarEventId = null;
            }
        }
    } catch (error) {
        console.error("Error gestionando recordatorio de mudanza:", error.message);
    }

    return resultIds;
}

module.exports = {
    handleContactReminders
};
