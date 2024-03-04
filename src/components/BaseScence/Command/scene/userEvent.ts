import { UserEventFn, InterceptorFn } from "./types";

class UserEvent {
  dom: HTMLElement | null;
  stack: Array<UserEventFn>;
  interceptors: Array<InterceptorFn>;
  beforeX: number;
  beforeY: number;
  afterX: number;
  afterY: number;

  constructor() {
    this.dom = null;
    this.stack = []; //维护注册事件
    this.interceptors = []; //拦截器
    this.beforeX = 0;
    this.beforeY = 0;
    this.afterX = 0;
    this.afterY = 0;
  }
  init(dom: HTMLElement) {
    this.dom = dom;
    this.clearUserEvent();
    this.addClickInterceptor();
  }

  // 加入事件
  addUserEvent(userEventFn: UserEventFn) {
    if (!this.dom) {
      return;
    }
    //避免重复添加
    const idx = this.stack.findIndex(
      (f: UserEventFn) => f.id === userEventFn.id
    );
    if (idx > -1) {
      return;
    }

    // 点击事件特殊处理
    if (userEventFn.eventName === "click") {
      const clickUserEventFn = {
        eventName: "click",
        id: userEventFn.id,
        fn: (event) => {
          if (this.beforeX === this.afterX && this.beforeY === this.afterY) {
            userEventFn.fn(event);
          } else {
            // console.log("拖拽事件，阻止click");
          }
        },
      };
      this.dom.addEventListener(userEventFn.eventName, clickUserEventFn.fn);
      this.stack.push(clickUserEventFn);
    } else {
      this.dom.addEventListener(userEventFn.eventName, userEventFn.fn);
      this.stack.push(userEventFn);
    }
  }
  // 删除事件
  removeUserEvent(eventName: string, id: string) {
    if (!this.dom) {
      return;
    }
    const idx = this.stack.findIndex(
      (f: UserEventFn) => f.id === id && f.eventName === eventName
    );
    if (idx > -1) {
      this.dom.removeEventListener(eventName, this.stack[idx].fn);
      this.stack.splice(idx, 1);
    } else {
      console.warn(`${eventName}事件队列中不存在函数：${id}`);
    }
  }
  //   清除事件（切换楼层）
  clearUserEvent() {
    let i = 0;
    while (this.stack.length) {
      const userEventFn = this.stack[i];
      this.removeUserEvent(userEventFn.eventName, userEventFn.id);
    }
  }
  // 清除事件及拦截器（退出场景）
  clearUserEventAndInterceptor() {
    this.clearUserEvent();
  }

  // 添加鼠标事件，用于区分拖拽和点击
  addClickInterceptor() {
    this.addUserEvent({
      eventName: "mousedown",
      id: "SceneMouseDown",
      fn: (e) => {
        [this.beforeX, this.beforeY] = [e.offsetX, e.offsetY];
      },
    });
    this.addUserEvent({
      eventName: "mouseup",
      id: "SceneMouseUp",
      fn: (e) => {
        [this.afterX, this.afterY] = [e.offsetX, e.offsetY];
      },
    });
  }
}

export default new UserEvent();
