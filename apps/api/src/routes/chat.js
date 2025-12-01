const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authRequired } = require('../middleware/authMiddleware');
const ChatConversationModel = require('../models/chatConversationModel');
const ChatMessageModel = require('../models/chatMessageModel');
const UserModel = require('../models/userModel');

// Configure Multer for chat uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../data/chat-uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.use(authRequired);

// Helper to check roles
const isEncargado = (user) => {
    const role = (user.role || "").toUpperCase();
    return ["OWNER", "ADMIN", "MARTILLERO", "RECEPCIONISTA"].includes(role);
};

// GET /api/chat/conversations
router.get('/conversations', (req, res) => {
    const userId = req.user.id;
    const allConvos = ChatConversationModel.findAll();

    // Filter where user is participant
    let myConvos = allConvos.filter(c => c.participants.includes(userId));

    // Optional: Populate participant details (name, role, avatarColor)
    // For MVP, we might just return IDs and let frontend fetch users, 
    // BUT for a chat list it's better to send names to avoid N+1 requests on front.
    const users = UserModel.findAll();

    myConvos = myConvos.map(c => {
        // Find last message
        const messages = ChatMessageModel.findByConversation(c.id);
        const lastMessage = messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        // Enrich participants
        const enrichedParticipants = c.participants.map(pId => {
            const u = users.find(user => user.id === pId);
            return u ? { id: u.id, name: u.name, role: u.role, avatarColor: u.avatarColor } : { id: pId, name: 'Unknown' };
        });

        // Determine display name for Direct chats
        let displayName = c.name;
        if (c.type === 'direct') {
            const other = enrichedParticipants.find(p => p.id !== userId);
            displayName = other ? other.name : 'Chat';
        }

        return {
            ...c,
            displayName,
            participantsDetails: enrichedParticipants,
            lastMessage: lastMessage || null,
            unreadCount: 0 // TODO: Implement unread logic
        };
    });

    // Sort by last message date
    myConvos.sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.createdAt);
        const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.createdAt);
        return dateB - dateA;
    });

    res.json({ ok: true, data: myConvos });
});

// POST /api/chat/conversations
router.post('/conversations', (req, res) => {
    const { type, participantIds, name } = req.body;
    const userId = req.user.id;

    if (!participantIds || !Array.isArray(participantIds)) {
        return res.status(400).json({ ok: false, message: "participantIds es requerido" });
    }

    // Ensure creator is in participants
    const allParticipants = [...new Set([...participantIds, userId])];

    if (type === 'direct') {
        if (allParticipants.length !== 2) {
            return res.status(400).json({ ok: false, message: "Chat directo debe tener exactamente 2 participantes" });
        }

        // Check if exists
        const existing = ChatConversationModel.findAll().find(c =>
            c.type === 'direct' &&
            c.participants.length === 2 &&
            c.participants.every(p => allParticipants.includes(p))
        );

        if (existing) {
            return res.json({ ok: true, data: existing, isNew: false });
        }

        const newConvo = ChatConversationModel.create({
            type: 'direct',
            participants: allParticipants,
            createdBy: userId
        });
        return res.json({ ok: true, data: newConvo, isNew: true });
    }

    if (type === 'group') {
        if (!isEncargado(req.user)) {
            return res.status(403).json({ ok: false, message: "No tienes permiso para crear grupos" });
        }
        if (!name) {
            return res.status(400).json({ ok: false, message: "Nombre del grupo es requerido" });
        }

        const newConvo = ChatConversationModel.create({
            type: 'group',
            name,
            participants: allParticipants,
            createdBy: userId
        });
        return res.json({ ok: true, data: newConvo, isNew: true });
    }

    res.status(400).json({ ok: false, message: "Tipo de chat inválido" });
});

// GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', (req, res) => {
    const convo = ChatConversationModel.findById(req.params.id);
    if (!convo) return res.status(404).json({ ok: false, message: "Conversación no encontrada" });

    if (!convo.participants.includes(req.user.id)) {
        return res.status(403).json({ ok: false, message: "No eres participante de esta conversación" });
    }

    const messages = ChatMessageModel.findByConversation(req.params.id);

    // Sort ASC
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({ ok: true, data: messages });
});

// POST /api/chat/conversations/:id/messages
router.post('/conversations/:id/messages', upload.array('files'), (req, res) => {
    const convo = ChatConversationModel.findById(req.params.id);
    if (!convo) return res.status(404).json({ ok: false, message: "Conversación no encontrada" });

    if (!convo.participants.includes(req.user.id)) {
        return res.status(403).json({ ok: false, message: "No eres participante de esta conversación" });
    }

    const { text } = req.body;
    const files = req.files || [];

    if (!text && files.length === 0) {
        return res.status(400).json({ ok: false, message: "Mensaje vacío" });
    }

    const attachments = files.map(f => ({
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        fileName: f.originalname,
        mimeType: f.mimetype,
        filePath: f.path, // We might want to serve this via a static route or endpoint
        size: f.size
    }));

    const msg = ChatMessageModel.create({
        conversationId: convo.id,
        senderId: req.user.id,
        text: text || '',
        attachments
    });

    // Update conversation updatedAt
    ChatConversationModel.update(convo.id, {});

    res.json({ ok: true, data: msg });
});

// POST /api/chat/broadcast
router.post('/broadcast', upload.array('files'), (req, res) => {
    if (!isEncargado(req.user)) {
        return res.status(403).json({ ok: false, message: "No tienes permiso para enviar mensajes masivos" });
    }

    // recipientIds can come as a JSON string if using FormData, or array if JSON body.
    // Since we use upload.array, body is parsed by multer but non-file fields might be strings.
    let { recipientIds, text } = req.body;
    const files = req.files || [];

    if (typeof recipientIds === 'string') {
        try {
            recipientIds = JSON.parse(recipientIds);
        } catch (e) {
            recipientIds = [recipientIds];
        }
    }

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
        return res.status(400).json({ ok: false, message: "Destinatarios requeridos" });
    }

    if (!text && files.length === 0) {
        return res.status(400).json({ ok: false, message: "Mensaje vacío" });
    }

    const attachments = files.map(f => ({
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        fileName: f.originalname,
        mimeType: f.mimetype,
        filePath: f.path,
        size: f.size
    }));

    const results = [];

    for (const recipientId of recipientIds) {
        // Find or create direct chat
        const allParticipants = [req.user.id, recipientId].sort();

        let convo = ChatConversationModel.findAll().find(c =>
            c.type === 'direct' &&
            c.participants.length === 2 &&
            c.participants.includes(req.user.id) &&
            c.participants.includes(recipientId)
        );

        if (!convo) {
            convo = ChatConversationModel.create({
                type: 'direct',
                participants: [req.user.id, recipientId],
                createdBy: req.user.id
            });
        }

        // Create message
        ChatMessageModel.create({
            conversationId: convo.id,
            senderId: req.user.id,
            text: text || '',
            attachments
        });

        ChatConversationModel.update(convo.id, {});
        results.push(convo.id);
    }

    res.json({ ok: true, message: `Mensaje enviado a ${results.length} usuarios`, conversations: results });
});

// Serve attachment files
router.get('/attachments/:id', (req, res) => {
    // This is a bit tricky because we need to find the file path from the message.
    // For simplicity, we can pass the messageId and attachmentId, OR just serve by filename if we made them unique enough.
    // But our paths are absolute local paths.
    // Let's implement a simple lookup.
    // Ideally we should check permissions here too (if user is in conversation).

    // For MVP/Fast Mode: We will rely on the frontend sending the conversationId to verify access.
    const { conversationId, messageId, attachmentId } = req.query;

    if (!conversationId) return res.status(400).send("Missing conversationId");

    const convo = ChatConversationModel.findById(conversationId);
    if (!convo || !convo.participants.includes(req.user.id)) {
        return res.status(403).send("Access denied");
    }

    // Find message
    // Optimization: We could just look up the file if we had a separate file index, but we don't.
    // So we assume the frontend provides valid IDs.
    // Actually, let's just use the filename if we trust the random suffix.
    // Better: Find the message to get the path.

    // If messageId provided:
    if (messageId) {
        const messages = ChatMessageModel.findByConversation(conversationId);
        const msg = messages.find(m => m.id === messageId);
        if (msg && msg.attachments) {
            const att = msg.attachments.find(a => a.id === attachmentId);
            if (att && fs.existsSync(att.filePath)) {
                return res.download(att.filePath, att.fileName);
            }
        }
    }

    res.status(404).send("File not found");
});

module.exports = router;
