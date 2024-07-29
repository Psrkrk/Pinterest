var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./posts');
const passport = require('passport');
const upload = require('./multer');
const localStrategy = require('passport-local');

// Passport Configuration
passport.use(new localStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Routes
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
    res.render('login', { error: req.flash('error') });
});

/* GET feed page. */
router.get('/feed', function(req, res, next) {
    res.render('feed');
});

/* POST upload image */
router.post('/upload', isLoggedIn, upload.single('file'), async function(req, res, next) {
    if (!req.file) {
        return res.status(404).send('No file was given');
    }
    try {
        const user = await userModel.findOne({ username: req.session.passport.user });
        const post = await postModel.create({
            image: req.file.filename,
            imageText: req.body.filecaption,
            user: user._id
        });
        user.posts.push(post._id);
        await user.save();
        res.redirect('/profile');
    } catch (error) {
        next(error);
    }
});

/* GET profile page */
router.get('/profile', isLoggedIn, async function(req, res, next) {
    try {
        const user = await userModel.findOne({ username: req.session.passport.user }).populate('posts');
        res.render('profile', { user });
    } catch (error) {
        next(error);
    }
});

/* POST register user */
router.post('/register', function(req, res, next) {
    const { username, email, fullname } = req.body;
    const userData = new userModel({ username, email, fullname });

    userModel.register(userData, req.body.password)
        .then(function() {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/profile');
            });
        })
        .catch(next);
});

/* POST login user */
router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

/* GET logout user */
router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

module.exports = router;