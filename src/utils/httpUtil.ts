/**
 * @description http请求工具类(使用axios)
 *  https://www.npmjs.com/package/axios#request-config
 * @author sl
 * @date 2020/3/09 下午15:36
 */
import axios from 'axios'
import qs from 'querystring'
import FormData from 'form-data'
import https from 'https'

/**
 * 请求参数处理
 * @param  {Object} opts 请求参数
 * @return {Object}      处理后的请求参数
 */
function handleParams(opts) {
  if (!opts) {
    throw new Error('请求参数不正确')
  }
  if (!opts.method) {
    throw new Error('请求方式不正确')
  }
  opts.method = opts.method.toUpperCase()
  if (
    !['GET', 'POST', 'DELETE', 'PATCH', 'PUT', 'HEAD', 'OPTIONS'].includes(
      opts.method,
    )
  ) {
    throw new Error('请求方式不正确')
  }
  if (!opts.url) {
    throw new Error('请求路径不能为空')
  }
  // query 参数处理
  if (opts.query) {
    const query = qs.stringify(opts.query)
    opts.url =
      opts.url.indexOf('?') === -1
        ? `${opts.url}?${query}`
        : `${opts.url}&${query}`
  }
  // queryStr 参数处理
  if (opts.queryStr) {
    opts.url =
      opts.url.indexOf('?') === -1
        ? `${opts.url}?${opts.queryStr}`
        : `${opts.url}&${opts.queryStr}`
  }
  // params参数处理
  if (opts.params) {
    Object.keys(opts.params).forEach((key) => {
      opts.url = opts.url.replace(`:${key}`, opts.params[key])
    })
  }
  return opts
}

export class HttpUtil {
  /**
   * http请求通用方法 调用方法
   * get请求实例
   * HttpUtil.send({
   *    method: 'GET'
   *    url: 'http://api.tokenclub.com/v1/users,
   *    query: {
   *      uid: 10423
   *    }
   * })
   * HttpUtil.send({
   *    method: 'GET'
   *    url: 'http://api.tokenclub.com/v1/users,
   *    queryStr:'uid=10423'
   * })
   *
   * 代理服务器设置proxy选项
   * HttpUtil.send({
   *    method: 'GET'
   *    url: 'http://api.tokenclub.com/v1/users,
   *    queryStr:'uid=10423',
   *    proxy: {
   *      host: '127.0.0.1',
   *      port: 9000,
   *      auth: {
   *        username: 'jack',
   *        password: 'jack6Zb'
   *      }
   *    }
   * })
   *
   * post请求实例
   * 路径中有参数的请求, params中的key必须和路径总保持一致
   * HttpUtil.send({
   *    method: 'POST'
   *    url: 'http://api.tokenclub.com/v1/user/:userId,
   *    params: {
   *      userId: 10423
   *    }
   * })
   *
   * post data
   * HttpUtil.send({
   *    method: 'POST'
   *    url: 'http://api.tokenclub.com/v1/sms/send,
   *    data: {
   *      uid: 10423,
   *      type: 1
   *    }
   * })
   * 或
   * HttpUtil.send({
   *    method: 'POST'
   *    url: 'http://api.tokenclub.com/v1/user,
   *    data: 'uid=10423&type=1'
   * })
   *
   * post body
   * HttpUtil.send({
   *    method: 'POST'
   *    url: 'http://api.tokenclub.com/v1/sms/send,
   *    body: {
   *      uid: 10423,
   *      type: 1
   *    }
   * })
   * 或
   * HttpUtil.send({
   *    method: 'POST'
   *    url: 'http://api.tokenclub.com/v1/user,
   *    body: 'uid=10423&type=1'
   * })
   *
   * post form
   * HttpUtil.send({
   *    method: 'POST'
   *    url: 'http://api.tokenclub.com/v1/sms/send,
   *    form: {
   *      uid: 10423,
   *      type: 1
   *    }
   * })
   * 或
   * HttpUtil.send({
   *    method: 'POST'
   *    url: 'http://api.tokenclub.com/v1/user,
   *    form: 'uid=10423&type=1'
   * })
   *
   * post qs
   * HttpUtil.send({
   *    method: 'POST'
   *    url: 'http://api.tokenclub.com/v1/sms/send,
   *    qs: {
   *      uid: 10423,
   *      type: 1
   *    }
   * })
   * 或
   * HttpUtil.send({
   *    method: 'POST'
   *    url: 'http://api.tokenclub.com/v1/user,
   *    qs: 'uid=10423&type=1'
   * })
   *
   * post 文件上传
   * const fs = require('fs');
   * const FormData = require('form-data'); // 建议使用form-data模块
   * let formData = new FormData();
   * formData.append('my_field', 'my value');
   * formData.append('my_buffer', Buffer.from([1, 2, 3]));
   * formData.append('my_file', fs.createReadStream(__dirname + '/test.jpg'));
   * HttpUtil.send({
   *    headers: formData.getHeaders(),     // 必须要带上formData的headers
   *    method: 'POST',
   *    url: 'http://api.tokenclub.com/v1/upload,
   *    data: formData
   * })
   * 或
   * HttpUtil.send({
   *    headers: formData.getHeaders(),
   *    method: 'POST',
   *    url: 'http://api.tokenclub.com/v1/upload,
   *    formData: formData
   * })
   * 备注：接收文件相应服务端示例
   * const koaBody = require('koa-body');   // 需要使用koa-body的中间件
   * app.use(koaBody({multipart: true, formidable: { maxFileSize: 200 * 1024 * 1024 }})); // 设置上传文件大小最大限制，默认2M
   * const file = ctx.request.files.my_file;// 获取上传文件
   * @param opts url必选，剩余参数可选
   * @-- {String}  opts.method 请求方法
   * @-- {String}  opts.url 请求url
   * @-- {String}  opts.baseUrl baseUrl
   * @-- {Object}  opts.headers 请求头
   * @-- {Object}  opts.encoding 返回客户端的编码
   * @-- {Object}  opts.timeout  响应过期时间
   * @-- {Object}  opts.proxy    代理服务器
   * @-- {String}  opts.proxy.host    代理服务器地址
   * @-- {Number}  opts.proxy.port    代理服务器端口号
   * @-- {Object}  opts.proxy.auth    代理服务器HTTP Basic auth
   * @-- {String}  opts.proxy.auth.username    代理服务器HTTP Basic auth 用户名
   * @-- {String}  opts.proxy.auth.password    代理服务器HTTP Basic auth 密码
   * @-- {Boolean} opts.json     true:parses the response body as JSON
   * @-- {Object}  opts.query    请求数据,query中的参数
   * @-- {Object}  opts.queryStr 请求数据,queryStr中的参数
   * @-- {Object}  opts.form  请求数据,form表单提交
   * @-- {Object}  opts.body  请求数据,body中的参数
   * @-- {Object}  opts.qs    qs请求参数
   * @-- {Object}  opts.data  推荐使用data字段发送请求数据,data内容可以为form、body、qs其中任意一种,也可以是formData
   * @returns {*}
   */
  static async send(opts) {
    opts = handleParams(opts)
    const sendOpts: any = {
      // `method` is the request method to be used when making the request
      method: opts.method, // default get
      // `url` is the server URL that will be used for the request
      url: opts.url,
      // `timeout` specifies the number of milliseconds before the request times out.
      // If the request takes longer than `timeout`, the request will be aborted.
      timeout: opts.timeout || 60000, // default is `0` (no timeout)
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    }
    // 基础URL
    // `baseURL` will be prepended to `url` unless `url` is absolute.
    // It can be convenient to set `baseURL` for an instance of axios to pass relative URLs
    // to methods of that instance.
    if (opts.baseURL) sendOpts.baseURL = opts.baseURL
    // 返回信息编码格式 默认值utf8
    if (opts.responseEncoding) sendOpts.responseEncoding = opts.responseEncoding
    // 设置header  `headers` are custom headers to be sent
    if (opts.headers) sendOpts.headers = opts.headers
    // 设置代理
    if (opts.proxy) sendOpts.proxy = opts.proxy
    // 返回格式，默认值json
    // `responseType` indicates the type of data that the server will respond with
    // options are: 'arraybuffer', 'document', 'json', 'text', 'stream'
    //   browser only: 'blob'
    if (opts.responseType) sendOpts.responseType = opts.responseType
    // string, plain object, URLSearchParams Stream, Buffer
    if (opts.data) sendOpts.data = opts.data
    if (opts.body) sendOpts.data = opts.body // new logic not use this
    if (opts.form) {
      sendOpts.data = new FormData()
      Object.keys(opts.form).forEach((key) =>
        sendOpts.data.append(key, opts.form[key]),
      )
      Object.assign(sendOpts.headers, sendOpts.data.getHeaders())
    }
    if (opts.auth) sendOpts.auth = opts.auth
    try {
      const res = await axios(sendOpts)
      return {
        response: {
          statusCode: res.status,
          statusMessage: res.statusText,
          headers: res.headers,
          request: res.request,
        },
        body: res.data,
      }
    } catch (err: any) {
      if (!err || !err.response) {
        err = err || { code: -1, errno: 'Unknown', message: 'Unknown' }
        return {
          response: {
            statusCode: -1,
            statusMessage: `${err.code}-${err.errno || 'Unknown'}-${
              err.message
            }`,
          },
          body: {
            code: err.code,
            errno: err.errno,
            message: err.message,
          },
        }
      }
      return {
        response: {
          statusCode: err.response.status,
          statusMessage: err.response.statusText,
          headers: err.response.headers,
          request: err.response.request,
        },
        body: err.response.data,
      }
    }
  }
}
