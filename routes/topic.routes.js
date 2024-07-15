const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topic.controller');


// ############################################### //
// ################ TOPIC ROUTES ################# //
// ############################################# //

router.get('/', topicController.getAllTopics);

router.get('/:id', topicController.getTopicById);

// ################################################### //
// #################### TOPIC ROUTES ################# //
// ################################################# //

module.exports = router;