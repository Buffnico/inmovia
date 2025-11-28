const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/agenda.json');

class AgendaModel {
    constructor() {
        this.events = [];
        this.load();
    }

    load() {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            this.events = JSON.parse(data);
        } catch (err) {
            this.events = [];
            console.error("Error loading agenda:", err);
        }
    }

    save() {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.events, null, 2));
        } catch (err) {
            console.error("Error saving agenda:", err);
        }
    }

    getAll() {
        return this.events;
    }

    getById(id) {
        return this.events.find(e => e.id === id);
    }

    create(eventData) {
        const newEvent = {
            id: `e${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            ...eventData
        };
        this.events.push(newEvent);
        this.save();
        return newEvent;
    }

    createMany(eventsData) {
        const newEvents = eventsData.map(e => ({
            id: `e${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            ...e
        }));
        this.events.push(...newEvents);
        this.save();
        return newEvents;
    }

    update(id, updateData) {
        const index = this.events.findIndex(e => e.id === id);
        if (index === -1) return null;

        this.events[index] = { ...this.events[index], ...updateData };
        this.save();
        return this.events[index];
    }

    delete(id) {
        const index = this.events.findIndex(e => e.id === id);
        if (index === -1) return false;

        this.events.splice(index, 1);
        this.save();
        return true;
    }

    // --- Helper Methods for Contacts Integration ---

    findByContactId(contactId) {
        return this.events.filter(e => e.contactId === contactId);
    }

    deleteFutureEventsByContact(contactId, types = []) {
        const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const initialCount = this.events.length;

        this.events = this.events.filter(e => {
            if (e.contactId !== contactId) return true;
            if (types.length > 0 && !types.includes(e.type)) return true;

            // Check if future
            if (e.date >= now) return false; // Delete future events

            return true;
        });

        if (this.events.length !== initialCount) {
            this.save();
        }
    }
}

module.exports = new AgendaModel();
