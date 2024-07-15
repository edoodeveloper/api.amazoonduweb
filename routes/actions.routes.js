const express = require('express');
const router = express.Router();
const actionController = require('../controllers/action.controller');


// ################################################ //
// ################ LATESTACTIONS ROUTES ################# //
// ############################################## //

router.get('/', actionController.getActions);;

// #################################################### //
// #################### LATESTACTIONS ROUTES ################# //
// ################################################## //

module.exports = router;