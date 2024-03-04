export default function() {
  //以1920为基准设置
  function initPage() {
    let bodyTag = document.getElementsByTagName('body')[0];
    let viewWidth = bodyTag.getBoundingClientRect().width;
    let _html = document.getElementsByTagName('html')[0];
    bodyTag.style.fontSize = '.12rem';
    _html.style.fontSize = (viewWidth / 1920) * 100 + 'px';
  }
  initPage();
  window.onresize = () => {
    initPage();
  };
}
