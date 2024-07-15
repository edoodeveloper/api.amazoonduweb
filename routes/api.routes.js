const express = require('express');
const router = express.Router();
// Les controllers
const userController = require('../controllers/user.controller');
const categoryController = require('../controllers/category.controller');
const tagController = require('../controllers/tag.controller');
const postController = require('../controllers/post.controller');
const topicController = require('../controllers/topic.controller');
const blogCommentController = require('../controllers/blogComment.controller');
const forumCommentController = require('../controllers/forumComment.controller');
const statController = require('../controllers/stat.controller');
const carouselController = require('../controllers/carousel.controller');
const actionController = require('../controllers/action.controller');
const activityController = require('../controllers/activity.controller');
const eventController = require('../controllers/event.controller');
const testimonialController = require('../controllers/testimonial.controller');
const helpController = require('../controllers/help.controller');
const actualityController = require('../controllers/actuality.controller');
const causeController = require('../controllers/cause.controller');
const pageController = require('../controllers/page.controller');
const aboutController = require('../controllers/about.controller');
const socialLinkController = require('../controllers/socialLink.controller');
const contactController = require('../controllers/contact.controller');


// ############################################################ //
// ######################## USER ROUTES ###################### //
// ########################################################## //

// GET all users
router.get('/users', userController.getAllUsers);

// GET user by ID
router.get('/users/profile', userController.getProfile);

// GET user by ID
router.get('/users/:id', userController.getUserById);

// Comment activer ou désactiver un user
router.post('/users/block', userController.updateAnyUserStatus);

// Route pour la modification du mot de passe
router.put('/users/update-password', userController.updateAnyUserPassword);

router.put('/users/:id', userController.updateProfile);

router.put('/admins/:id', userController.updateAnyAdmin);

// DELETE user by ID
router.delete('/users/:id', userController.deleteUserById);

// ################################################################# //
// ######################## END USER ROUTES ####################### //
// ############################################################### //




// ##################################################### //
// ################ CATEGORIES ROUTES ################# //
// ################################################### //

// Récupérer toutes les catégories
router.get('/categories', categoryController.getAllCategories);

// Récupérer une catégorie par son ID
router.get('/categories/:id', categoryController.getCategoryById);

// Créer une nouvelle catégorie
router.post('/categories', categoryController.createCategory);

// Mettre à jour une catégorie par son ID
router.put('/categories/:id', categoryController.updateCategoryById);

// Supprimer une catégorie par son ID
router.delete('/categories/:id', categoryController.deleteCategoryById);

// ######################################################### //
// #################### CATEGORIES ROUTES ################# //
// ####################################################### //



// ############################################### //
// ################ CAROUSELS ROUTES ################# //
// ############################################# //

// Récupérer toutes les carousel
router.get('/carousels', carouselController.getAllCaoursel);

// Récupérer une carousel par son ID
router.get('/carousels/:id', carouselController.getCarouselById);

// Récupérer une carousel par son nom
router.get('/carousels/:name', carouselController.getCarouselByName);

// Créer une nouvelle carousel
router.post('/carousels', carouselController.createCarousel);

// Mettre à jour une carousel par son ID
router.put('/carousels/:id', carouselController.updateCarouselById);

// Supprimer une carousel par son ID
router.delete('/carousels/:name', carouselController.deleteCarouselByName);

// ################################################### //
// #################### CAROUSELS ROUTES ################# //
// ################################################# //



// ############################################### //
// ########## ACTION ROUTES ############## //
// ############################################# //

// Récupérer toutes les action
router.get('/actions', actionController.getActions);

// Récupérer une action par son ID
router.get('/actions/:id', actionController.getActionById);

// Créer une nouvelle action
router.post('/actions', actionController.createAction);

// Mettre à jour une action par son ID
router.put('/actions/:id', actionController.updateActionById);

// Supprimer une action par son ID
router.delete('/actions/:id', actionController.deleteActionById);

// ################################################### //
// ############## ACTION ROUTES ############## //
// ################################################# //





// ############################################### //
// ########## CONTACTS ROUTES ############## //
// ############################################# //

// Récupérer toutes les contact
router.get('/contacts', contactController.getAllContacts);

// Récupérer une contact par son ID
router.get('/contacts/:id', contactController.getContactById);

// Créer une nouvelle contact
router.post('/contacts', contactController.createContact);

// Mettre à jour une contact par son ID
router.put('/contacts/:id', contactController.updateContactById);

// Supprimer une contact par son ID
router.delete('/contacts/:id', contactController.deleteContactById);

// ################################################### //
// ############## CONTACTS ROUTES ############## //
// ################################################# //




// ############################################### //
// ########## ACTIVITY ROUTES ############## //
// ############################################# //

// Récupérer toutes les action
router.get('/activities', activityController.getActivities);

// Récupérer une activity par son ID
router.get('/activities/:id', activityController.getActivityById);

// Créer une nouvelle activity
router.post('/activities', activityController.createActivity);

// Mettre à jour une activity par son ID
router.put('/activities/:id', activityController.updateActivityById);

// Supprimer une activity par son ID
router.delete('/activities/:id', activityController.deleteActivityById);

// ################################################### //
// ############## ACTIVITY ROUTES ############## //
// ################################################# //




// ############################################### //
// ########## TESTIMONIAL ROUTES ############## //
// ############################################# //

// Récupérer touS
router.get('/testimonials', testimonialController.getTestimonials);

// Récupérer une testimonial par son ID
router.get('/testimonials/:id', testimonialController.getTestimonialById);

// Créer une nouvelle testimonial
router.post('/testimonials', testimonialController.createTestimonial);

// Mettre à jour une testimonial par son ID
router.put('/testimonials/:id', testimonialController.updateTestimonialById);

// Supprimer une testimonial par son ID
router.delete('/testimonials/:id', testimonialController.deleteTestimonialById);

// ################################################### //
// ############## TESTIMONIAL ROUTES ############## //
// ################################################# //





// ############################################### //
// ########## HELP ROUTES ############## //
// ############################################# //

// Récupérer touS
router.get('/helps', helpController.getHelps);

// Récupérer une aide par son ID
router.get('/helps/:id', helpController.getHelpById);

// Créer une nouvelle aide
router.post('/helps', helpController.createHelp);

// Mettre à jour une aide par son ID
router.put('/helps/:id', helpController.updateHelpById);

// Supprimer une aide par son ID
router.delete('/helps/:id', helpController.deleteHelpById);

// ################################################### //
// ############## HELP ROUTES ############## //
// ################################################# //





// ############################################ //
// ########## SOCIALLINK ROUTES ############## //
// ########################################## //

// Récupérer touS
router.get('/socials', socialLinkController.getSocialLinks);

// Créer une nouv
router.post('/socials', socialLinkController.createSocialLink);

// Mettre à jour par son ID
router.put('/socials/:id', socialLinkController.updateSocialLinkById);

// ################################################ //
// ############## SOCIALLINK ROUTES ############## //
// ############################################## //





// ############################################### //
// ########## ACTUALITY ROUTES ############## //
// ############################################# //

// Récupérer touS
router.get('/actualities', actualityController.getActualities);

// Récupérer une aide par son ID
router.get('/actualities/:id', actualityController.getActualityById);

// Créer une nouvelle aide
router.post('/actualities', actualityController.createActuality);

// Mettre à jour une aide par son ID
router.put('/actualities/:id', actualityController.updateActualityById);

// Supprimer une aide par son ID
router.delete('/actualities/:id', actualityController.deleteActualityById);

// ################################################### //
// ############## ACTUALITY ROUTES ############## //
// ################################################# //





// ############################################### //
// ########## CAUSE ROUTES ############## //
// ############################################# //

// Récupérer touS
router.get('/causes', causeController.getCauses);

// Récupérer une aide par son ID
router.get('/causes/:id', causeController.getCauseById);

// Créer une nouvelle aide
router.post('/causes', causeController.createCause);

// Mettre à jour une aide par son ID
router.put('/causes/:id', causeController.updateCauseById);

// Supprimer une aide par son ID
router.delete('/causes/:id', causeController.deleteCauseById);

// ################################################### //
// ############## CAUSE ROUTES ############## //
// ################################################# //





// ############################################### //
// ########## PAGE ROUTES ############## //
// ############################################# //

// Récupérer touS
router.get('/pages', pageController.getPages);

// Récupérer page par son ID
// router.get('/pages/:id', pageController.getPageById);

// Récupérer page par son Name
router.get('/pages/:name', pageController.getPageByName);

// Créer une nouvelle aide
router.post('/pages', pageController.createPage);

// Mettre à jour page par son ID
// router.put('/pages/:id', pageController.updatePageById);

// Mettre à jour page par son name
router.put('/pages/:name', pageController.updatePageByName);

// Supprimer page par son ID
router.delete('/pages/:id', pageController.deletePageById);

// ################################################### //
// ############## PAGE ROUTES ############## //
// ################################################# //





// ############################################### //
// ########## ABOUT ROUTES ############## //
// ############################################# //

// Récupérer touS
router.get('/abouts', aboutController.getAbouts);

// Récupérer a propos par son ID
// router.get('/abouts/:id', aboutController.getAboutById);

// Récupérer a propos par son Name
router.get('/abouts/:name', aboutController.getAboutByName);

// Créer un about
router.post('/abouts', aboutController.createAbout);

// Mettre à jour a propos par son ID
// router.put('/abouts/:id', aboutController.updateAboutById);

// Mettre à jour a propos par son name
router.put('/abouts/:name', aboutController.updateAboutByName);

// Supprimer a propos par son ID
router.delete('/abouts/:id', aboutController.deleteAboutById);

// ################################################### //
// ############## ABOUT ROUTES ############## //
// ################################################# //





// ############################################### //
// ########## EVENT ROUTES ############## //
// ############################################# //

// Récupérer tous
router.get('/events', eventController.getEvents);

// Récupérer  par son ID
router.get('/events/:id', eventController.getEventById);

// Créer une nouvelle
router.post('/events', eventController.createEvent);

// Mettre à jour par son ID
router.put('/events/:id', eventController.updateEventById);

// Supprimer par son ID
router.delete('/events/:id', eventController.deleteEventById);

// ################################################### //
// ############## EVENT ROUTES ############## //
// ################################################# //




// ##################################################### //
// ################ CATEGORIES ROUTES ################# //
// ################################################### //

// Récupérer toutes les tags
router.get('/tags', tagController.getAllTags);

// Récupérer une tag par son ID
router.get('/tags/:id', tagController.getTagById);

// Créer une nouvelle tag
router.post('/tags', tagController.createTag);

// Mettre à jour une tag par son ID
router.put('/tags/:id', tagController.updateTagById);

// Supprimer une tag par son ID
router.delete('/tags/:id', tagController.deleteTagById);

// ######################################################### //
// #################### CATEGORIES ROUTES ################# //
// ####################################################### //




// ############################################################## //
// ################ POST ROUTES ################# //
// ############################################################ //

// Récupérer toutes les posts
router.get('/posts', postController.getAllPosts);

// Récupérer une post par son ID
router.get('/posts/:id', postController.getPostById);

// Créer un nouveau post
router.post('/posts', postController.createPost);

// Mettre à jour un post par son ID
router.put('/posts/:id', postController.updatePostById);

// Supprimer une post par son ID
router.delete('/posts/:id', postController.deletePostById);

// Like or Dislike a post
router.post('/posts/like-dislike', postController.likeOrDislikePost);

// ################################################################## //
// #################### POST ROUTES ################# //
// ################################################################ //




// ############################################################## //
// ################ TOPIC ROUTES ################# //
// ############################################################ //

// Récupérer toutes les topics
router.get('/topics', topicController.getAllTopics);

// Récupérer une topic par son ID
router.get('/topics/:id', topicController.getTopicById);

// Créer un nouveau topic
router.post('/topics', topicController.createTopic);

// Mettre à jour un topic par son ID
router.put('/topics/:id', topicController.updateTopicById);

// Supprimer une topic par son ID
router.delete('/topics/:id', topicController.deleteTopicById);

// Like or Dislike a topic
router.post('/topics/like-dislike', topicController.likeOrDislikeTopic);

// ################################################################## //
// #################### TOPIC ROUTES ################# //
// ################################################################ //




// ############################################################## //
// ######### COMMENTAIRES DES POSTS BLOGS ROUTES ############### //
// ############################################################ //

// Créer un commentaire pour un post spécifique
router.post('/blogComments', blogCommentController.createComment);

// Récupérer les commentaires de toutes les vidéos
router.get('/blogComments', blogCommentController.getAllComments);

// Récupérer un commentaire par son ID
router.get('/blogComments/:id', blogCommentController.getCommentById);

// Mettre à jour un commentaire
router.put('/blogComments/:id', blogCommentController.updateComment);

// Supprimer un commentaire
router.delete('/blogComments/:id', blogCommentController.deleteComment);

// Like or Dislike a post
router.post('/blogComments/like-dislike', blogCommentController.likeOrDislikeComment);

// ################################################################## //
// ########### END COMMENTAIRE DES POSTS BLOGS ROUTES ############## //
// ################################################################ //



// ############################################################## //
// ######### COMMENTAIRES DES TOPICS FORUM ROUTES ############### //
// ############################################################ //

// Créer un commentaire pour un post spécifique
router.post('/forumComments', forumCommentController.createComment);

// Récupérer les commentaires de toutes les vidéos
router.get('/forumComments', forumCommentController.getAllComments);

// Récupérer un commentaire par son ID
router.get('/forumComments/:id', forumCommentController.getCommentById);

// Mettre à jour un commentaire
router.put('/forumComments/:id', forumCommentController.updateComment);

// Supprimer un commentaire
router.delete('/forumComments/:id', forumCommentController.deleteComment);

// Like or Dislike a post
router.post('/forumComments/like-dislike', forumCommentController.likeOrDislikeComment);

// ################################################################## //
// ########### END COMMENTAIRE DES TOPICS FORUM ROUTES ############## //
// ################################################################ //




// ############################################################## //
// ######### ROUTES STAT ############### //
// ############################################################ //

router.get('/stats', statController.getAllStats);
router.get('/stats/users/:year', statController.getRegistrationsStatsByYear);

// ################################################################## //
// ########### END STAT ROUTES ############## //
// ################################################################ //

module.exports = router;