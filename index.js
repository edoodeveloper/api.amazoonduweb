const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
// Routes
const apiRoutes = require('./routes/api.routes');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const carouselRoutes = require('./routes/carousel.routes');
const actionsRoutes = require('./routes/actions.routes');
const activityRoutes = require('./routes/activity.routes');
const eventRoutes = require('./routes/event.routes');
const helpRoutes = require('./routes/help.routes');
const actualityRoutes = require('./routes/actuality.routes');
const causeRoutes = require('./routes/cause.routes');
const socialLinkRoutes = require('./routes/socialLink.routes');
const contactRoutes = require('./routes/contact.routes');
const testimonialRoutes = require('./routes/testimonial.routes');
const pageRoutes = require('./routes/page.routes');
const aboutRoutes = require('./routes/about.routes');
const tagRoutes = require('./routes/tag.routes');
const postRoutes = require('./routes/post.routes');
const topicRoutes = require('./routes/topic.routes');
const blogCommentRoutes = require('./routes/blogComment.routes');
const forumCommentRoutes = require('./routes/forumComment.routes');
// Middlewares
const authenticateToken = require('./middlewares/authenticate.middleware');

const app = express();

app.use(cors());

// Middleware qui permet de traiter les données de la request
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/categories', categoryRoutes);
app.use('/api/carousels', carouselRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/helps', helpRoutes);
app.use('/api/actualities', actualityRoutes);
app.use('/api/causes', causeRoutes);
app.use('/api/socials', socialLinkRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/abouts', aboutRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/blogComments', blogCommentRoutes);
app.use('/api/forumComments', forumCommentRoutes);

// Utilisation des routes authentification
app.use('/api/auth', authRoutes);

// Middleware appliqué à toutes les routes de l'API
app.use('/api/v1', authenticateToken, apiRoutes);

app.post('/upload', (req, res) => {
    // res.json({"key": "test me please !"});
    res.send('File uploaded successfully');
})

// Au démarrage du serveur
app.listen(process.env.PORT, () => {
    console.log('Serveur en cours d\'écoute sur le port 2024');
});