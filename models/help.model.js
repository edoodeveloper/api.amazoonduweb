const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    createHelp: async (help) => {
        return await prisma.help.create({
            data: help,
        });
    },
    // Récupérer par son ID
    getHelpById: async (helpId) => {
        return await prisma.help.findUnique({
            where: { id: helpId },
            select: {
                id: true,
                imageUrl: true,
                videoUrl: true,
                title: true,
                content: true,
                createdAt: true,
            },
        });
    },
    // Récupérer tous
    getHelps: async (page, per_page, whereClause) => {
        // const postCount = await prisma.post.count();
        const filteredCount = await prisma.help.count({
            where: whereClause
        });

        const helps = await prisma.help.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                id: true,
                imageUrl: true,
                videoUrl: true,
                title: true,
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
            helps: helps,
        };
    },
    // Mettre à jour
    updateHelp: async (helpId, helpData) => {
        return await prisma.help.update({
            where: { id: helpId },
            data: helpData,
        });
    },
    // Supprimer
    deleteHelp: async (helpId) => {
        return await prisma.help.delete({
            where: { id: helpId },
        });
    },
};