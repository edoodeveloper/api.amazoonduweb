const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    createTestimonial: async (testimonial) => {
        return await prisma.testimonial.create({
            data: testimonial,
        });
    },
    // Récupérer par son ID
    getTestimonialById: async (testimonialId) => {
        return await prisma.testimonial.findUnique({
            where: { id: testimonialId },
            select: {
                id: true,
                imageUrl: true,
                name: true,
                job: true,
                content: true,
                createdAt: true,
            },
        });
    },
    // Récupérer tous
    getTestimonials: async (page, per_page, whereClause) => {
        // const postCount = await prisma.post.count();
        const filteredCount = await prisma.testimonial.count({
            where: whereClause
        });

        const testimonials = await prisma.testimonial.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                imageUrl: true,
                name: true,
                job: true,
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
            testimonials: testimonials,
        };
    },
    // Mettre à jour
    updateTestimonial: async (testimonialId, testimonialData) => {
        return await prisma.testimonial.update({
            where: { id: testimonialId },
            data: testimonialData,
        });
    },
    // Supprimer
    deleteTestimonial: async (testimonialId) => {
        return await prisma.testimonial.delete({
            where: { id: testimonialId },
        });
    },
};