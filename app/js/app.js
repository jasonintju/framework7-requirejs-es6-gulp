define([
  'config',
  'router',
  'template'
], function (Config, Router, Template) {
  'use strict';

  var App = {
    init: function () {

      // Custom DOM library, save it to $$ variable:
      window.$$ = Dom7;

      // Instance of Framework7
      window.f7 = new Framework7(Config);

      // Add views
      window.mainView = f7.addView('#mainView', { dynamicNavbar: true });
    },

    boot: function () {
      Router.init();
    }
  };

  return App;
});
