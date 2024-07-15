const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');


// ############################################### //
// ################ POST ROUTES ################# //
// ############################################# //

router.get('/', postController.getAllPosts);

router.get('/:id', postController.getPostById);

// ################################################### //
// #################### POST ROUTES ################# //
// ################################################# //

module.exports = router;