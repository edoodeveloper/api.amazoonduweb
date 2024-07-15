const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const postModel = require('./post.model');

module.exports = {
    getAllComments: async (page, per_page, whereClause) => {
        const filteredCount = await prisma.blogComment.count({
            where: whereClause // Compte uniquement les éléments correspondant à la clause
        });

        const comments = await prisma.blogComment.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'desc', // Tri par ordre croissant
            },
            select: {
                id: true,
                content: true,
                user: { select: { id: true, firstName: true, avatar: true } },
                post: { select: { id: true, title: true } },
                parentComment: true,
                childComments: true,
                blogCommentLikes: true,
                countLikes: true,
                countDislikes: true,
                createdAt: true,
            }
        });

        const totalPages = Math.ceil(filteredCount / per_page);

        return {
            page,
            per_page,
            totalCount: filteredCount,
            totalPages,
            comments: comments,
        };
    },

    createComment: async (userId, postId, content) => {
        const comment = await prisma.blogComment.create({
            data: {
                postId: postId,
                userId: userId,
                content: content
            }
        });

        if (comment) {
            await postModel.incrementPostComments(comment.postId);

            const detailedComment = await prisma.blogComment.findUnique({
                where: { id: comment.id },
                select: {
                    id: true,
                    content: true,
                    user: { select: { id: true, firstName: true } },
                    post: { select: { id: true, title: true } },
                    parentComment: true,
                    childComments: true,
                    blogCommentLikes: true,
                    countLikes: true,
                    countDislikes: true,
                    createdAt: true,
                }
            });

            return detailedComment;
        }

        return null;
    },

    getCommentById: async (id) => {
        return await prisma.blogComment.findUnique({
            where: {
                id: id
            }
        });
    },

    updateComment: async (id, content) => {
        return await prisma.blogComment.update({
            where: {
                id: id
            },
            data: content
        });
    },

    deleteComment: async (id) => {
        return await prisma.blogComment.delete({
            where: {
                id: id
            }
        });
    },

    likeOrDislikeComment: async (userId, commentId, type) => {
        // Type can be 'like' or 'dislike'
        const like = await prisma.blogCommentLike.findUnique({
            where: {
                userId_blogCommentId: {
                    userId: userId,
                    blogCommentId: commentId,
                },
            },
        });

        if (like) {
            if (like.type === type) {
                // If user already liked/disliked the post with the same type, remove the like/dislike
                await prisma.blogCommentLike.delete({
                    where: {
                        userId_blogCommentId: {
                            userId: userId,
                            blogCommentId: commentId,
                        },
                    },
                });
                // Update the post counters
                if (type === 'like') {
                    await prisma.blogComment.update({
                        where: { id: commentId },
                        data: { countLikes: { decrement: 1 } },
                    });
                } else {
                    await prisma.blogComment.update({
                        where: { id: commentId },
                        data: { countDislikes: { decrement: 1 } },
                    });
                }
            } else {
                // If user liked/disliked with a different type, update the like/dislike
                await prisma.blogCommentLike.update({
                    where: {
                        userId_blogCommentId: {
                            userId: userId,
                            blogCommentId: commentId,
                        },
                    },
                    data: {
                        type: type,
                    },
                });
                // Update the post counters
                if (type === 'like') {
                    await prisma.blogComment.update({
                        where: { id: commentId },
                        data: {
                            countLikes: { increment: 1 },
                            countDislikes: { decrement: 1 },
                        },
                    });
                } else {
                    await prisma.blogComment.update({
                        where: { id: commentId },
                        data: {
                            countLikes: { decrement: 1 },
                            countDislikes: { increment: 1 },
                        },
                    });
                }
            }
        } else {
            // If there's no existing like/dislike, create a new one
            await prisma.blogCommentLike.create({
                data: {
                    userId: userId,
                    blogCommentId: commentId,
                    type: type,
                },
            });
            // Update the post counters
            if (type === 'like') {
                await prisma.blogComment.update({
                    where: { id: commentId },
                    data: { countLikes: { increment: 1 } },
                });
            } else {
                await prisma.blogComment.update({
                    where: { id: commentId },
                    data: { countDislikes: { increment: 1 } },
                });
            }
        }

        // Retrieve updated counts
        const updatedComment = await prisma.blogComment.findUnique({
            where: { id: commentId },
            select: {
                countLikes: true,
                countDislikes: true,
            },
        });

        return {
            countLikes: updatedComment.countLikes,
            countDislikes: updatedComment.countDislikes,
        };
    },
};