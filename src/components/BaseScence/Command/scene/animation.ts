import TWEEN from "tween.js";
import * as THREE from "three";
import { animationFn } from "../types/animation";

class SceneAnimation {
  renderStackScence: animationFn[];
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  timeIndex: number | null;

  constructor() {
    this.renderStackScence = [];
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.timeIndex = null;
  }
  init({
    renderer,
    scene,
    camera,
  }: {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
  }) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
  }
  // 动画函数栈
  callRenderStack() {
    TWEEN.update();
    // 注意 需要先触发render
    this.renderer.render(this.scene, this.camera);
    this.renderStackScence.forEach((cb: animationFn) => {
      cb();
    });
    this.timeIndex = requestAnimationFrame(this.callRenderStack.bind(this));
  }
  // 加入动画
  addAnimation(id, fn) {
    fn.id = id;
    this.renderStackScence.push(fn);
  }
  // 删除动画
  removeAnimation(id: string) {
    const idx = this.renderStackScence.findIndex(
      (f: animationFn) => f.id === id
    );
    if (idx > -1) {
      this.renderStackScence.splice(idx, 1);
    } else {
      console.warn(`动画队列中不存在函数：${id}`);
    }
  }
  pauseRenderStack() {
    if (this.timeIndex) {
      window.cancelAnimationFrame(this.timeIndex);
      this.timeIndex = null;
    }
  }
  //   清除全场景动画
  clearAnimation() {
    //保证重置
    this.renderStackScence = [];
    if (this.timeIndex) {
      window.cancelAnimationFrame(this.timeIndex);
    }
    TWEEN.removeAll();
  }
}

export default new SceneAnimation();
