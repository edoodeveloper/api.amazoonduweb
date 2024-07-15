const express = require('express');
const router = express.Router();
const pageController = require('../controllers/page.controller');


// ############################################### //
// ################ PAGE ROUTES ################# //
// ############################################# //

router.get('/:name', pageController.getPageByName);;

// ################################################### //
// #################### PAGE ROUTES ################# //
// ################################################# //

module.exports = router;