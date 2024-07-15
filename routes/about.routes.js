const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/about.controller');


// ################################################ //
// ################ ABOUT ROUTES ################# //
// ############################################## //

router.get('/:name', aboutController.getAboutByName);;

// #################################################### //
// #################### ABOUT ROUTES ################# //
// ################################################## //

module.exports = router;