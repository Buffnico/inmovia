export interface InstagramAccount {
    id: string;
    userId?: string;
    type: 'PERSONAL' | 'OFICINA';
    igUsername: string;
    displayName: string;
    accessToken?: string;
    pageId?: string;
    ivoSettings?: {
        suggestMode: boolean;
        autoReplyMode: boolean;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface IgPost {
    id: string;
    accountId: string;
    caption: string;
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
    likeCount: number;
    commentCount: number;
    createdAt: string;
}

export interface IgComment {
    id: string;
    postId: string;
    authorName: string;
    text: string;
    createdAt: string;
}

export interface IgThread {
    id: string;
    updatedAt: string;
    unreadCount: number;
    lastMessagePreview: string;
    participants: {
        id: string;
        name: string;
        username?: string;
        profilePic?: string;
    }[];
}

export interface IgMessage {
    id: string;
    threadId: string;
    text: string;
    fromSelf: boolean;
    createdAt: string;
}

// --- Accounts ---

export const getMyInstagramAccounts = async (): Promise<InstagramAccount[]> => {
    console.log("instagramService: getMyInstagramAccounts called");
    // Pure Mock - No API calls to avoid white screen
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 'mock_personal',
                    type: 'PERSONAL',
                    igUsername: 'agente.inmovia',
                    displayName: 'Juan Agente',
                    ivoSettings: { suggestMode: true, autoReplyMode: false }
                },
                {
                    id: 'mock_office',
                    type: 'OFICINA',
                    igUsername: 'inmovia.realestate',
                    displayName: 'Inmovia Oficial',
                    ivoSettings: { suggestMode: true, autoReplyMode: true }
                }
            ]);
        }, 500); // Simulate network delay
    });
};

export const createInstagramAccount = async (data: Partial<InstagramAccount>) => {
    console.log("instagramService: createInstagramAccount called", data);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ ok: true, data: { ...data, id: 'mock_' + Date.now() } });
        }, 500);
    });
};

export const updateIvoSettings = async (accountId: string, settings: any) => {
    console.log("instagramService: updateIvoSettings called", accountId, settings);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ ok: true });
        }, 300);
    });
};

// --- Mock Data Functions (Frontend Only) ---

export const getFeedPosts = async (accountId: string): Promise<IgPost[]> => {
    return [
        {
            id: 'p1', accountId, caption: 'Hermosa casa en venta en Barrio Norte! 🏡 #inmobiliaria #venta',
            mediaUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
            mediaType: 'IMAGE', likeCount: 124, commentCount: 5, createdAt: new Date().toISOString()
        },
        {
            id: 'p2', accountId, caption: 'Nuevo ingreso: Departamento 2 ambientes luminoso ☀️',
            mediaUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
            mediaType: 'CAROUSEL', likeCount: 89, commentCount: 2, createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'p3', accountId, caption: 'Oportunidad de inversión en pozo 🏗️ Consultanos!',
            mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
            mediaType: 'IMAGE', likeCount: 45, commentCount: 0, createdAt: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: 'p4', accountId, caption: 'Recorrido virtual de nuestra oficina 🏢',
            mediaUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
            mediaType: 'VIDEO', likeCount: 230, commentCount: 12, createdAt: new Date(Date.now() - 250000000).toISOString()
        }
    ];
};

export const getPostComments = async (accountId: string, postId: string): Promise<IgComment[]> => {
    return [
        { id: 'c1', postId, authorName: 'maria.gomez', text: '¿Cuál es el precio? 😍', createdAt: new Date().toISOString() },
        { id: 'c2', postId, authorName: 'juan.perez', text: 'Me interesa visitar', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'c3', postId, authorName: 'Yo', text: 'Te enviamos info por MD! 📩', createdAt: new Date().toISOString() }
    ];
};

export const sendCommentReply = async (accountId: string, postId: string, commentId: string, text: string): Promise<IgComment> => {
    return {
        id: 'c_new_' + Date.now(),
        postId,
        authorName: 'Yo',
        text,
        createdAt: new Date().toISOString()
    };
};

export const getInboxThreads = async (accountId: string): Promise<IgThread[]> => {
    return [
        {
            id: 't1', updatedAt: new Date().toISOString(), unreadCount: 1, lastMessagePreview: '¿Sigue disponible?',
            participants: [{ id: 'u1', name: 'Laura Martínez', username: 'laura.m', profilePic: 'https://randomuser.me/api/portraits/women/44.jpg' }]
        },
        {
            id: 't2', updatedAt: new Date(Date.now() - 3600000).toISOString(), unreadCount: 0, lastMessagePreview: 'Gracias por la info!',
            participants: [{ id: 'u2', name: 'Carlos Ruiz', username: 'carlos.ruiz', profilePic: 'https://randomuser.me/api/portraits/men/32.jpg' }]
        },
        {
            id: 't3', updatedAt: new Date(Date.now() - 86400000).toISOString(), unreadCount: 0, lastMessagePreview: 'Agendado para el martes.',
            participants: [{ id: 'u3', name: 'Ana Soler', username: 'ana.soler', profilePic: 'https://randomuser.me/api/portraits/women/68.jpg' }]
        }
    ];
};

export const getThreadMessages = async (accountId: string, threadId: string): Promise<IgMessage[]> => {
    return [
        { id: 'm1', threadId, text: 'Hola, vi la casa de Palermo.', fromSelf: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: 'm2', threadId, text: '¿Sigue disponible para visitar?', fromSelf: false, createdAt: new Date(Date.now() - 7100000).toISOString() },
        { id: 'm3', threadId, text: 'Hola! Sí, tenemos disponibilidad mañana.', fromSelf: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 'm4', threadId, text: 'Perfecto, ¿a qué hora?', fromSelf: false, createdAt: new Date(Date.now() - 3500000).toISOString() }
    ];
};

export const sendDmMessage = async (accountId: string, threadId: string, text: string): Promise<IgMessage> => {
    return {
        id: 'm_new_' + Date.now(),
        threadId,
        text,
        fromSelf: true,
        createdAt: new Date().toISOString()
    };
};

export interface IgProperty {
    id: string;
    title: string;
    price: string;
    location: string;
    imageUrl: string;
    features: string;
}

export const getMockProperties = (): IgProperty[] => {
    return [
        {
            id: '1',
            title: 'Casa en Palermo',
            price: 'USD 250.000',
            location: 'Palermo Soho',
            imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
            features: '120m² • 4 Ambientes'
        },
        {
            id: '2',
            title: 'Depto Recoleta',
            price: 'USD 180.000',
            location: 'Recoleta',
            imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
            features: '75m² • 3 Ambientes'
        },
        {
            id: '3',
            title: 'Oficina Centro',
            price: 'USD 120.000',
            location: 'Microcentro',
            imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
            features: '50m² • 2 Baños'
        },
        {
            id: '4',
            title: 'PH Moderno',
            price: 'USD 145.000',
            location: 'Villa Crespo',
            imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
            features: '90m² • Terraza Propia'
        },
    ];
};

export const getDemoPropertiesMock = () => {
    // Deprecated, use getMockProperties
    return getMockProperties();
};
