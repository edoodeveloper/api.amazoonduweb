const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    createContact: async (contact) => {
        // Increment countMessage if it's provided, otherwise set it to 1
        /* const contactData = {
            ...contact,
            countMessage: (contact.countMessage || 0) + 1,
        }; */

        return await prisma.contact.create({
            data: contact,
        });
    },

    decrementCountMessage: async (contactId) => {
        // Fetch the contact by ID
        const contact = await prisma.contact.findUnique({
            where: { id: contactId },
        });

        if (!contact) {
            throw new Error('Contact not found');
        }

        // Ensure countMessage is not decremented below 0
        const newCountMessage = Math.max(contact.countMessage - 1, 0);

        // Update the contact with the decremented countMessage
        return await prisma.contact.update({
            where: { id: contactId },
            data: { countMessage: newCountMessage },
        });
    },
    // Récupérer par son ID
    getContactById: async (contactId) => {
        return await prisma.contact.findUnique({
            where: { id: contactId },
            select: {
                id: true,
                countMessage: true,
                phone: true,
                subject: true,
                message: true,
                createdAt: true,
            },
        });
    },
    // Récupérer tous
    getContacts: async (page, per_page, whereClause) => {
        const messageCount = await prisma.contact.count();
        const filteredCount = await prisma.contact.count({
            where: whereClause
        });

        const contacts = await prisma.contact.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                phone: true,
                subject: true,
                message: true,
                createdAt: true,
            }
        });

        const totalPages = Math.ceil(filteredCount / per_page);

        return {
            messageCount,
            page,
            per_page,
            totalCount: filteredCount,
            totalPages,
            contacts: contacts,
        };
    },
    // Mettre à jour
    updateContact: async (contactId, contactData) => {
        return await prisma.contact.update({
            where: { id: contactId },
            data: contactData,
        });
    },
    // Supprimer
    deleteContact: async (contactId) => {
        return await prisma.contact.delete({
            where: { id: contactId },
        });
    },
};