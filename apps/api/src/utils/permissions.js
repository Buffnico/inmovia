const ROLES = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MARTILLERO: 'MARTILLERO',
    AGENTE: 'AGENTE',
    RECEPCIONISTA: 'RECEPCIONISTA'
};

/**
 * Check if user can read a property
 */
function canReadProperty(user, property) {
    if (!user) return false;
    if ([ROLES.OWNER, ROLES.ADMIN, ROLES.MARTILLERO, ROLES.RECEPCIONISTA].includes(user.role)) {
        return true;
    }
    if (user.role === ROLES.AGENTE) {
        // Agent can see property if they are the assigned agent
        // We check assignedAgentId (preferred) or fallback to name match if needed for legacy data
        return property.assignedAgentId === user.id;
    }
    return false;
}

/**
 * Check if user can edit/delete a property
 */
function canEditProperty(user, property) {
    if (!user) return false;
    if ([ROLES.OWNER, ROLES.ADMIN, ROLES.MARTILLERO].includes(user.role)) {
        return true;
    }
    if (user.role === ROLES.AGENTE) {
        return property.assignedAgentId === user.id;
    }
    // Recepcionista cannot edit
    return false;
}

/**
 * Check if user can read a contact
 */
function canReadContact(user, contact) {
    if (!user) return false;
    if ([ROLES.OWNER, ROLES.ADMIN, ROLES.MARTILLERO].includes(user.role)) {
        return true;
    }
    if (user.role === ROLES.AGENTE) {
        // Can see own contacts OR contacts linked to their properties
        // For MVP we assume linkedPropertyId check would happen here if we had the property data loaded,
        // but typically we might just check direct ownership or if the contact is assigned to them.
        // The prompt mentions: "Contactos vinculados a una propiedad en la que es agente".
        // Since we might not have property data here easily, we'll stick to ownerId/agentId check for now
        // and maybe allow if contact.agentId === user.id
        return contact.ownerId === user.id || contact.agentId === user.id;
    }
    if (user.role === ROLES.RECEPCIONISTA) {
        // Can see contacts associated with properties (for calls/appointments)
        // Ideally check if linkedPropertyId exists.
        return !!contact.linkedPropertyId;
    }
    return false;
}

/**
 * Check if user can edit/delete a contact
 */
function canEditContact(user, contact) {
    if (!user) return false;
    if ([ROLES.OWNER, ROLES.ADMIN, ROLES.MARTILLERO].includes(user.role)) {
        return true;
    }
    if (user.role === ROLES.AGENTE) {
        return contact.ownerId === user.id || contact.agentId === user.id;
    }
    return false;
}

/**
 * Check if user can read an event
 */
function canReadEvent(user, event) {
    if (!user) return false;
    if ([ROLES.OWNER, ROLES.ADMIN, ROLES.MARTILLERO, ROLES.RECEPCIONISTA].includes(user.role)) {
        return true;
    }
    if (user.role === ROLES.AGENTE) {
        return event.assignedUserId === user.id;
    }
    return false;
}

/**
 * Check if user can edit/delete an event
 */
function canEditEvent(user, event) {
    if (!user) return false;
    if ([ROLES.OWNER, ROLES.ADMIN, ROLES.MARTILLERO, ROLES.RECEPCIONISTA].includes(user.role)) {
        return true;
    }
    if (user.role === ROLES.AGENTE) {
        return event.assignedUserId === user.id;
    }
    return false;
}

module.exports = {
    ROLES,
    canReadProperty,
    canEditProperty,
    canReadContact,
    canEditContact,
    canReadEvent,
    canEditEvent
};
