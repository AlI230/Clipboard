const express = require('express');
const router = express.Router();
const User = require('../models/users');
const bcrypt = require('bcryptjs');
const passport = require('passport');

require('../middleware/passport')(passport)

router.get('/login', (req, res)=> {
    res.render('login');
});

router.post('/login', (req, res, next)=> {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res)=>{
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/user/login');
});

router.get('/signup', (req, res)=> {
    res.render('signup');
});

router.post('/signup', (req, res)=> {
    let errors = [];
    if (req.body.username && req.body.name && req.body.firstname && req.body.email && req.body.password != null) {   
        User.findOne({ email : req.body.email }, (err, user)=> {
            if(err){
                errors.push({ msg : 'error email' });
            }
            if(user){
                errors.push({msg: 'email already used'});
            } else {
                User.findOne({ username : req.body.username }, (err, user)=> {
                    if(err) {
                        errors.push({ msg : 'error username' });
                    }
                    if (user) {
                        errors.push({msg: 'username already used'});
                    } else  {

                        var salt = bcrypt.genSaltSync(10);
                        var hash = bcrypt.hashSync(req.body.password, salt);

                        var user = new User();

                        user.username = req.body.username;
                        user.lastname = req.body.name;
                        user.firstname = req.body.firstname;
                        user.email = req.body.email;
                        user.password = hash;

                    user.save();
                    res.redirect(`/`);
                    }
                });
            }
        });
    } else {
        errors.push({msg: 'Please enter all fields'})
    }
});

module.exports = router