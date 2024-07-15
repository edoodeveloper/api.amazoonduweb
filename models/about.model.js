const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    createAbout: async (about) => {
        return await prisma.about.create({
            data: about,
        });
    },
    // Récupérer par son ID
    getAboutById: async (aboutId) => {
        return await prisma.about.findUnique({
            where: { id: aboutId }
        });
    },

    // Récupérer par son name
    getAboutByName: async (aboutName) => {
        return await prisma.about.findUnique({
            where: { name: aboutName }
        });
    },
    // Récupérer tous
    getAbouts: async (page, per_page, whereClause) => {
        // const postCount = await prisma.post.count();
        const filteredCount = await prisma.about.count({
            where: whereClause
        });

        const abouts = await prisma.about.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                title: true,
                url: true,
                content: true,
                createdAt: true,
            }
        });

        const totalAbouts = Math.ceil(filteredCount / per_page);

        return {
            // postCount,
            page,
            per_page,
            totalCount: filteredCount,
            totalAbouts,
            abouts: abouts,
        };
    },
    // Mettre à jour
    updateAboutByName: async (aboutName, aboutData) => {
        return await prisma.about.update({
            where: { name: aboutName },
            data: aboutData,
        });
    },
    // Supprimer
    deleteAbout: async (aboutId) => {
        return await prisma.about.delete({
            where: { id: aboutId },
        });
    },
};