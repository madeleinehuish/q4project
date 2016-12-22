'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('../knex');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const { camelizeKeys, decamelizeKeys } = require('humps');
const request = require('request-promise')

const router = express.Router();

const strategy = new OAuth2Strategy({
  authorizationURL: `https://github.com/login/oauth/authorize`,
  // scope: ['r_basicprofile', 'r_emailaddress'],
  scope: 'user:email',
  tokenURL: 'https://github.com/login/oauth/access_token',
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/api-oauth/github/callback'
}, (accessToken, refreshToken, profile, done) => {
  let ghprofile = null;
  console.log(accessToken);

  const profiledata = request({
    url: `https://api.github.com/user?access_token=${accessToken}`,
    headers: {
      'User-Agent': 'Maddie Server'
    }
  });

  const email = request({
    url: `https://api.github.com/user/emails?access_token=${accessToken}`,
    headers: {
      'User-Agent': 'Maddie Server'
    }
  });

  Promise.all([profiledata, email])
  .then(([ghprofile, emails]) => {

    ghprofile = JSON.parse(ghprofile);
    emails = JSON.parse(emails);
    // console.log(ghprofile);
    const nameSplit = ghprofile.name.split(' ');
    const firstName = nameSplit[0];
    const lastName = nameSplit[1];
    console.log(firstName);
    console.log(lastName);
    console.log(emails[0].email);

    return knex('users')
      .where('github_id', ghprofile.id)
      .first();
  })
  .then((user) => {
    if (user) {
      return user;
    }

    return knex('users')
      .insert(({
        first_name: firstName,
        last_name: lastName,
        email: emails[0].email,
        github_id: ghprofile.id,
        github_token: accessToken,
      }), '*');
    })
    .then((user) => {
      console.log(user);
      done(null, camelizeKeys(user));
    })
    .catch((err) => {
      done(err);
    });
});

passport.use(strategy);

router.get('/github', passport.authenticate('oauth2', { session: false }));

router.get('/github/callback', passport.authenticate('oauth2', {
  session: false,
  failureRedirect: '/'
}), (req, res) => {
  console.log(req.user);
  const expiry = new Date(Date.now() + 1000 * 60 * 60 * 3); // 3 hours
  const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, {
    expiresIn: '3h'
  });

  res.cookie('token', token, {
    httpOnly: true,
    expires: expiry,
    secure: router.get('env') === 'production'
  });

  // Successful authentication, redirect home.
  res.redirect('/');
});

module.exports = router;