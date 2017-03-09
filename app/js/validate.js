define([], function () {

  var Validator = {

    /**
     * 判断手机号码格式是否合法
     */
    isMobile: function (str) {
      return /^[1][34578]\d{9}$/.test(str);
    },

    /**
     * 判断字符串中是否都是数字
     */
    isDigital: function (str) {
      return /^\d+$/.test(str);
    },

    /**
     * 判断非法密码
     */
    isPassword: function (str) {
      return /^(?![^a-zA-Z]+$)(?!\D+$).{8,15}$/.test(str);
    }
  };

  return Validator;
});
