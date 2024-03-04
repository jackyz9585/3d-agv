import Router from 'vue-router'
import Vue from 'vue';
Vue.use(Router)

const router = new Router({
  routes: [{
    path:'/',
    redirect:'/layout'
  },{
    path: '/layout',
    name: 'layout',
    component: () => import("@/views/Layout.vue"),
  },
  {
    path: '/setting',
    name: 'setting',
    component: () => import("@/views/Setting"),
  }]
})

export default router
