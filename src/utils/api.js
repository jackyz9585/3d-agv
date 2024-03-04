/** axios封装
 * 请求拦截、相应拦截、错误统一处理
 */
import Vue from "vue";
import axios from "axios";
// 请求超时时间
axios.defaults.timeout = 180000;
// post请求头
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded;charset=UTF-8";
import urlNormalize from "./urlNormalize.js";

// 错误提示防抖处理
const debounce = (fn, time) => {
  let timeout;
  return function (...args) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), time);
  };
};
const handleDebounceErrorMessage = debounce(() => {
  Vue.prototype.$message({
    dangerouslyUseHTMLString: true,
    message: "<p>出错了!</p><p>系统异常！</p>",
    type: "error",
    duration: 3000,
  });
}, 500);
const handleDebounceWarningMessage = debounce((res) => {
  res.data.msg &&
    Vue.prototype.$message({
      type: "warning",
      message: res.data.msg,
    });
}, 500);

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.error(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  (response) => {
    return Promise.resolve(response);
  },
  (error) => {
    // handleDebounceErrorMessage();
  }
);
/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function baseGet(url, params = {}) {
  params = urlNormalize(params);
  return new Promise((resolve, reject) => {
    axios
      .get(url + "?" + params)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function basePost(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .post(url, params)
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
