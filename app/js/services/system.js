define([], function () {

  /* global WebViewJavascriptBridge android */
  function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
    if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
    window.WVJBCallbacks = [callback];
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function() { document.documentElement.removeChild(WVJBIframe); }, 0);
  }

  function closeAPP() {
    if (f7.device.ios) {
      console.log('iOS 原生方法调用');
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('BackFunc', 'hello iOS');
      });
    } else if (f7.device.android) {
      console.log('Android 原生方法调用');
      android.finishStockWeb();
    } else {
      return;
    }
  }

  return {
    closeAPP: closeAPP
  };
});
