import * as THREE from "three";
import sceneAnimation from "./animation";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
// import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
// import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
// import { CopyShader } from "three/examples/jsm/shaders/CopyShader";
import { BreathingLightModel } from "./types";

class BreathingLight {
  renderer: THREE.WebGLRenderer | null;
  bloomComposer: EffectComposer | null;
  breathingMeshes: BreathingLightModel[] = [];

  constructor() {
    this.renderer = null;
    this.bloomComposer = null;
    //呼吸灯
    this.breathingMeshes = [];
  }
  createBreathingLight({
    renderer,
    scene,
    camera,
    width,
    height,
  }: {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    width: number;
    height: number;
  }) {
    // RenderPass这个通道会渲染场景，但不会将渲染结果输出到屏幕上
    const renderScene = new RenderPass(scene, camera);

    const outlinePass = new OutlinePass(
      new THREE.Vector2(width, height),
      scene,
      camera,
      this.breathingMeshes
    );
    outlinePass.renderToScreen = false;
    outlinePass.edgeStrength = 2; //粗
    outlinePass.edgeGlow = 2; //发光
    outlinePass.edgeThickness = 3; //光晕粗
    outlinePass.pulsePeriod = 4; //闪烁
    outlinePass.usePatternTexture = false; //是否使用贴图
    outlinePass.visibleEdgeColor.set("#00FFFF"); // 设置显示的颜色
    outlinePass.hiddenEdgeColor.set("#00FFFF"); // 设置隐藏的颜色

    //创建效果组合器对象，可以在该对象上添加后期处理通道，通过配置该对象，使它可以渲染我们的场景，并应用额外的后期处理步骤，在render循环中，使用EffectComposer渲染场景、应用通道，并输出结果。
    const bloomComposer = new EffectComposer(renderer);
    this.bloomComposer = bloomComposer;
    bloomComposer.setSize(width, height);
    bloomComposer.addPass(renderScene);
    // 眩光通道bloomPass插入到composer
    bloomComposer.addPass(outlinePass);

    // 添加到render栈
    const animation = () => {
      bloomComposer.render();
    };

    sceneAnimation.addAnimation("BreathingLight", animation);
  }
  // breathingMeshes内容清掉，引用保持不变
  clearBreathingLight() {
    for (let i = 0, len = this.breathingMeshes.length; i < len; i++) {
      this.breathingMeshes.pop();
    }
  }
}

export default new BreathingLight();
