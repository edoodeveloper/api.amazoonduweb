const postModel = require('../models/post.model');
const cloudinary = require('../config/cloudinaryConfig');
const formidable = require('formidable');
const fs = require('fs');
const { uploadToCloudinary } = require('../helpers/cloudinary.helper');
const slugify = require('slugify');

module.exports = {
    // Controller method to create a new post
    createPost: async (req, res) => {
        try {
            const userId = req.user.id;
            const form = new formidable.IncomingForm();

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    // Supprimez le fichier temporaire après l'upload sur Cloudinary
                    fs.unlinkSync(files.imageUrl[0].filepath);
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }

                if (!files['imageUrl'] || !files['imageUrl'][0]) {
                    return res.json({
                        success: false,
                        message: `L'image du post est obligatoire !`,
                    });
                }

                if (!fields['categoryId'] || !fields['categoryId'][0]) {
                    return res.json({
                        success: false,
                        message: `La catégorie du post est obligatoire !`,
                    });
                }

                if (!fields['tags'] || !fields['tags'].length === 0) {
                    return res.json({
                        success: false,
                        message: `Tags du post est obligatoire !`,
                    });
                }

                if (!fields['title'] || !fields['title'][0]) {
                    return res.json({
                        success: false,
                        message: `Le titre du post est obligatoire !`,
                    });
                }

                if (!fields['content'] || !fields['content'][0] || fields['content'][0] === '<p><br></p>') {
                    return res.json({
                        success: false,
                        message: `Le contenu du post est obligatoire !`,
                    });
                }

                // Générer un slug unique
                let slug = slugify(fields['title'][0], { lower: true });
                let existingPost = await postModel.getPostBySlug(slug);

                // Si le slug existe déjà, ajouter un suffixe pour le rendre unique
                let suffix = 1;
                while (existingPost) {
                    slug = `${slugify(fields['title'][0], { lower: true })}-${suffix}`;
                    existingPost = await postModel.getPostBySlug(slug);
                    suffix++;
                }

                const result = await uploadToCloudinary(files.imageUrl[0]);
                const anyImageUrl = result.secure_url;

                const formData = {
                    imageUrl: anyImageUrl,
                    category: { connect: { id: fields['categoryId'][0] } },
                    tags: {
                        connect: JSON.parse(JSON.stringify(fields['tags'])).map(tagId => ({ id: tagId })) || [],
                    },
                    title: fields['title'][0],
                    slug: slug,
                    content: fields['content'][0],
                    user: { connect: { id: userId } },
                };
                // Call the createPost method from the model to create the post
                const newPost = await postModel.createPost(formData);
                // Send the newly created post as a JSON response
                res.status(201).json({
                    success: true,
                    data: newPost
                });
            });
        }
        catch (error) {
            // If an error occurs during post creation, send a 500 response with an error message
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

    // Controller method to get a post by its ID
    getPostById: async (req, res) => {
        try {
            // Extract the post ID from the request parameters
            const postId = req.params.id;
            // Call the getPostById method from the model to fetch the post
            const post = await postModel.getPostById(postId);
            // If the post is not found, send a 404 response with an error message
            if (!post) {
                return res.status(404).json({ error: 'Post non trouvé' });
            }
            // Send the fetched post as a JSON response
            res.json(post);
        } catch (error) {
            // If an error occurs during post retrieval, send a 500 response with an error message
            res.status(500).json({ error: 'Impossible de récupérer le post' });
        }
    },

    // Controller method to get all posts
    getAllPosts: async (req, res) => {
        try {
            // Results
            let allPosts = {};
            let whereClause = {};

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;

            if (req.query.category) {
                const countryFilter = Array.isArray(req.query.category)
                    ? { name: { in: req.query.category } }
                    : { name: { contains: req.query.category } };

                whereClause = {
                    ...whereClause,
                    category: countryFilter
                };
            }

            if (req.query.tag) {
                const tagFilter = Array.isArray(req.query.tag)
                    ? { name: { in: req.query.tag } }
                    : { name: { contains: req.query.tag } };

                whereClause = {
                    ...whereClause,
                    tags: {
                        some: tagFilter
                    }
                };
            }

            if (req.query.q) {
                if (!whereClause.OR) {
                    whereClause.OR = [];
                }

                // Ajoutez les conditions OR pour la recherche
                whereClause.OR.push({
                    title: {
                        contains: req.query.q,
                    },
                });

                whereClause.OR.push({
                    content: {
                        contains: req.query.q,
                    },
                });

                whereClause.OR.push({
                    category: {
                        name: { contains: req.query.q }
                    },
                });

                whereClause.OR.push({
                    tag: {
                        name: { contains: req.query.q }
                    }
                });
            }

            allPosts = await postModel.getAllPosts(page, per_page, whereClause);
            res.status(200).json(allPosts);
        } catch (error) {
            console.log(error);
            res.status(404).json({
                success: false,
                message: 'Erreur lors de la récupération des données !',
            });
        }
    },

    // Controller method to update a post
    updatePostById: async (req, res) => {
        try {
            const form = new formidable.IncomingForm();
            const { id } = req.params;
            const fieldsToUpdate = {};
            const response = await postModel.getPostById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Post non trouvée. Veuillez créer un post !'
                });
            }

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    // Supprimez le fichier temporaire après l'upload sur Cloudinary
                    fs.unlinkSync(files.imageUrl[0].filepath);
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }

                // Supprimer l'image de profil actuelle sur Cloudinary
                if (files.imageUrl && files.imageUrl[0].filepath) {
                    // Définir un public_id pour l'image
                    const publicId = `post-image/${Date.now()}`;

                    if (response.imageUrl) {
                        const oldPublicId = response.imageUrl.split('/').pop().split('.')[0];
                        await cloudinary.uploader.destroy(oldPublicId);
                    }
                    const result = await uploadToCloudinary(files.imageUrl[0], {
                        public_id: publicId,
                    });

                    fieldsToUpdate.imageUrl = result.secure_url;
                    // Supprimez le fichier temporaire après l'upload sur Cloudinary
                    fs.unlinkSync(files.imageUrl[0].filepath);
                }

                if (fields['categoryId'] && fields['categoryId'][0]) {
                    fieldsToUpdate.categoryId = fields['categoryId'][0];
                }

                if (fields['tags'] && JSON.parse(JSON.stringify(fields['tags'])).length > 0) {
                    fieldsToUpdate.tags = {
                        connect: JSON.parse(JSON.stringify(fields['tags'])).map(tagId => ({ id: tagId }))
                    };
                }

                if (fields['title'] && fields['title'][0]) {
                    fieldsToUpdate.title = fields['title'][0];
                    // Générer un slug unique
                    let slug = slugify(fields['title'][0], { lower: true });
                    let existingPost = await postModel.getPostBySlug(slug);

                    // Si le slug existe déjà, ajouter un suffixe pour le rendre unique
                    let suffix = 1;
                    while (existingPost) {
                        slug = `${slugify(fields['title'][0], { lower: true })}-${suffix}`;
                        existingPost = await postModel.getPostBySlug(slug);
                        suffix++;
                    }
                    fieldsToUpdate.slug = slug;
                }

                if (fields['content'] && fields['content'][0] && fields['content'][0] !== '<p><br></p>') {
                    fieldsToUpdate.content = fields['content'][0];
                }

                // Vérifier si des données ont été ajoutées à dataToUpdate
                if (Object.keys(fieldsToUpdate).length === 0) {
                    return res.json({
                        status: false,
                        message: "Aucune donnée envoyée pour la mise à jour !"
                    });
                }

                // Enregistre les modifications dans la base de données
                await postModel.updatePost(response.id, fieldsToUpdate);
                res.status(200).json({
                    success: true,
                    message: "Modifié avec succès !"
                });
            });
        }
        catch (error) {
            // If an error occurs during post creation, send a 500 response with an error message
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

    // Controller method to delete a post
    deletePostById: async (req, res) => {
        const { id } = req.params;

        try {
            const response = await postModel.getPostById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Post non trouvée !'
                });
            }

            const deleted = await postModel.deletePost(id);

            if (!deleted) {
                return res.json({
                    success: false,
                    message: 'Post non trouvé'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Post supprimé avec success'
            });
        } catch (error) {
            if (error.code === 'P2003') {
                // Gérer l'erreur de suppression de clé étrangère
                res.json({
                    success: false,
                    message: 'Impossible de supprimer cette entrée car elle est référencée ailleurs !'
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Une erreur est survenue lors de la suppression.'
                });
            }
        }
    },

    // Controller method to increment post views
    incrementPostViews: async (req, res) => {
        try {
            const postId = req.params.id;
            await postModel.incrementPostViews(postId);
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: 'Unable to increment post views' });
        }
    },

    // Controller method to like or dislike a post
    likeOrDislikePost: async (req, res) => {
        try {
            const userId = req.user.id;
            const { postId, type } = req.body;
            const result = await postModel.likeOrDislikePost(userId, postId, type);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to like/dislike post'
            });
        }
    },
};