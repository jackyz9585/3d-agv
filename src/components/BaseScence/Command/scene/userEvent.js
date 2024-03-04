class UserEvent {
  constructor() {
    this.dom = null;
    this.stack = []; //维护注册事件
    this.interceptors = []; //拦截器
    // this.beforeX = 0;
    // this.beforeY = 0;
    // this.afterX = 0;
    // this.afterY = 0;
  }
  init(dom) {
    this.dom = dom;
    this.addClickInterceptor();
  }

  // 添加拦截器
  addInterceptor(id, fn) {
    fn.id = id;
    this.interceptors.push(fn);
  }
  // 移除拦截器
  removeInterceptor(id) {
    const idx = this.interceptors.findIndex((f) => f.id === id);
    if (idx > -1) {
      this.interceptors.splice(idx, 1);
    } else {
      console.warn(`拦截器队列中不存在函数：${id}`);
    }
  }
  // 加入事件
  addUserEvent(eventName, id, fn) {
    const callBackFn = (event) => {
      // 调用拦截器
      Promise.all(
        this.interceptors.map((f) => {
          fn.id = id;
          fn.eventName = eventName;
          return f(fn);
        })
      )
        .then(() => {
          fn(event);
        })
        .catch((error) => {
          console.warn(error);
        });
    };
    callBackFn.id = id;
    callBackFn.eventName = eventName;
    this.dom.addEventListener(eventName, callBackFn);
    this.stack.push(callBackFn);
  }

  // 删除事件
  removeUserEvent(eventName, id) {
    const idx = this.stack.findIndex(
      (f) => f.id === id && f.eventName === eventName
    );
    if (idx > -1) {
      this.dom.removeEventListener(eventName, this.stack[idx]);
      this.stack.splice(idx, 1);
      // console.log("删除事件", id);
    } else {
      console.warn(`${eventName}事件队列中不存在函数：${id}`);
    }
  }
  //   清除事件（切换楼层）
  clearUserEvent() {
    let i = 0;
    while (this.stack.length) {
      const f = this.stack[i];
      this.removeUserEvent(f.eventName, f.id);
    }
  }
  // 清除事件及拦截器（退出场景）
  clearUserEventAndInterceptor() {
    this.clearUserEvent();
    this.removeClickInterceptor();
  }

  // 点击事件拦截器 存在偏移则认为是拖拽事件，阻止点击
  addClickInterceptor() {
    this.addUserEvent("mousedown", "SceneMouseDown", (e) => {
      [this.beforeX, this.beforeY] = [e.offsetX, e.offsetY];
    });
    this.addUserEvent("mouseup", "SceneMouseUp", (e) => {
      [this.afterX, this.afterY] = [e.offsetX, e.offsetY];
    });

    const clickInterceptor = (fn) => {
      const { eventName } = fn;
      if (eventName !== "click") {
        return Promise.resolve();
      }
      if (this.beforeX === this.afterX && this.beforeY === this.afterY) {
        return Promise.resolve();
      }
      return Promise.reject("拖拽事件，阻止click");
    };
    this.addInterceptor("clickInterceptor", clickInterceptor);
  }
  // 删除点击事件拦截器
  removeClickInterceptor() {
    this.removeUserEvent("mousedown", "SceneMouseDown");
    this.removeUserEvent("mouseup", "SceneMouseUp");
    this.removeInterceptor("clickInterceptor");
  }
}

export default new UserEvent();
