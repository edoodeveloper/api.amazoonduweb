const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Exclude keys from user
function exclude(user, keys) {
    return Object.fromEntries(
        Object.entries(user).filter(([key]) => !keys.includes(key))
    );
}

module.exports = {
    // Recherche un utilisateur par token de réinitialisation de mot de passe
    findUserByResetToken: async (resetToken) => {
        return await prisma.user.findFirst({
            where: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: {
                    // Vérifier si la date d'expiration est ultérieure à la date actuelle
                    gte: new Date(),
                },
            },
        });
    },

    findUserByConfirmToken: async (confirmToken) => {
        return await prisma.user.findFirst({
            where: {
                resetPasswordToken: confirmToken,
                resetPasswordExpires: {
                    // Vérifier si la date d'expiration est ultérieure à la date actuelle
                    gte: new Date(),
                },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isAdmin: true,
            }
        });
    },

    // Recherche un utilisateur par adresse e-mail
    findUserByEmail: async (email) => {
        return await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                avatar: true,
                firstName: true,
                lastName: true,
                isAdmin: true,
                level: true,
                email: true,
                phone: true,
                password: true,
            }
        });
    },

    // Recherche un utilisateur par adresse e-mail
    findUserByPhone: async (telephone) => {
        return await prisma.user.findUnique({
            where: {
                phone: telephone
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isAdmin: true,
            }
        });
    },

    // Met à jour le token de réinitialisation de mot de passe pour un utilisateur donné
    updateUserResetToken: async (userId, resetPasswordToken, resetPasswordExpires) => {
        return await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                resetPasswordToken: resetPasswordToken,
                resetPasswordExpires: resetPasswordExpires, // 1 heure d'expiration
            },
        });
    },

    // Met à jour le mot de passe d'un utilisateur donné après réinitialisation
    updateUserPassword: async (userId, newPassword) => {
        return await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: newPassword,
                // Efface le token après réinitialisation
                resetPasswordToken: null,
                // Efface la date d'expiration du token après réinitialisation
                resetPasswordExpires: null,
            },
        });
    },

    updateProfile: async (id, toUpdate) => {
        return await prisma.user.update({
            where: {
                id,
            },
            data: toUpdate,
        });
    },

    // Récupération de tous les users
    getUsers: async (page, per_page, whereClause) => {
        const filteredCount = await prisma.user.count({
            where: whereClause // Compte uniquement les éléments correspondant à la clause
        });

        const users = await prisma.user.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                avatar: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                isAdmin: true,
                status: true,
                createdAt: true,
            },
        });

        const totalPages = Math.ceil(filteredCount / per_page);

        return {
            page,
            per_page,
            totalCount: filteredCount,
            totalPages,
            users,
        };
    },

    updateAnyUser: async (userId, fields) => {
        return await prisma.user.update({
            where: {
                id: userId,
            },
            data: fields
        });
    },

    getUserProfile: async (id) => {
        const profile = await prisma.user.findUnique({
            where: {
                id: id,
            }
        });

        return exclude(profile, ['password']);
    },

    getRefreshData: async (userId) => {
        return await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                firstName: true,
                phone: true,
                isAdmin: true,
            },
        });
    },

    getUserById: async (id) => {
        return await prisma.user.findUnique({
            where: {
                id: id
            }
        });

        // return exclude(anyUser, ['password']);
    },


    updateAnyUserStatus: async (id, status) => {
        return await prisma.user.update({
            where: {
                id: id,
            },
            data: {
                status: status
            }
        });
    },

    createUser: async (data) => {
        return await prisma.user.create({
            data,
        });
    },

    deleteUserById: async (id) => {
        return await prisma.user.delete({
            where: {
                id: id
            },
        });
    },
};