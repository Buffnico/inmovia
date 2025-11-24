const googleCalendar = require('../googleCalendar');

/**
 * Maneja la lógica de recordatorios de feedback periódico para propiedades.
 * 
 * @param {Object} oldProp - Estado anterior de la propiedad.
 * @param {Object} newProp - Nuevo estado de la propiedad.
 * @returns {Promise<Object>} - Retorna objeto con { feedbackCalendarEventId }
 */
async function handlePropertyFeedback(oldProp, newProp) {
    const resultIds = {
        feedbackCalendarEventId: newProp.feedbackCalendarEventId || null
    };

    try {
        // Condiciones para activar recordatorio:
        // 1. Flag recordarFeedback es true
        // 2. Propiedad está activa (o en venta)
        // 3. Tiene un contacto asociado (cliente)
        // 4. Tiene frecuencia definida
        const isActive = newProp.estado === "Activa" || newProp.estado === "En Venta"; // Ajustar según valores reales
        const shouldRemind = newProp.recordarFeedback && isActive && newProp.cliente && newProp.frecuenciaFeedbackDias;

        if (shouldRemind) {
            // Calculamos fecha de inicio (mañana a las 10 AM por defecto)
            const now = new Date();
            now.setDate(now.getDate() + 1); // Empezar mañana
            const startDateTime = `${now.toISOString().split('T')[0]}T10:00:00`;
            const endDateTime = `${now.toISOString().split('T')[0]}T10:15:00`;

            const freq = newProp.frecuenciaFeedbackDias || 7;

            const eventData = {
                summary: `🔁 Feedback a cliente ${newProp.cliente.nombre || 'Propietario'}`,
                description: `Recordatorio de feedback periódico (${freq} días).\nPropiedad: ${newProp.titulo}\nDirección: ${newProp.direccion}\nLink: #/propiedades/${newProp.id}`,
                start: {
                    dateTime: startDateTime,
                    timeZone: 'America/Argentina/Buenos_Aires'
                },
                end: {
                    dateTime: endDateTime,
                    timeZone: 'America/Argentina/Buenos_Aires'
                },
                recurrence: [`RRULE:FREQ=DAILY;INTERVAL=${freq}`],
                extendedProperties: {
                    private: {
                        type: 'FEEDBACK',
                        propertyId: newProp.id
                    }
                }
            };

            if (resultIds.feedbackCalendarEventId) {
                // Actualizar si cambiaron parámetros clave
                if (oldProp.frecuenciaFeedbackDias !== newProp.frecuenciaFeedbackDias ||
                    oldProp.cliente?.nombre !== newProp.cliente?.nombre ||
                    oldProp.titulo !== newProp.titulo) {
                    console.log(`[PropService] Actualizando feedback ${resultIds.feedbackCalendarEventId}`);
                    // Nota: Al cambiar recurrencia, a veces es mejor borrar y crear, pero update suele funcionar.
                    // Sin embargo, cambiar start/end de una serie recurrente puede ser tricky.
                    // Para simplificar MVP: updateamos el evento base.
                    await googleCalendar.updateEvent(resultIds.feedbackCalendarEventId, eventData);
                }
            } else {
                console.log(`[PropService] Creando feedback para ${newProp.titulo}`);
                const created = await googleCalendar.createEvent(eventData);
                resultIds.feedbackCalendarEventId = created.id;
            }

        } else {
            // Desactivar si ya existía
            if (resultIds.feedbackCalendarEventId) {
                console.log(`[PropService] Borrando feedback ${resultIds.feedbackCalendarEventId}`);
                await googleCalendar.deleteEvent(resultIds.feedbackCalendarEventId).catch(err => console.warn("Error borrando evento:", err.message));
                resultIds.feedbackCalendarEventId = null;
            }
        }

    } catch (error) {
        console.error("Error gestionando recordatorio de feedback:", error.message);
    }

    return resultIds;
}

module.exports = {
    handlePropertyFeedback
};
