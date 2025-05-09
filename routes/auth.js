const express = require('express');
const router = express.Router(); // mini instance of express
const User = require('../models/User');
const passport = require('passport');

// to show the form of signup
router.get('/register', (req, res) => {
    res.render('auth/signup');
})

// to actually want to register a user in DB
router.post('/register', async (req, res) => {
    try {
        let { email, username, password, role } = req.body;
        const user = new User({ email, username, role });
        const newUser = await User.register(user, password);
        req.login(newUser, function (err) { 
            if (err) { return next(err); }
            req.flash('success', 'welcome, you are registered successfully')
            return res.redirect('/products');
        });
    }
    catch (e) {
        req.flash('error', e.message);
        return res.redirect('/products');
    }
})

// to get login page
router.get('/login', (req, res) => {
    res.render('auth/login');
})

// to login through DB
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureMessage: true,
    failureFlash:'Invalid username or password.',
}),
function (req, res) {
    req.flash('success', `welcome back ${req.user.username}`)
    res.redirect('/products');
});


// to logout
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success', 'Goodbye friend'); //
    req.session.destroy(() => {
      res.redirect('/login');
    });
  });
});
module.exports = router;