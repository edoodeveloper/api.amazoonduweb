const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    getAllTags: async (page, per_page, whereClause) => {
        const filteredCount = await prisma.tag.count({
            where: whereClause
        });

        const tags = await prisma.tag.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                slug: true
            }
        });

        const totalPages = Math.ceil(filteredCount / per_page);

        return {
            page,
            per_page,
            totalCount: filteredCount,
            totalPages,
            tags: tags,
        };
    },

    getTagById: async (id) => {
        return await prisma.tag.findUnique({
            where: { id },
            select: {
                id: true,
                name: true
            }
        });
    },

    getTagBySlug: async (slug) => {
        return await prisma.tag.findUnique({
            where: { slug },
        });
    },

    createTag: async (name, slug) => {
        return await prisma.tag.create({
            data: { name, slug },
        });
    },

    getByName: async (name) => {
        try {
            const anyName = await prisma.tag.findFirst({
                where: {
                    name
                }
            });

            if (!anyName) {
                // Gérer le cas où aucun tag n'est trouvée avec ce nom
                return { success: false, message: "Tag introuvable" };
            }

            // Si un tag est trouvée, renvoyer les détails du tag
            return { success: true, tag: anyName };
        } catch (error) {
            return { success: false, message: "Erreur lors de la recherche" };
        }
    },

    updateTagById: async (id, fieldsToUpdate) => {
        return await prisma.tag.update({
            where: { id },
            data: fieldsToUpdate,
        });
    },

    deleteTagById: async (id) => {
        return await prisma.tag.delete({
            where: { id },
        });
    },
};