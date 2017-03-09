define(['utils', 'api', 'template', 'services/user'], function (Utils, API, template, User) {
  var vstockZoneId = 2;
  var issueDate = [], lastLiquidDate, lastLiquidDateStable, accoutInfo,
      issueDateFinal = [], lastLiquidDateFinal, lastLiquidDateStableFinal ;

  window.theRankData = function (data) {
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

    // 收益率对应的描述文本
    var text = '截止：' + lastLiquidDate;

    $$('.income-describe-first').text(text);
    var href = 'vs-rank.html?issueDate=' + lastLiquidDate + '&type=TOTAL' + '&describe=' + text + '&vstockZoneId=' + vstockZoneId;
    $$('.js-show-more').find('a').attr('href', href);

    // 下拉列表显示的周数
    var weekLength = data.currentWeek || 0;
    for (var j = 0; j < weekLength; j++) {
      var index = j + 1, str;
      if (index < weekLength) {
        str = '<li class="week index-week">第' + index + '周</li>';
      } else {
        str = '<li class="week index-week selected">第' + index + '周</li>';
      }
      $$('.js-week-list').append(str);
    }
    $$('.week-item').text('第' + weekLength + '周');
  };

  window.theSimuFinalRankData = function (data) {
    console.log(data);
    lastLiquidDateFinal = data.issueDate; // 最新清算日期(根据周次的不同是变化的)
    lastLiquidDateStableFinal = lastLiquidDateFinal; // 不变的最新清算日期（选择当前周的issueDate）

    // 获取周的issueDate数组
    var weeks = data.weekDefines;
    for (var i = 0, len = weeks.length; i < len; i++) {
      issueDateFinal.push(weeks[i].endDate);
    }

    // 初始化排行榜
    var dataList = data.list || [];
    var formatData = {};
    formatData.result = {dataList: dataList};
    template.render('#vsFinalRankTemplate', formatData);

    // 收益率对应的描述文本
    var text = '截止：' + lastLiquidDateFinal;

    $$('.income-describe-final').text(text);
    var href = 'vs-rank.html?issueDate=' + lastLiquidDateFinal + '&type=TOTAL' + '&describe=' + text + '&vstockZoneId=1000002';
    $$('.js-show-more-final').find('a').attr('href', href);

    checkMyFollow('.btn-follow10');

    // 下拉列表显示的周数
    var weekLength = data.currentWeek || 0;
    for (var j = 0; j < weekLength; j++) {
      var index = j + 1, str;
      if (index < weekLength) {
        str = '<li class="week index-week-final">第' + index + '周</li>';
      } else {
        str = '<li class="week index-week-final selected">第' + index + '周</li>';
      }
      $$('.js-week-list-final').append(str);
    }
    $$('.week-item-final').text('第' + weekLength + '周');
  };

  window.theUserTrackRankData = function (data) {
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
              .find('.link-detail')
              .css('color', '#e95757');
          }

        });
    }
  }

  var Controller = {
    init: function () {
      accoutInfo = {
        accountId: User.getCurrent('accountId')
      };
      template.render('#myToolBarTemplate', accoutInfo);
      displayHeader();
      $$.ajax({
        url: window.backendAddr + '/html/rank/simuH5Rank/h5Rank_2.txt?callback=?',
        type: 'GET',
        dataType: 'json'
      });
      $$.ajax({
        url: window.backendAddr + '/html/rank/simuFinalH5Rank/h5Rank_1000002.txt?callback=?',
        type: 'GET',
        dataType: 'json'
      });
      $$.ajax({
        url: window.backendAddr + '/html/userTrackRank/simuH5UserTrackRank/h5UserTrackRank_2.txt?callback=?',
        type: 'GET',
        dataType: 'json'
      });
      // initRank();
      // getNoticeList();
      Utils.unbindEvents(this.bindings);
      Utils.bindEvents(this.bindings);

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
        target: '.btn-total-income',
        event: 'click',
        handler: showTotalIncome
      },
      {
        element: 'body',
        target: '.btn-total-income-final',
        event: 'click',
        handler: showTotalIncomeFinal
      },
      {
        element: 'body',
        target: '.btn-week-income',
        event: 'click',
        handler: showWeekIncome
      },
      {
        element: 'body',
        target: '.btn-week-income-final',
        event: 'click',
        handler: showWeekIncomeFinal
      },
      {
        element: 'body',
        target: '.btn-daily-income',
        event: 'click',
        handler: showDayIncome
      },
      {
        element: 'body',
        target: '.btn-daily-income-final',
        event: 'click',
        handler: showDayIncomeFinal
      },
      {
        element: 'body',
        target: '.sm-range',
        event: 'click',
        handler: showWeeks
      },
      {
        element: 'body',
        target: '.sm-range-final',
        event: 'click',
        handler: showWeeksFinal
      },
      {
        element: 'body',
        target: '.index-week',
        event: 'click',
        handler: selectWeek
      },
      {
        element: 'body',
        target: '.index-week-final',
        event: 'click',
        handler: selectWeekFinal
      },
      {
        element: 'body',
        target: '.sm-btn-income',
        event: 'click',
        handler: changeIncomeType
      },
      {
        element: 'body',
        target: '.sm-btn-follow',
        event: 'click',
        handler: followUser
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

  function showTotalIncome() {
    sortIncomeRank(lastLiquidDate, 'TOTAL');
    $$('.income-describe-first').text('截止：' + lastLiquidDate);
  }

  function showWeekIncome() {
    sortIncomeRank(lastLiquidDate, 'WEEK');
    $$('.income-describe-first').text('本周累计');
  }

  function showDayIncome() {
    sortIncomeRank(lastLiquidDate, 'DAY');
    $$('.income-describe-first').text(lastLiquidDate);
  }

  function showTotalIncomeFinal() {
    sortIncomeRank(lastLiquidDateFinal, 'TOTAL', 'final');
    $$('.income-describe-final').text('截止：' + lastLiquidDateFinal);
  }

  function showWeekIncomeFinal() {
    sortIncomeRank(lastLiquidDateFinal, 'WEEK', 'final');
    $$('.income-describe-final').text('本周累计');
  }

  function showDayIncomeFinal() {
    sortIncomeRank(lastLiquidDateFinal, 'DAY', 'final');
    $$('.income-describe-final').text(lastLiquidDateFinal);
  }

  function displayHeader() {
    // $$('.registered-num').text('--');
    if (User.isLogin()) {
      var accountId = User.getCurrent('accountId');
      var zoneId = User.getCurrent('zoneId');
      if (accountId && zoneId === '2') {
        // var registerNum; // 参赛人数
        // API.getRegisterNum({vstockZoneId: vstockZoneId}).then(function(data) {
        //   registerNum = data.count;
        //   $$('.registered-num').text(registerNum);
        // });
        var params = {
          accountId: accountId,
          isCalMarketValue: true,
          isIncludeRevenue: true
        };
        API.queryAccount(params).then(function (data) {
          console.log(data);
          $$('.poster').hide();
          template.render('#vsMyInfoTemp', data);
          $$('.my-vstock').show();
        });
      } else {
        var defaultData = {
          result: {
            totalRevenueRank: '--',
            totalAsset: '--',
            cysAmount: '--',
            totalRevenueRate: '--'
          }
        };

        $$('.poster').hide();
        template.render('#vsMyInfoTemp', defaultData);
        $$('.total-num').text('--');
        $$('.balance-num').text('--');
        $$('.my-vstock').show();
      }
    }
  }

  function sortIncomeRank(issueDate, type, step) {
    var params = {
      issueDate: issueDate,
      vstockZoneId: vstockZoneId,
      type: type,
      step: step
    };
    if (step) {
      params.vstockZoneId = 1000002;
      API.vsRank(params).then(function (data) {
        $$('.list-revenue-rank-js').find('li').remove();
        template.render('#vsFinalRankTemplate', data);
        checkMyFollow('.btn-follow10');
        var describe = $$('.income-describe-final').text();
        var href = 'vs-rank.html?issueDate=' + issueDate + '&type=' + type + '&describe=' + describe + '&vstockZoneId=' + params.vstockZoneId;
        $$('.js-show-more-final').find('a').attr('href', href);
      });
    } else {
      API.vsRank(params).then(function (data) {
        // console.log('Total Rank: ', data);
        $$('.list-revenue-rank').find('li').remove();
        template.render('#vsRankTemplate', data);
        checkMyFollow('.btn-follow10');
        var describe = $$('.income-describe').text();
        var href = 'vs-rank.html?issueDate=' + issueDate + '&type=' + type + '&describe=' + describe + '&vstockZoneId=' + vstockZoneId;
        $$('.js-show-more').find('a').attr('href', href);
      });
    }
  }

  function showWeeks(e) {
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

  function showWeeksFinal(e) {
    var list = $$('.js-week-list-final');
    var isBegin = $$('.week-item-final').text() != '第0周';
    if (list.hasClass('js-hidden') && isBegin) {
      list.show().removeClass('js-hidden');
    } else {
      list.addClass('js-hidden').hide();
    }
    e.stopPropagation();
    $$(document).click(function () {
      $$('.js-week-list-final').addClass('js-hidden').hide();
    });
  }

  function selectWeek() {
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

    var currentType = $$('.btn-income-first.on').attr('type');
    // console.log(lastLiquidDate, currentType);
    if (currentType === 'TOTAL') {
      sortIncomeRank(lastLiquidDate, 'TOTAL');
      $$('.income-describe-first').text('截止：' + lastLiquidDate);
    } else if (currentType === 'WEEK') {
      sortIncomeRank(lastLiquidDate, 'WEEK');
      $$('.income-describe-first').text('本周累计');
    } else {
      sortIncomeRank(lastLiquidDate, 'DAY');
      $$('.income-describe-first').text(lastLiquidDate);
    }
    $$('.js-week-list').find('li').removeClass('selected');
    _this.addClass('selected');
    $$('.week-item').text(selectedWeek);
    $$('.js-week-list').addClass('js-hidden').hide();
  }

  function selectWeekFinal() {
    var _this = $$(this);
    var selectedWeek = _this.text();
    var index = _this.index() - 1; // 兄弟元素中，第一个是 i 标签
    // console.log('Week index: ', index);

    // 判断点击的是否是当前周，如果是以前周次，改变排行榜传入的参数lastLiquidDate
    var weekLength = issueDateFinal.length;
    if (index !== weekLength - 1) {
      lastLiquidDateFinal = issueDateFinal[index];
    } else {
      lastLiquidDateFinal = lastLiquidDateStableFinal;
    }

    var currentType = $$('.btn-income-final.on').attr('type');
    // console.log(lastLiquidDate, currentType);
    if (currentType === 'TOTAL') {
      sortIncomeRank(lastLiquidDateFinal, 'TOTAL', 'final');
      $$('.income-describe-final').text('截止：' + lastLiquidDateFinal);
    } else if (currentType === 'WEEK') {
      sortIncomeRank(lastLiquidDateFinal, 'WEEK', 'final');
      $$('.income-describe-final').text('本周累计');
    } else {
      sortIncomeRank(lastLiquidDateFinal, 'DAY', 'final');
      $$('.income-describe-final').text(lastLiquidDateFinal);
    }
    $$('.js-week-list-final').find('li').removeClass('selected');
    _this.addClass('selected');
    $$('.week-item-final').text(selectedWeek);
    $$('.js-week-list-final').addClass('js-hidden').hide();
  }

  function changeIncomeType() {
    var _this = $$(this);
    _this.addClass('on').siblings().removeClass('on');
  }

  function followUser() {
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

  function swiperinit() {
    f7.swiper('.swiper-container', {
      speed: 1000,
      autoplay: 3000,
      pagination: '.swiper-pagination'
    });
  }

  return Controller;

});
