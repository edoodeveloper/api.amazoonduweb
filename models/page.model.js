const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    createPage: async (page) => {
        return await prisma.page.create({
            data: page,
        });
    },
    // Récupérer par son ID
    getPageById: async (pageId) => {
        return await prisma.page.findUnique({
            where: { id: pageId },
            select: {
                id: true,
                name: true,
                title: true,
                url: true,
                createdAt: true,
            },
        });
    },

    // Récupérer par son name
    getPageByName: async (pageName) => {
        return await prisma.page.findUnique({
            where: { name: pageName }
        });
    },
    // Récupérer tous
    getPages: async (page, per_page, whereClause) => {
        // const postCount = await prisma.post.count();
        const filteredCount = await prisma.page.count({
            where: whereClause
        });

        const pages = await prisma.page.findMany({
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
            pages: pages,
        };
    },
    // Mettre à jour
    updatePageByName: async (pageName, pageData) => {
        return await prisma.page.update({
            where: { name: pageName },
            data: pageData,
        });
    },

    // Mettre à jour
    updatePageById: async (pageId, pageData) => {
        return await prisma.page.update({
            where: { id: pageId },
            data: pageData,
        });
    },
    // Supprimer
    deletePage: async (pageId) => {
        return await prisma.page.delete({
            where: { id: pageId },
        });
    },
};