export const ROLES = {
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
    MARTILLERO: 'MARTILLERO',
    AGENT: 'AGENTE',
    RECEPTIONIST: 'RECEPCIONISTA',
    OTHER: 'OTRO'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_PERMISSIONS = {
    [ROLES.OWNER]: {
        canManageOffice: true,
        canManageUsers: true,
        viewAllData: true,
    },
    [ROLES.ADMIN]: {
        canManageOffice: false,
        canManageUsers: true, // View/Edit but maybe not create owner? For now let's say true for users page access
        viewAllData: true,
    },
    [ROLES.MARTILLERO]: {
        canManageOffice: false,
        canManageUsers: false,
        viewAllData: true,
    },
    [ROLES.AGENT]: {
        canManageOffice: false,
        canManageUsers: false,
        viewAllData: false,
    },
    [ROLES.RECEPTIONIST]: {
        canManageOffice: false,
        canManageUsers: false,
        viewAllData: false,
    },
    [ROLES.OTHER]: {
        canManageOffice: false,
        canManageUsers: false,
        viewAllData: false,
    }
};
