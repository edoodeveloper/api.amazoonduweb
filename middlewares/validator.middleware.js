const { body } = require('express-validator');
// const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const userModel = require('../models/user.model');

// Fonction pour valider un numéro de téléphone
function isValidPhoneNumber(phoneNumber) {
    try {
        const number = phoneUtil.parse(phoneNumber);
        return phoneUtil.isValidNumber(number);
    } catch (error) {
        return false;
    }
}

// Vérification si la date est expirée ou non
function isExpired(expirationDate) {
    const currentDate = new Date();
    return expirationDate < currentDate;
}

// Calculer la date d'expiration de l'abonnement
function calculateExpirationDate(durationMonths) {
    const currentDate = new Date();
    const expirationDate = new Date(currentDate);

    expirationDate.setMonth(expirationDate.getMonth() + durationMonths);

    return expirationDate;
}

const register = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('Veuillez saisir un nom valide !'),
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Veuillez saisir un prénom valide !'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Le champs email est requis !')
        .isEmail()
        .withMessage('Veuillez saisir une adresse email valide')
        .custom(async (value) => {
            // Ajoutez des règles supplémentaires si nécessaire, par exemple, pour interdire les alias avec le signe plus
            const aliasRegex = /\+/;

            if (aliasRegex.test(value)) {
                throw new Error('Les adresses e-mail avec alias(+) ne sont pas autorisées !');
            }

            const existingUserByEmail = await userModel.findUserByEmail(value);

            if (existingUserByEmail) {
                throw new Error('Un utilisateur existe déjà avec cet email !');
            }
            return true;
        }),
    /* body('phone')
        .trim()
        .notEmpty()
        .withMessage('Veuillez saisir le numéro de téléphone')
        .custom(async (value) => {
            // Vérification du numéro de téléphone
            if (!value || !isValidPhoneNumber(value)) {
                throw new Error('Numéro de téléphone invalide.');
            }

            // Vérification de l'existence du numéro dans la base de données
            const existingUserByPhone = await userModel.findUserByPhone(value);
            if (existingUserByPhone) {
                throw new Error('Le numéro de téléphone est déjà utilisé !');
            }

            return true;
        }), */
    body('phone')
        .optional()
        .custom(async (value, { req }) => {
            if (value && value.trim().length < 3) {
                throw new Error('Veuillez saisir le numéro de téléphone');
            }

            // Si le champ est facultatif et non fourni, ne pas lancer d'erreur
            if (!value) {
                return true;
            }

            return true; // Autrement, valide s'il est fourni
        }),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('repeatPassword')
        .custom((value, { req }) => {
            const { password } = req.body;
            if (value !== password) {
                throw new Error('Les deux(2) mots de passe ne correspondent pas !');
            }
            return true;
        }),
];

const resetPassword = [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('repeatPassword')
        .custom((value, { req }) => {
            const { password } = req.body;
            if (value !== password) {
                throw new Error('Les deux(2) mots de passe ne correspondent pas !');
            }
            return true;
        }),
    body('token')
        .custom(async (value, { req }) => {
            const user = await userModel.findUserByResetToken(value);
            if (!user) {
                throw new Error('Le lien est invalide ou expiré !');
            }

            // dans req.body pour une utilisation ultérieure si nécessaire
            req.body.userId = user.id;
            return true;
        }),
];

const payment = [
    body('subscriptionId')
        .trim()
        .notEmpty()
        .withMessage('Veuillez sélectionner un abonnement valide !')
        .custom(async (value, { req }) => {
            const { id, firstName, phone } = req.user;
            const subs = await subscriptionModel.getSubscriptionById(value);

            if (!subs) {
                throw new Error('Veuillez sélectionner un abonnement valide !');
            }

            const existingSubscriptions = await subscriberModel.getSubscriber(id);

            if (existingSubscriptions && !isExpired(existingSubscriptions.expirationDate)) {
                throw new Error('Vous avez déjà un abonnement !');
            }

            const { cost, duration } = subs;

            // Calculer la date d'expiration de l'abonnement
            const expirationDate = calculateExpirationDate(duration);

            req.body.userId = id;
            req.body.firstName = firstName;
            req.body.phone = phone;
            req.body.subscriptionId = value;
            req.body.amount = cost;
            req.body.expirationDate = expirationDate;

            return true;
        }),
];

module.exports = {
    register,
    resetPassword,
    payment
};