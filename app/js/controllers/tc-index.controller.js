define(['utils', 'api', 'template', 'services/user'], function (Utils, API, template, User) {
  var vstockZoneId = 3;
  var issueDate = [], lastLiquidDate, lastLiquidDateStable, accoutInfo;
  window.theTxRankData = function (data) {
    console.log(data);
    lastLiquidDate = data.issueDate; // 最新清算日期(根据周次的不同是变化的)
    lastLiquidDateStable = lastLiquidDate; // 不变的最新清算日期（选择当前周的issueDate）

    // 获取周的issueDate数组
    var weeks = data.weekDefines;
    for (var i = 0, len = weeks.length; i < len; i++) {
      issueDate.push(weeks[i].endDate);
    }

    // 初始化排行榜
    var dataList = data.list;
    var formatData = {};
    formatData.result = {dataList: dataList};
    template.render('#vsRankTemplate', formatData);

    // 数据更新时间
    $$('.data-update-time').text(data.issueDateStr);

    // 收益率对应的描述文本
    var text = '截止：' + lastLiquidDate;

    $$('.income-describe').text(text);
    var href = 'vs-rank.html?issueDate=' + lastLiquidDate + '&type=TOTAL' + '&describe=' + text + '&vstockZoneId=' + vstockZoneId;
    $$('.js-show-more').find('a').attr('href', href);
    $$('#linkRevenueRank').attr('href', href);

    checkMyFollow('.btn-follow10');

    // 下拉列表显示的周数
    var weekLength = data.currentWeek || 0;
    for (var j = 0; j < weekLength; j++) {
      var index = j + 1, str;
      if (index < weekLength) {
        str = '<li class="week tc-index-week">第' + index + '周</li>';
      } else {
        str = '<li class="week tc-index-week selected">第' + index + '周</li>';
      }
      $$('.js-week-list').append(str);
    }
    $$('.week-item').text('第' + weekLength + '周');

  };

  window.theTxUserTrackRankData = function (data) {
    console.log(data);
    // 初始化排行榜
    var dataList = data.list;
    var formatData = {};
    formatData.result = {dataList: dataList};
    template.render('#vsUserRankTemplate', formatData);
    checkMyFollow('.btn-follow-user10');
  };

  function checkMyFollow(DOM) {
    if (User.isLogin()) {
      var accountIds = '';
      $$(DOM).each(function () {
        accountIds = accountIds + ',' + $$(this).attr('id');
      });
      accountIds = accountIds.substring(1);
      console.info(accountIds);
      if (!accountIds) {
        return;
      }
      API.getAccountTrackStatus({accountIds: accountIds})
        .then(function (data) {
          console.log(data);
          if (data.error_no == 0) {
            data = data.result;
            for (var i = data.length - 1; i >= 0; i--) {
              data[i] = data[i].accountId;
            }
            console.log(accountIds, data);
            for (var j = data.length - 1; j >= 0; j--) {
              var trackedAccountId = 'span[id="' + data[j] + '"]';
              $$(trackedAccountId)
                .css('background', '#817b7b')
                .text('已订阅')
                .parents('.item-inner')
                .find('.item-center')
                .css('color', '#e95757');
            }
          }
        });
    }
  }

  var Controller = {
    init: function () {
      accoutInfo = {
        accountId: User.getCurrent('accountId')
      };
      template.render('#tcToolBarTemplate', accoutInfo);
      displayHeader();
      $$.ajax({
        url: window.backendAddr + '/html/rank/tencentH5Rank/h5Rank_3.txt?callback=?',
        type: 'GET',
        dataType: 'json'
      });
      $$.ajax({
        url: window.backendAddr + '/html/userTrackRank/tencentH5UserTrackRank/h5UserTrackRank_3.txt?callback=？',
        type: 'GET',
        dataType: 'json'
      });
      Utils.unbindEvents(this.bindings);
      Utils.bindEvents(this.bindings);

      swiperinit();

      var taAccountId = User.getCurrent('accountId');
      if (taAccountId) {
        console.log('postMessage');
        try {
          window.parent.postMessage({link: 'http://h5.sm.98084.com/?gopage=taaccount&accountId=' + taAccountId + '&wxShare'}, '*');
        } catch (e) {

        }
      }

      if (getParentUrl() === null || getParentUrl().indexOf('gopage') === -1) {
        //$$('#backToFlag').hide();
      }
    },
    bindings: [
      {
        element: 'body',
        target: '.tc-btn-total-income',
        event: 'click',
        handler: tcShowTotalIncome
      },
      {
        element: 'body',
        target: '.tc-index-login',
        event: 'click',
        handler: tcIndexLoginClick
      },
      {
        element: 'body',
        target: '.tc-btn-week-income',
        event: 'click',
        handler: tcShowWeekIncome
      },
      {
        element: 'body',
        target: '.tc-btn-daily-income',
        event: 'click',
        handler: tcShowDayIncome
      },
      {
        element: 'body',
        target: '.tc-index-week',
        event: 'click',
        handler: tcSelectWeek
      },
      {
        element: 'body',
        target: '.tc-range',
        event: 'click',
        handler: tcShowWeeks
      },
      {
        element: 'body',
        target: '.tc-btn-income',
        event: 'click',
        handler: tcChangeIncomeType
      },
      {
        element: 'body',
        target: '.tc-btn-follow',
        event: 'click',
        handler: tcFollowUser
      },
      {
        element: 'body',
        target: '.goQQGroupBtn',
        event: 'click',
        handler: goQQGroupBtnClick
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

  function tcIndexLoginClick() {
    if (window.location.href.indexOf("chinainvs.trade") != -1) {
      mainView.router.load({
        url: 'login.html',
        animatePages: false
      });
    } else {
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

  function tcShowTotalIncome() {
    sortIncomeRank(lastLiquidDate, 'TOTAL', vstockZoneId);
    $$('.income-describe').text('截止：' + lastLiquidDate);
  }

  function tcShowWeekIncome() {
    sortIncomeRank(lastLiquidDate, 'WEEK', vstockZoneId);
    $$('.income-describe').text('本周累计');
  }

  function tcShowDayIncome() {
    sortIncomeRank(lastLiquidDate, 'DAY', vstockZoneId);
    $$('.income-describe').text(lastLiquidDate);
  }

  function displayHeader() {
    if (User.isLogin()) {
      var accountId = User.getCurrent('accountId');
      var zoneId = User.getCurrent('zoneId');
      var userName = decodeURIComponent(User.getCurrent('userName'));
      console.log(zoneId);
      if (accountId && zoneId === '3') {
        var params = {
          accountId: accountId,
          isCalMarketValue: true,
          isIncludeRevenue: true
        };
        API.queryAccount(params).then(function (data) {
          console.log(data);
          data.result.userName = userName;
          $$('.poster').hide();
          $$('.tc-login-block').hide();
          template.render('#tcMyInfoTemp', data);
          $$('.tc-my-vstock').show();
          $$('.go-my').show();
          $$('.go-tc-register').hide();
        });
      } else {
        var defaultData = {
          result: {
            userName: userName,
            dayRevenueRank: '/',
            weekRevenueRank: '/',
            totalRevenueRank: '/'
          }
        };

        $$('.poster').hide();
        $$('.tc-login-block').hide();
        template.render('#tcMyInfoTemp', defaultData);
        $$('.tc-my-vstock').show();
      }
    }
  }

  function sortIncomeRank(issueDate, type, vstockZoneId) {
    var params = {
      issueDate: issueDate,
      vstockZoneId: vstockZoneId,
      type: type
    };
    API.vsRank(params).then(function (data) {
      console.log('Total Rank: ', data);
      $$('.list-revenue-rank').find('li').remove();
      template.render('#vsRankTemplate', data);
      checkMyFollow('.btn-follow10');
      var describe = $$('.income-describe').text();
      var href = 'vs-rank.html?issueDate=' + issueDate + '&type=' + type + '&describe=' + describe + '&vstockZoneId=' + vstockZoneId;
      $$('.js-show-more').find('a').attr('href', href);
    });
  }

  function tcSelectWeek() {
    var _this = $$(this);
    var selectedWeek = _this.text();
    var index = _this.index() - 1; // 兄弟元素中，第一个是 i 标签
    // console.log('Week index: ', index);

    // 判断点击的是否是当前周，如果是以前周次，改变排行榜传入的参数lastLiquidDate
    var weekLength = issueDate.length;
    if (index !== weekLength - 1) {
      lastLiquidDate = issueDate[index];
    } else {
      lastLiquidDate = lastLiquidDateStable;
    }

    var currentType = $$('.btn-income.on').attr('type');
    // console.log(lastLiquidDate, currentType);
    if (currentType === 'TOTAL') {
      sortIncomeRank(lastLiquidDate, 'TOTAL', vstockZoneId);
      $$('.income-describe').text('截止：' + lastLiquidDate);
    } else if (currentType === 'WEEK') {
      sortIncomeRank(lastLiquidDate, 'WEEK', vstockZoneId);
      $$('.income-describe').text('本周累计');
    } else {
      sortIncomeRank(lastLiquidDate, 'DAY', vstockZoneId);
      $$('.income-describe').text(lastLiquidDate);
    }
    $$('.js-week-list').find('li').removeClass('selected');
    _this.addClass('selected');
    $$('.week-item').text(selectedWeek);
    $$('.js-week-list').addClass('js-hidden').hide();
  }

  function swiperinit() {
    f7.swiper('.swiper-container', {
      speed: 1000,
      autoplay: 3000,
      pagination: '.swiper-pagination'
    });
  }

  function tcShowWeeks(e) {
    var list = $$('.js-week-list');
    if (list.hasClass('js-hidden')) {
      list.show().removeClass('js-hidden');
    } else {
      list.addClass('js-hidden').hide();
    }
    e.stopPropagation();
    $$(document).click(function () {
      $$('.js-week-list').addClass('js-hidden').hide();
    });
  }

  function tcChangeIncomeType() {
    var _this = $$(this);
    $$('.btn-income').removeClass('on');
    _this.addClass('on');
  }

  function tcFollowUser() {
    var _this = $$(this);
    var trackedAccountId = _this.attr('id');
    API.trackUser({trackedAccountId: trackedAccountId}).then(function (data) {
      if (data === API.failed) {
        return;
      }
      var alertTxt;
      if (data.error_no === 0) {
        _this.css('background', '#817b7b')
          .text('已订阅')
          .parents('.item-inner')
          .find('.item-center')
          .css('color', '#e95757');
        alertTxt = '您已订阅了此高手。您可以下载“掌中投”客户端，查看此高手实时操盘数据；也可以点击“进入我的账户”查看此高手持仓。';
        f7.modal({
          title:  '',
          text: alertTxt,
          buttons: [
            {
              text: '确定',
              close: true
            },
            {
              text: '<a class="external" href="http://www.china-invs.cn/web001/wbtg/tencent/mobile/tencent_zzt.html">去下载</a>'
            }
          ]
        })
      }
      if (data.error_no === 20001) {
        console.log(20001);
        showLimitModal();
      }
      if (data.error_no === 20002) {
        console.log(20002);
        alertTxt = '您最多订阅10个高手';
        f7.alert(alertTxt);
      }
    });
  }

  function showLimitModal() {
    f7.modal({
      text: '<div style="text-align: left">非中投客户只能订阅1个高手，中投客户可订阅10个高手。马上开户，看更多高手如何实时操盘。</div>',
      buttons: [
        {
          text: '再逛逛',
          onClick: function () {
            f7.closeModal();
          }
        },
        {
          text: '马上开户',
          onClick: function () {
            //进开户界面
            f7.closeModal();
            window.parent.location.href = 'http://www.china-invs.cn/web001/wbtg/tencent/mobile/tencent_ykh.html';
          }
        }
      ]
    })
  }

  function goQQGroupBtnClick() {
    window.parent.location.href = 'http://chaoguh5.china-invs.cn/?gopage=qqGroupIndex&wxShare';
  }

  return Controller;

});
