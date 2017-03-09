define([
  'template',
  'utils',
  'api',
  'services/user'
], function (Template, Utils, API, User) {

  var Controller = {
    init: function () {

      var accountInfo = {
        accountId: User.getCurrent('accountId'),
        mobile: User.getCurrent('mobile'),
        userName: decodeURIComponent(User.getCurrent('userName'))
      };
      Template.render('#myToolBarTemplate', accountInfo);
      Utils.unbindEvents(this.bindings);
      Utils.bindEvents(Controller.bindings);
      Template.render('#versionTemplate', {version: '1.0.0'});
      if (!accountInfo.accountId) {
        Template.render('#myTemplate', Utils.extend({}, {result: {totalAsset: 0}}, accountInfo));
        Template.render('#myToolBarTemplate', accountInfo);
        $$('.hideElement').hide();
        return;
      }
      API.queryAccount({isCalMarketValue: true, isIncludeRevenue: false})
        .then(function(data) {
          accountInfo.mobile = accountInfo.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
          console.log( Utils.extend({}, data, accountInfo));
          Template.render('#myTemplate', Utils.extend({}, data, accountInfo));
          if(data.result.avatar){
            $$("#myAvatar").attr('src',data.result.avatar);
          }
        });

      if (getParentUrl() === null || getParentUrl().indexOf('gopage') === -1) {
        //$$('#backToFlag').hide();
      }

    },
    bindings: [
      {
        element: '#logout',
        event: 'click',
        handler: logout
      },
      {
        element: 'body',
        target: '#backToFlag',
        event: 'click',
        handler: backToFlagClick
      }
    ]
  };

  function backToFlagClick() {
    window.parent.location.href = 'http://chaoguh5.china-invs.cn/';
  }

  function getParentUrl() {
    var url = null;
    if (parent !== window) {
      try {
        url = parent.location.href;
        if (url) {

        } else {
          url = document.referrer;
        }
      } catch (e) {
        url = document.referrer;
      }
    }
    return url;
  }

  function logout() {
    API.logout()
      .then(function() {
        User.remove();
        mainView.router.load({
          url: 'login.html',
          animatePages: false
        });
      });
  }

  return Controller;
});
