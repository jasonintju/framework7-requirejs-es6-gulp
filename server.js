'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const proxy = require('express-http-proxy');
const compression = require('compression');
const md5 = require('md5');
const chalk = require('chalk');
let config = require('./config');
const manifest = require('./dist/rev-manifest.json');

// Express 实例
const app = express();

// 是否处于开发环境
const isDevMode = (app.get('env') === 'development') ? true : false;
app.locals.isDevMode = isDevMode;

// 生成环境配置，请参照 config.js
if (!isDevMode) {
  config = require('./config.prod');
}

// 服务端模板采用 ejs
app.set('view engine', 'ejs');

// 模板目录
app.set('views', path.join(__dirname, 'views'));

// 静态资源
app.use(express.static(path.join(__dirname, 'app')));
app.use(express.static(path.join(__dirname, 'dist')));

// 处理 http 请求
app.use(bodyParser.urlencoded({ extended: true }));

// 处理 cookie
app.use(cookieParser());

// 压缩
app.use(compression());

// 请求接口签名
app.use('/api', apiSign);

app.use('/api', proxy(config.api, {
  forwardPath: (req) => {
    return require('url').parse(req.url).path;
  }
}));

// 路由
app.use('*', (req, res) => {
  let sign; // 登录签名
  let appKey; // app key
  let vstockZoneId; // 赛区 ID
  let assetPath = {
    js: manifest['main.js'],
    css: manifest['app.css']
  };

  res.render('index', {
    title: config.title,
    isDevMode: isDevMode,
    assetPath: assetPath,
    backendAddr: config.backendAddr,
    version: require('./package').version
  });
});

const port = config.port || 3000;
app.listen(port, () => {
  console.log('App is running on port %s', port);
});

/**
 * 根据请求参数生成 md5 签名字符串
 *
 * @param req request 请求
 * @param res response 响应
 * @param next
 */
function apiSign(req, res, next) {
  const appSecret = config.apiSecret; // 密钥
  let apiParams = Object.assign({}, {appSecret: appSecret}, req.query);
  let apiParamsKeys = Object.keys(apiParams).sort();
  let apiParamsValues = [];
  let sign;

  for (var i = 0, l = apiParamsKeys.length; i < l; i++) {
    apiParamsValues.push(apiParams[apiParamsKeys[i]]);
  }

  sign = md5(apiParamsValues.join(''));
  req.url += '&sign=' + sign;

  if (isDevMode) {
    console.log(chalk.green(chalk.underline.red('api request:') + ' ' + req.url));
  }

  next();
}
