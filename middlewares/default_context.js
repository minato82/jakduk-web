'use strict';

var querystring = require('querystring');
var Util = require('../helpers/jakduk_util');
var config = require('../config/environment');
var _ = require('lodash');
var i18n = require('i18n');

module.exports = function () {
  return function defaultContext(req, res, next) {
    req.api.getUserInfo().then(response => {
      if (response.statusCode === 200) {
        req.userInfo = response.data;
      } else if (req.cookies[config.tokenCookieName]) {
        Util.clearSession(res);
      }

      req.isAuthenticated = !!req.userInfo;
      if (req.isAuthenticated) {
        res.locals.isAdmin = req.userInfo.roles.some(role => role === 'ROLE_ROOT');
        req.isAdmin = res.locals.isAdmin;
      }

      _.merge(res.locals, {
        redir: '?redir=' + querystring.escape(req.url),
        layout: 'layout',
        bodyClass: 'header-fixed',
        userInfo: req.userInfo,
        isAuthenticated: req.isAuthenticated,
        meta: {
          twitter: {
            card: 'summary'
          },
          og: {
            description: i18n.__('about.jakduk'),
            url: config.origin + req.path,
            image: config.origin + '/jakduk/img/logo_256.png',
            type: 'website'
          },
          facebook: {
            appId: config.facebook.clientID
          }
        }
      });

      next();
    }).catch(err => next(err));
  };
};
