var express = require('express')
    , passport = require('passport')
    , util = require('util')
    , FacebookStrategy = require('passport-facebook').Strategy
    , TwitterStrategy = require('passport-twitter').Strategy
    , session = require('express-session')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , config = require('./configuration/config')
    , mysql = require('mysql')
    , Twit = require('twit')
    , FB = require('fb')
    , cors = require('cors')
    , CronJob = require('cron').CronJob
    , twitterJobs = require('./configuration/twitter_jobs')
    , facebookJobs = require('./configuration/facebook_jobs')
    , app = express();

app.use(cors());
//If needed..
var connection = mysql.createConnection({
    host: config.host,
    user: config.username,
    password: config.password,
    database: config.database
});
//We are 'false'.
if (config.use_database === 'true') {
    connection.connect();
}
// Passport session setup.
passport.serializeUser(function (user, done) {
    done(null, user);
});
passport.deserializeUser(function (obj, done) {
    done(null, obj);
});
// Passport.js strategy with Facebook
passport.use(new FacebookStrategy({
        clientID: config.facebook_api_key,
        clientSecret: config.facebook_api_secret,
        callbackURL: config.facebook_callback_url,
        authURL: config.facebook_auth_url,
        logoutURL: config.logout_url
    },
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            //Check whether the user exists or not using profile.id
            return done(null, profile);
        });
    }
));
passport.use(new TwitterStrategy({
        consumerKey: config.twitter_api_key,
        consumerSecret: config.twitter_api_secret,
        callbackURL: config.twitter_callback_url,
        authURL: config.twitter_auth_url,
        logoutURL: config.logout_url
    },
    function (token, tokenSecret, profile, done) {
        process.nextTick(function () {
            //Check whether the user exists or not using profile.id
            return done(null, profile)
        });
    }
));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
//Router code
app.get('/', function (req, res) {
    res.render('index', {user: req.user});
});
app.get('/share', ensureAuthenticated, function(req, res) {
    res.render('share', {user: req.user});
});
//Authenticate Twit
var T = new Twit({
    consumer_key:         config.twitter_api_key,
    consumer_secret:      config.twitter_api_secret,
    access_token:         config.twitter_access_token,
    access_token_secret:  config.twitter_access_secret,
    timeout_ms:           60*100  // optional HTTP request timeout to apply to all requests.
});
//Authenticate FB
FB.setAccessToken(config.facebook_access_token); //DEBUG !!! https://developers.facebook.com/tools/debug/accesstoken/
//Get xhr data
app.post('/share', function (req, res) {
    var status = req.body;
    //Declare Posting Functions
    var postToTwitter = function() {
        T.post('statuses/update', {status: status.shareValue}, function (err, data, response) {
        });
    };
    var postToFacebook = function() {
        FB.api('me/feed', 'post', {message: status.shareValue}, function (res) {
            console.log('Post id: ' + res.id);
        });
    };
    //Start Twitter Only Immediate Sharing Strategy
    if (!!status.twitterChecked && !status.facebookChecked && !status.autoSet) {
        postToTwitter();
    }
    //Start Facebook Only Immediate Sharing Strategy
    else if (!!status.facebookChecked && !status.twitterChecked && !status.autoSet) {
        postToFacebook();
    }
    //Start Twitter & Facebook Immediate Sharing Strategy
    else if (!!status.twitterChecked && !!status.facebookChecked && !status.autoSet) {
        postToTwitter();
        postToFacebook();
    }
    //Start Twitter-only Auto-Scheduling Sharing Strategy
    else if (status.twitterChecked && !status.facebookChecked && status.autoSet) {
        var twitterOnlyJob = new CronJob({
            cronTime: twitterJobs.job,
            onTick: function () {
                postToTwitter();
            },
            start: true,
            timeZone: 'Europe/Belgrade'
        });
        twitterOnlyJob.start();
    }
    //Start Facebook-only Auto-Scheduling Sharing Strategy
    else if (!status.twitterChecked && status.facebookChecked && status.autoSet) {
        var facebookOnlyJob = new CronJob({
            cronTime: facebookJobs.job,
            onTick: function () {
                postToFacebook();
            },
            start: true,
            timeZone: 'Europe/Belgrade'
        });
        facebookOnlyJob.start();
    }
    //Start Twitter and Facebook Auto-Scheduling Sharing Strategy
    else if (status.twitterChecked && status.facebookChecked && status.autoSet) {
        var twitterNotOnlyJob = new CronJob({
            cronTime: twitterJobs.job,
            onTick: function () {
                postToTwitter();
            },
            start: true,
            timeZone: 'Europe/Belgrade'
        });
        twitterNotOnlyJob.start();
        var facebookNotOnlyJob = new CronJob({
            cronTime: facebookJobs.job,
            onTick: function () {
                postToFacebook();
            },
            start: true,
            timeZone: 'Europe/Belgrade'
        });
        facebookNotOnlyJob.start();
    }
});
//End of Sharing Strategies
//Redirect to Account Details
app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', {user: req.user});
});
//Passport Router - Facebook OAuth
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/share',
        failureRedirect: '/'
    }),
    function (req, res) {
        res.redirect('/');
    });
//Passport Router - Twitter OAuth
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
        successRedirect : '/share',
        failureRedirect: '/'
        }),
    function(req, res) {
        res.redirect('/');
    });

//Redirect and logout
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/')
}

// Redirect all 404
app.get('*', function (req, res) {
    res.render('404');
});

app.listen(3000);

module.exports = app;
