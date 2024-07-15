const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonial.controller');


// ################################################ //
// ################ TESTIMONIAL ROUTES ################# //
// ############################################## //

router.get('/', testimonialController.getTestimonials);

// #################################################### //
// #################### TESTIMONIAL ROUTES ################# //
// ################################################## //

module.exports = router;