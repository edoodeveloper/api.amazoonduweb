const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');


// ################################################ //
// ################ ACTIVITY ROUTES ################# //
// ############################################## //

router.get('/', activityController.getActivities);;

// #################################################### //
// #################### ACTIVITY ROUTES ################# //
// ################################################## //

module.exports = router;