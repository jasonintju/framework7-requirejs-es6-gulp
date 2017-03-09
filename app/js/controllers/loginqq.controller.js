define([
  'utils',
  'validate',
  'api',
  'services/user'
], function (Utils, Validate, API, User) {

  var Controller = {
    init: function (query) {
      var type = 3; // qqLogin接口的区分：1-pc登录；2-pc注册；3-h5登录；4-h5注册
      if (query.isRegister || location.href.indexOf('qqLoginRegister') != -1) {
        $$('.other-way').hide();
        $$('.iframe-auto-login').hide();
        $$('.register').hide();
        type = 4;
      }
      $$('.register').click(function() {
        $$('.other-way').hide();
        $$('.iframe-auto-login').hide();
        $$('.register').hide();
        type = 4;
      });

      var openId = getQueryValue('openId') || User.getCurrent('openId');
      if (openId) {
        $$('.page-content').text('正在跳转中').css('padding-top','50px');
        createCookie('openId', openId, 7);
        API.qqLogin({openId: openId, type: type}).then(function(data) {
          if (data === API.failed) {
            createCookie('openId',"",-1);
            return;
          }
          if (data.error_no == 20002) {
            if (type == 4) {
              setTimeout(function(){
                mainView.router.load({
                  url: 'register.html',
                  animatePages: false
                });
              },1000)
              return;
            } else {
              createCookie('openId',"",-1);
              f7.modal({
                text: data.error_info,
                buttons: [
                  {
                    text: '确定',
                    onClick: function () {
                      mainView.router.load({
                        url: 'login.html',
                        animatePages: false
                      });
                    }
                  }
                ]
              })
            }
          }
          if (data.error_no == 0) {
            User.save({
              accountId: data.accountId,
              mobile: data.mobile,
              userName: data.userName,
              isLogin: true,
              zoneId: data.zoneId,
              userId: data.userId
            });
            autoLogin(data);
          }
        });
      }
      $$('#qqLoginBtn').click(function() {
        if (openId) { return; }
        if (!openId) {
          if (type == 4) {
            location.href = 'https://graph.qq.com/oauth2.0/authorize?client_id=101373659&display=mobile&response_type=code&redirect_uri=' + window.redirect_uri + '&state=' + window.state + '/qqLoginRegister' + '&scope=get_user_info';
          } else {
            location.href = 'https://graph.qq.com/oauth2.0/authorize?client_id=101373659&display=mobile&response_type=code&redirect_uri=' + window.redirect_uri + '&state=' + window.state + '/qqLogin' + '&scope=get_user_info';
          }
        }
      })
    }
  };


  function autoLogin(data) {
    // 处理自动登录逻辑
    $$('#singlelogin').attr('src','http://chaoguh5.china-invs.cn?gopage=singlelogin&wxShare&token=' + data.token);

    var timesRun = 0;
    var interval = setInterval(function(){
      timesRun += 1;
      if(timesRun === 5){
        clearInterval(interval);

        if(window.location.href.indexOf("chinainvs.trade")!=-1){
          if(window.location.href.indexOf('gopage')!=-1){
            var rnd = new Date().getTime();
            window.location.href=window.location.href + "&rnd=" + rnd;
          }else{
            if (data.zoneId === '2') {
              mainView.router.load({
                url: 'vs-index.html',
                animatePages: false
              });
            } else {
              mainView.router.load({
                url: 'tc-index.html',
                animatePages: false
              });
            }
          }
        }else{
          if (!window.iframe) {
            if (data.zoneId === '2') {
              mainView.router.load({
                url: 'vs-index.html',
                animatePages: false
              });
            } else {
              mainView.router.load({
                url: 'tc-index.html',
                animatePages: false
              });
            }
          } else {
            window.location.href='http://finance.qq.com/nrh/tx_H5.htm';
          }
        }

        return;
      }
      window.addEventListener('message', function(ev){
        if (ev.data == 'autoLoginSuceess') {
          clearInterval(interval);

          if(window.location.href.indexOf("chinainvs.trade")!=-1){
            if(window.location.href.indexOf('gopage')!=-1){
              var rnd = new Date().getTime();
              window.location.href=window.location.href + "&rnd=" + rnd;
            }else{
              if (data.zoneId === '2') {
                mainView.router.load({
                  url: 'vs-index.html',
                  animatePages: false
                });
              } else {
                mainView.router.load({
                  url: 'tc-index.html',
                  animatePages: false
                });
              }
            }
          }else{
            if (!window.iframe) {
              if (data.zoneId === '2') {
                mainView.router.load({
                  url: 'vs-index.html',
                  animatePages: false
                });
              } else {
                mainView.router.load({
                  url: 'tc-index.html',
                  animatePages: false
                });
              }
            } else {
              window.location.href='http://finance.qq.com/nrh/tx_H5.htm';
            }
          }

          return;
        }
      }, false);
    }, 200);
  }

  function getQueryValue(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)return unescape(r[2]);
    return null;
  }

  function createCookie(name,value,days) {
    var expires;
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      expires = "; expires="+date.toGMTString();
    }
    else {
      expires = "";
    }
    document.cookie = name+"="+value+expires+"; path=/";
  }

  return Controller;
});
