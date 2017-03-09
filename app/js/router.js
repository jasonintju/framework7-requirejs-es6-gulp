define([
  'api',
  'utils',
  'services/user',
  'services/system'
], function (API, Utils, User, System) {

  var Router = {
    init: function () {
      f7.onPageInit('*', function (page) {
        load(page.name, page.query);
      });

      $$(document).on('navbarBeforeInit', function (e) {
        var navbar = e.detail.navbar;
        var page = e.detail.page;

        // 动态改变导航
        if (page.query && page.query.internal) {
          $$(navbar.innerContainer).find('.hidden').removeClass('hidden');
          $$(navbar.innerContainer).find('.center').css('left', '-26.5px');
          f7.hideToolbar('.toolbar');
        }
      });

      // 应用启动跳转
      bootApp();

      Utils.bindEvents([{
        element: 'body',
        event: 'click',
        target: '#closeAPP',
        handler: System.closeAPP
      }, {
        element: 'body',
        event: 'click',
        target: '.authentication',
        handler: authentication
      }]);
    }
  };

  function authentication(e) {
    e.stopPropagation();
    e.preventDefault();

    if (User.isLogin()) {
      mainView.router.load({
        url: this.href,
        animatePages: false
      });
    } else {
      if(window.location.href.indexOf("chinainvs.trade")!=-1){
        mainView.router.load({
          url: 'login.html',
          animatePages: false
        });
      }else{
        if (!window.iframe) {
          mainView.router.load({
            url: 'login.html',
            animatePages: false
          });
        } else {
          window.parent.location.replace(window.iframeUrl + '/login');
        }
      }
    }
  }

  /**
   * Load (or reload) controller from js code (another controller) - call it's init function
   * @param  controllerName
   * @param  query
   */
  function load(name, query) {
    if (!name || name.indexOf('smart-select') !== -1) {
      return;
    }

    require(['controllers/' + name + '.controller'], function (controller) {
      controller.init(query);
    });
  }

  function bootApp() {
    var firstPage = 'tc-index.html';

    mainView.router.load ({
      url: firstPage,
      animatePages: false
    });
  }

  function getQueryValue(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) {
      return unescape(r[2]);
    }
    // 从父窗口读取参数
    var parentUrl = getParentUrl();
    if (parentUrl && parentUrl.indexOf('\?') !== -1) {
      var str = parentUrl.split('?')[1];
      r = str.match(reg);
      if (r !== null) {
        return unescape(r[2]);
      }
    }
    return null;
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

  return Router;
});
