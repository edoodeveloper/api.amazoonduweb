const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');


// ################################################ //
// ################ EVENTS ROUTES ################ //
// ############################################## //

router.get('/', eventController.getEvents);

// #################################################### //
// #################### EVENTS ROUTES ################ //
// ################################################## //

module.exports = router;