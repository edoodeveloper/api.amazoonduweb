const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    // Créer un post
    createPost: async (postData) => {
        return await prisma.post.create({
            data: postData,
        });
    },
    // Récupérer un post par son ID
    getPostById: async (postId) => {
        return await prisma.post.findUnique({
            where: { id: postId },
            include: {
                user: true,
                category: true,
                tags: true,
                blogComments: true,
                postLikes: true,
            },
        });
    },
    getPostBySlug: async (slug) => {
        return await prisma.post.findUnique({
            where: { slug },
        });
    },
    // Récupérer tous les posts
    getAllPosts: async (page, per_page, whereClause) => {
        // const postCount = await prisma.post.count();
        const filteredCount = await prisma.post.count({
            where: whereClause
        });

        const posts = await prisma.post.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                user: { select: { firstName: true } },
                imageUrl: true,
                category: { select: { id: true, name: true } },
                tags: { select: { id: true, name: true } },
                title: true,
                content: true,
                countViews: true,
                countLikes: true,
                countDislikes: true,
                countShares: true,
                countComments: true,
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
            posts: posts,
        };
    },
    // Mettre à jour un post
    updatePost: async (postId, postData) => {
        return await prisma.post.update({
            where: { id: postId },
            data: postData,
        });
    },
    // Supprimer un post
    deletePost: async (postId) => {
        return await prisma.post.delete({
            where: { id: postId },
        });
    },
    // Incrémenter le compteur de vues d'un post
    incrementPostViews: async (postId) => {
        return await prisma.post.update({
            where: { id: postId },
            data: {
                countViews: {
                    increment: 1,
                },
            },
        });
    },
    // Incrémenter le compteur de likes d'un post
    incrementPostLikes: async (postId) => {
        return await prisma.post.update({
            where: { id: postId },
            data: { countLikes: { increment: 1 } },
        });
    },
    // Incrémenter le compteur de dislikes d'un post
    incrementPostDislikes: async (postId) => {
        return await prisma.post.update({
            where: { id: postId },
            data: { countDislikes: { increment: 1 } },
        });
    },
    // Incrémenter le compteur de partages d'un post
    incrementPostShares: async (postId) => {
        return await prisma.post.update({
            where: { id: postId },
            data: { countShares: { increment: 1 } },
        });
    },
    // Incrémenter le compteur de commentaires d'un post
    incrementPostComments: async (postId) => {
        await prisma.post.update({
            where: { id: postId },
            data: { countComments: { increment: 1 } },
        });
    },

    likeOrDislikePost: async (userId, postId, type) => {
        // Type can be 'like' or 'dislike'
        const like = await prisma.postLike.findUnique({
            where: {
                userId_postId: {
                    userId: userId,
                    postId: postId,
                },
            },
        });

        if (like) {
            if (like.type === type) {
                // If user already liked/disliked the post with the same type, remove the like/dislike
                await prisma.postLike.delete({
                    where: {
                        userId_postId: {
                            userId: userId,
                            postId: postId,
                        },
                    },
                });
                // Update the post counters
                if (type === 'like') {
                    await prisma.post.update({
                        where: { id: postId },
                        data: { countLikes: { decrement: 1 } },
                    });
                } else {
                    await prisma.post.update({
                        where: { id: postId },
                        data: { countDislikes: { decrement: 1 } },
                    });
                }
            } else {
                // If user liked/disliked with a different type, update the like/dislike
                await prisma.postLike.update({
                    where: {
                        userId_postId: {
                            userId: userId,
                            postId: postId,
                        },
                    },
                    data: {
                        type: type,
                    },
                });
                // Update the post counters
                if (type === 'like') {
                    await prisma.post.update({
                        where: { id: postId },
                        data: {
                            countLikes: { increment: 1 },
                            countDislikes: { decrement: 1 },
                        },
                    });
                } else {
                    await prisma.post.update({
                        where: { id: postId },
                        data: {
                            countLikes: { decrement: 1 },
                            countDislikes: { increment: 1 },
                        },
                    });
                }
            }
        } else {
            // If there's no existing like/dislike, create a new one
            await prisma.postLike.create({
                data: {
                    postId: postId,
                    userId: userId,
                    type: type,
                },
            });
            // Update the post counters
            if (type === 'like') {
                await prisma.post.update({
                    where: { id: postId },
                    data: { countLikes: { increment: 1 } },
                });
            } else {
                await prisma.post.update({
                    where: { id: postId },
                    data: { countDislikes: { increment: 1 } },
                });
            }
        }

        // Retrieve updated counts
        const updatedPost = await prisma.post.findUnique({
            where: { id: postId },
            select: {
                countLikes: true,
                countDislikes: true,
            },
        });

        return {
            countLikes: updatedPost.countLikes,
            countDislikes: updatedPost.countDislikes,
        };
    },
};