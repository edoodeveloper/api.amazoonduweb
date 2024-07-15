const cloudinary = require('../config/cloudinaryConfig');

async function uploadToCloudinary(file, options = {}) {
    try {
        // Options de transformation par défaut
        const uploadOptions = {
            folder: 'amazoon',  // Dossier où seront stockées les images
            transformation: {
                width: 1200,
                height: 800,
                crop: 'limit', // Recadrer si nécessaire pour respecter les dimensions spécifiées
                quality: 'auto:best'
            },
            ...options
        };

        // Uploader l'image vers Cloudinary
        const result = await cloudinary.uploader.upload(file.filepath, uploadOptions);

        return result;
    } catch (error) {
        throw new Error(`Erreur lors de l'upload vers Cloudinary : ${error.message}`);
    }
}

module.exports = { uploadToCloudinary };