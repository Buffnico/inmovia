const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/notifications.json');

function readNotifications() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function writeNotifications(notifications) {
    // Ensure directory exists
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(notifications, null, 2));
}

const NotificationModel = {
    findAll: () => readNotifications(),
    findByUserId: (userId) => readNotifications().filter(n => n.userId === userId),
    create: (notification) => {
        const notifications = readNotifications();
        notifications.push(notification);
        writeNotifications(notifications);
        return notification;
    },
    markAsRead: (id, userId) => {
        const notifications = readNotifications();
        const index = notifications.findIndex(n => n.id === id && n.userId === userId);
        if (index === -1) return null;

        notifications[index].read = true;
        writeNotifications(notifications);
        return notifications[index];
    },
    markAllAsRead: (userId) => {
        const notifications = readNotifications();
        let count = 0;
        notifications.forEach(n => {
            if (n.userId === userId && !n.read) {
                n.read = true;
                count++;
            }
        });
        if (count > 0) writeNotifications(notifications);
        return count;
    }
};

module.exports = NotificationModel;
