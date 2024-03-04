/*
 * @Descripttion:输入框指令，支持字节数限制；特殊字符禁止输入；特殊正则验证及回调
 * @version:
 * @Author: dudu
 * @Date: 2020-06-24 14:10:41
 * @LastEditors: guoxx
 * @LastEditTime: 2021-02-09 18:42:36
 */

/**
 * maxLength  Number 限制字节长度
 * specailCharRestrict Boolean 是否限制特殊字符输入，默认true
 * letter    Boolean  是否限制英文字母输入，默认false
 * regExp Regexp 传入正则，失去焦点触发验证
 * errorCb Function 失败回调
 */
import Vue from 'vue';

const SPC_CHAR_REG = '[`~!@#$%^&*()+=<>?{}|·~！￥……（）|《》？【】]'; // 特殊字符
const GBK_BYTE = 3; // 中文字符对应字节
const NOMAL_BYTE = 1; // 其他字符对应字节

Vue.directive('restrict', {
  bind: function (el, binding) {
    const dom = el.querySelector('input') || el.querySelector('textarea');
    const maxByteLength = binding.value.maxLength;
    const specailCharRestrict = binding.value.specailCharRestrict ? binding.value.specailCharRestrict : true;
    const letter = binding.value.letter ? binding.value.letter : false;
    const errorCb = binding.value.errorCb;
    let regExp;
    if (binding.value.regExp instanceof RegExp) {
      regExp = binding.value.regExp;
    }

    if (!dom) return;
    el.dom = dom;
    el.specailCharRestrict = specailCharRestrict;
    el.letter = letter;
    el.regExp = regExp;

    // 根据字节限制可输入长度
    const $$sliceByByte = e => {
      const limitStr = sliceByByte(e.target.value, maxByteLength);
      if (limitStr) {
        let value = e.target.value;
        dom.value = value.slice(0, limitStr.length);
      }
    };

    // 首尾去空格
    const $$trim = e => {
      dom.value = e.target.value.trim();
    };

    // 限制特殊字符的输入
    const $$restrictSpecialChar = e => {
      const reg = new RegExp(SPC_CHAR_REG);
      dom.value = e.target.value.replace(reg, '');
    };

    // 限制英文字母输入
    const $$englishLetter = e => {
      const reg = new RegExp(/[a-zA-Z]+/);
      dom.value = e.target.value.replace(reg, '');
      //  console.log(reg)
    };

    // 正则校验
    const $$regexpTest = e => {
      if (!regExp.test(e.target.value)) {
        dom.value = '';
        errorCb && errorCb();
      }
    };

    el.inputCb = e => {
      //  console.log('限制特殊字符:' + el.specailCharRestrict)
      //  console.log('限制英文字母:' + el.letter)
      $$sliceByByte(e);
      el.specailCharRestrict && $$restrictSpecialChar(e);
      el.letter && $$englishLetter(e);
      dom.dispatchEvent(new Event('input'));
    };

    el.changeCb = e => {
      $$trim(e);
      el.regExp && $$regexpTest(e);
      dom.dispatchEvent(new Event('input'));
    };

    el.dom.addEventListener('keyup', el.inputCb);
    el.dom.addEventListener('paste', el.inputCb);
    el.dom.addEventListener('compositionend', el.inputCb);
    el.dom.addEventListener('change', el.changeCb);
  },
  unbind(el) {
    el.dom.removeEventListener('keyup', el.inputCb);
    el.dom.removeEventListener('paste', el.changeCb);
    el.dom.removeEventListener('compositionend', el.changeCb);

    el.dom.removeEventListener('change', el.changeCb);
  },
});

// 返回截取后的字符串

const sliceByByte = (str, maxByteLength) => {
  let byteLength = 0;
  for (let i = 0, len = str.length; i < len; i++) {
    let charCode = str.charCodeAt(i);
    byteLength += charCode >= 0 && charCode <= 128 ? NOMAL_BYTE : GBK_BYTE;
    if (byteLength > maxByteLength) {
      return str.slice(0, i);
    }
  }
  return null;
};
