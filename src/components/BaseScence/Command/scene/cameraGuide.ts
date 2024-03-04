import * as THREE from "three";
import sceneAnimation from "./animation";

class CameraGuide {
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  guideObject: THREE.Object3D | null;
  controls: THREE.OrbitControls | null;
  initFov: number;
  scaleFov: number;

  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.guideObject = null;
    this.controls = null;
    this.initFov = 45;
    this.scaleFov = 25;
  }
  // 动画测试函数
  test() {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: "red" });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "Guide";

    this.scene.add(mesh);
    let pos = 0;
    const animation = () => {
      console.log(this.camera.position);

      pos += 0.02;
      mesh.position.x = 160 * Math.sin(pos);

      this.camera.position.x = mesh.position.x;
      // 重置控制器
      this.camera.lookAt(mesh.position);
      this.camera.updateProjectionMatrix();
      this.controls.target.set(
        mesh.position.x,
        mesh.position.y,
        mesh.position.z
      );
      this.controls.update();
    };
    sceneAnimation.addAnimation("Camera2", animation);
  }
  addGuide({
    renderer,
    scene,
    camera,
    controls,
  }: {
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: THREE.OrbitControls;
  }) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;

    const geometry = new THREE.Object3D();
    geometry.name = "Guide";
    this.guideObject = geometry;
    this.scene.add(geometry);
  }
  moveCamera(posValues: number[], scaleValues: number[]) {
    this.controls.enabled = false;
    const times = [0, 10];
    const posTrack = new THREE.KeyframeTrack(
      "Guide.position",
      times,
      posValues
    );
    const scaleTrack = new THREE.KeyframeTrack(
      "Guide.scale",
      times,
      scaleValues
    );
    const duration = 10;
    const clip = new THREE.AnimationClip("default", duration, [
      posTrack,
      scaleTrack,
    ]);
    const mixer = new THREE.AnimationMixer(this.scene);

    const AnimationAction = mixer.clipAction(clip);
    AnimationAction.clampWhenFinished = true;

    AnimationAction.timeScale = 20;
    AnimationAction.loop = THREE.LoopOnce;
    AnimationAction.play();
    const clock = new THREE.Clock();
    // 记录上一帧位置
    let lastX = posValues[0];
    let lastZ = posValues[2];

    const animation = () => {
      const position = this.guideObject.position;

      mixer.update(clock.getDelta());

      // 当前帧位置
      const updateX = position.x;
      const updateZ = position.z;

      const gapX = updateX - lastX;
      const gapZ = updateZ - lastZ;

      lastX = updateX;
      lastZ = updateZ;

      // 将相机位置进行差量偏移（摄像角度保持不变，避免镜头乱转）
      this.camera.position.x += gapX;
      this.camera.position.z += gapZ;

      this.camera.fov = this.guideObject.scale.x * 100;
      this.camera.lookAt(position);
      this.camera.updateProjectionMatrix();
      // 重置控制器
      this.controls.target.set(position.x, position.y, position.z);
      this.controls.update();
    };

    sceneAnimation.addAnimation("Camera", animation);
    setTimeout(() => {
      this.controls.enabled = true;
      sceneAnimation.removeAnimation("Camera");
    }, (duration / AnimationAction.timeScale) * 1000);
  }
  resetCameraAnimation() {
    const { x: lastx, z: lastz } = this.guideObject.position;
    const posValues = [lastx, 0, lastz, 0, 0, 0];
    const scaleValues = [
      this.scaleFov * 0.01,
      0.1,
      0.1,
      this.initFov * 0.01,
      0.1,
      0.1,
    ];
    this.moveCamera(posValues, scaleValues);
  }
  createCameraAnimation({ center, scale }) {
    const { x, z } = center;
    // 如果本身有activeArea 不处理缩放
    const { x: lastx, z: lastz } = this.guideObject.position;
    const posValues = [lastx, 0, lastz, x, 0, z];
    let scaleValues;
    if (scale) {
      scaleValues = [
        this.initFov * 0.01,
        0.1,
        0.1,
        this.scaleFov * 0.01,
        0.1,
        0.1,
      ];
    } else {
      // 已经放大了，比例不变
      scaleValues = [
        this.scaleFov * 0.01,
        0.1,
        0.1,
        this.scaleFov * 0.01,
        0.1,
        0.1,
      ];
    }
    this.moveCamera(posValues, scaleValues);
  }
  resetCamera() {
    if (this.camera) {
      this.camera.fov = this.initFov;
      this.camera.updateProjectionMatrix();
    }
  }
}

export default new CameraGuide();
