define([], function () {

  /* global args */
  var xhrTimeout;
  var timeout = 15000;
  var TIMEOUT_MSG = '连接超时，请稍后重试';

  var core = {

    // Method that performs the ajax request
    ajax: function (method, url, args, data) {

      // Creating a promise
      var promise = new Promise(function (resolve, reject) {

        // Instantiates the XMLHttpRequest
        var xhr = new XMLHttpRequest();
        var uri = url;

        if (args && (method === 'POST' || method === 'PUT')) {
          uri += '?';
          var argcount = 0;
          for (var key in args) {
            if (args.hasOwnProperty(key)) {
              if (argcount++) {
                uri += '&';
              }
              uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
            }
          }
        }

        f7.showIndicator();
        xhr.open(method, uri);
        if( data && (method === 'POST' ) ){
          xhr.send(data);
        }else{
          xhr.send();
        }

        xhr.onabort = function () {
          reject(TIMEOUT_MSG);
          if (xhrTimeout) {clearTimeout(xhrTimeout);}
        };
        xhrTimeout = setTimeout(function () {
          xhr.abort();
        }, timeout);

        xhr.onload = function () {
          if (xhrTimeout) {clearTimeout(xhrTimeout);}
          if (this.status >= 200 && this.status < 300) {
            var res = JSON.parse(this.response);
            if (res.error_no === 0 || res.error_no === 20001 || res.error_no === 20002 || !res.error_no) {
              resolve(res);
            } else {
              reject(res.error_info);
            }
          } else {
            reject(this.statusText);
          }
        };
        xhr.onerror = function () {
          if (xhrTimeout) {clearTimeout(xhrTimeout);}
          reject(this.statusText);
        };
      });

      return promise;
    }
  };

  // Adapter pattern
  return {
    get: function (url) {
      return core.ajax('GET', url);
    },
    post: function (url, args, data) {
      return core.ajax('POST', url, args, data);
    },
    put: function (url, args) {
      return core.ajax('PUT', url, args);
    },
    delete: function (url) {
      return core.ajax('DELETE', url, args);
    }
  };

});
