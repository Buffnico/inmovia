const NotificationModel = require('../models/notificationModel');
const ContactModel = require('../models/contactModel');

function checkContactRemindersForDate(date) {
    // Date format: YYYY-MM-DD
    const contacts = ContactModel.findAll();
    let notificationsCreated = 0;

    // Extract MM-DD for birthday comparison (ignore year)
    const [year, month, day] = date.split('-');
    const monthDay = `${month}-${day}`;

    contacts.forEach(contact => {
        // 1. Birthday Reminder
        if (contact.recordarCumpleaños && contact.fechaCumpleaños) {
            const [cYear, cMonth, cDay] = contact.fechaCumpleaños.split('-');
            if (`${cMonth}-${cDay}` === monthDay) {
                NotificationModel.create({
                    id: `notif_bday_${contact.id}_${Date.now()}`,
                    userId: contact.ownerId,
                    type: 'contacto',
                    title: '🎂 Recordatorio de Cumpleaños',
                    message: `Hoy es el cumpleaños de ${contact.nombre} ${contact.apellido || ''}`,
                    createdAt: new Date().toISOString(),
                    read: false,
                    metadata: { contactId: contact.id, type: 'birthday' }
                });
                notificationsCreated++;
            }
        }

        // 2. Moving Date Reminder (Exact match including year? Or anniversary? Usually exact date for moving)
        // Let's assume exact date for "Fecha de mudanza" as a task/event.
        if (contact.recordarMudanza && contact.fechaMudanza) {
            if (contact.fechaMudanza === date) {
                NotificationModel.create({
                    id: `notif_move_${contact.id}_${Date.now()}`,
                    userId: contact.ownerId,
                    type: 'contacto',
                    title: '🚛 Recordatorio de Mudanza',
                    message: `Hoy es la mudanza de ${contact.nombre} ${contact.apellido || ''}`,
                    createdAt: new Date().toISOString(),
                    read: false,
                    metadata: { contactId: contact.id, type: 'moving' }
                });
                notificationsCreated++;
            }
        }
    });

    return notificationsCreated;
}

module.exports = { checkContactRemindersForDate };
