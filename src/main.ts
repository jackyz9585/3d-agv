import Vue from "vue";
import App from "./App.vue";
import Element from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./directives/index.js";
import "./assets/css/element.scss"; //自定义element样式
import "./assets/css/public.scss"; //公共样式
import "./assets/font/font.scss"; 
import remConfig from "./utils/remConfig.js";
import router from "./router/index.js";
// 资源预加载
import "@/components/BaseScence/Command/preloadResource";

Vue.config.productionTip = false;
Vue.use(Element);
remConfig();
new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
