const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    createEvent: async (event) => {
        return await prisma.event.create({
            data: event,
        });
    },
    // Récupérer par son ID
    getEventById: async (eventId) => {
        return await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                id: true,
                title: true,
                eventDate: true,
                content: true,
                createdAt: true,
            },
        });
    },
    // Récupérer tous
    getEvents: async (page, per_page, whereClause) => {
        // const postCount = await prisma.post.count();
        const filteredCount = await prisma.event.count({
            where: whereClause
        });

        const events = await prisma.event.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                imageUrl: true,
                title: true,
                eventDate: true,
                content: true,
                createdAt: true,
            }
        });

        const totalPages = Math.ceil(filteredCount / per_page);

        return {
            // postCount,
            page,
            per_page,
            totalCount: filteredCount,
            totalPages,
            events: events,
        };
    },
    // Mettre à jour
    updateEvent: async (eventId, eventData) => {
        return await prisma.event.update({
            where: { id: eventId },
            data: eventData,
        });
    },
    // Supprimer
    deleteEvent: async (eventId) => {
        return await prisma.event.delete({
            where: { id: eventId },
        });
    },
};