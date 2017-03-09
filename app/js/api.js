define(['http', 'utils', 'services/user'], function (Http, Utils, User) {

  // API接口调用

  var API = {

    // 获取数据失败标志位
    failed: 'failed',

    // 用于签名校验
    appKey: 'framework7',
    appParams: function () {
      return {
        appKey: this.appKey,
        timestamp: new Date().getTime()
      };
    },

    // 用户登录
    loginen: function (data) {
      data = Utils.extend(data, this.appParams());
      data = Utils.serialize(data);
      return Http.get('api/userCenter/loginen.json?' + data)
        .then(handleSuccess, handleError);
    }

  };

  function handleSuccess(data) {
    f7.hideIndicator();

    return data;
  }

  function handleError(msg) {
    f7.hideIndicator();
    f7.alert(msg);

    return API.failed;
  }

  return API;
});
