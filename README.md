# Twitter and Facebook Post Autoscheduler

Node & Express based application that comes with two strategies: **Immediate Share** and **Autoschedule Share**.

## Overview

Twitter & Facebook Post Autoscheduler comes with two main screens:

* Login form (Facebook and Twitter OAuth)
* Sharing screen (with two strategies: immediate share and autoscheduler)

Application is based on Express. Authentication strategies are taken from Passport (http://passportjs.org/):

* passport-twitter (https://github.com/jaredhanson/passport-twitter)
* passport-facebook (https://github.com/jaredhanson/passport-facebook)

Sharing bot is taken from:

* Twit (https://github.com/ttezel/twit)
* FB (https://www.npmjs.com/package/fb)

Autoscheduling is maintained by node-cron (https://github.com/kelektiv/node-cron)

Templating language used: Embedded Javascript (http://www.embeddedjs.com/)

Added client-side validation.

## Getting Started

Simply start `npm install`. 

After installing dependencies generate `api_keys` and `access_tokens` for OAuth (**Twitter** and **Facebook**).

Setup `twitterJobs.js` and `facebookJobs.js`.

Type `node app` to start the application and navigate to `localhost:3000`.
