define([], function () {

  // var Storage = window.localStorage;

  var User = {
    save: function (accountInfo) {
      // Storage.setItem('accountId', accountInfo.accountId);
      // Storage.setItem('mobile', accountInfo.mobile);
      // Storage.setItem('userName', accountInfo.userName);
      if (accountInfo.accountId) {
        createCookie('accountId', accountInfo.accountId, 7);
      }
      if (accountInfo.zoneId) {
        createCookie('zoneId', accountInfo.zoneId, 7);
      }
      createCookie('userId', accountInfo.userId, 7);
      createCookie('mobile', accountInfo.mobile, 7);
      createCookie('userName', encodeURIComponent(accountInfo.userName), 7);
      createCookie('isLogin', accountInfo.isLogin, 7);
    },
    getCurrent: function (key) {
      // return Storage.getItem(key) || null;
      return readCookie(key);
    },
    remove: function () {
      // Storage.removeItem('accountId');
      // Storage.removeItem('mobile');
      // Storage.removeItem('userName');
      eraseCookie('accountId');
      eraseCookie('mobile');
      eraseCookie('userName');
      eraseCookie('isLogin');
      eraseCookie('zoneId');
      eraseCookie('userId');
      eraseCookie('openId');
      eraseCookie('nickname');
    },
    isLogin: function () {
      if (readCookie('isLogin')) {
        return true;
      }

      return false;
    }
  };

  // Cookies routines taken from http://www.w3schools.com/js/js_cookies.asp
  /* eslint-disable */
  function createCookie(name,value,days) {
    var expires;
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      expires = ";expires="+date.toGMTString();
    }
    else {
      expires = "";
    }
    document.cookie = name+"="+value+expires+";path=/";
  }

  function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }

  function eraseCookie(name) {
    createCookie(name,"",-1);
  }
  /* eslint-enable */

  return User;
});
