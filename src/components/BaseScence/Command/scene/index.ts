import Base from "@BaseScence/Command/base";
import * as THREE from "three";
import sceneAnimation from "./animation";
import userEvent from "./userEvent";
import cameraGuide from "./cameraGuide";
import floatingStar from "./floatingStar";
import fallingStar from "./fallingStar";
import breathingLight from "./breathingLight";
import device from "@BaseScence/Command/device/index";
import area from "@BaseScence/Command/area";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ActiveData } from "./types";

class Scene extends Base {
  dom: HTMLElement | null;
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.PerspectiveCamera | null;
  clickTarget: ActiveData | null;
  currentGroupId: string | null;
  controls: OrbitControls | null;
  width: number;
  height: number;

  constructor() {
    super();
    this.dom = null;
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.clickTarget = null;
    this.currentGroupId = null;
    this.controls = null;
    this.width = 0;
    this.height = 0;
  }
  // 初始化
  init(ele: HTMLElement | string, cameraPosition: number[]) {
    this.dom =
      ele instanceof HTMLElement ? ele : document.querySelector(`#${ele}`);
    if (!this.dom) return;

    // 场景
    const scene: THREE.Scene = new THREE.Scene();
    //点光源
    const point: THREE.PointLight = new THREE.PointLight("#fff");
    point.position.set(400, 300, 100);
    scene.add(point);
    //环境光
    const ambient: THREE.AmbientLight = new THREE.AmbientLight(0x777777);
    // const ambient = new THREE.AmbientLight("#3b3b3b");

    scene.add(ambient);
    // 相机
    this.width = this.dom.clientWidth; //窗口宽度
    this.height = this.dom.clientHeight; //窗口高度

    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      1,
      10000
    );
    // const camera = new THREE.OrthographicCamera( this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, 1000 );
    camera.position.set(...cameraPosition); //设置相机位置
    camera.lookAt(scene.position); //设置相机方向(指向的场景对象)

    // 渲染器
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: this.dom,
    });
    renderer.setSize(this.width, this.height, false); //设置渲染区域尺寸
    // renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
    // window.devicePixelRatio
    renderer.setPixelRatio(1);
    renderer.setClearAlpha(0);

    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;

    // 创建requestAnimationFrame
    sceneAnimation.init({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
    });

    // 初始化事件对象，启动拦截器
    userEvent.init(this.dom);

    if (process.env.NODE_ENV === "development") {
      // // 坐标轴线
      // const axesHelper = new THREE.AxesHelper(400);
      // scene.add(axesHelper);
    }
    this.initResize();
  }

  // 初始化场景
  initView(ele: HTMLElement | string) {
    // [水平顺时针旋转，垂直翻转，距离]
    const cameraPosition = [0, 300, 400];
    // const cameraPosition = [400, 90, 0];

    this.init(ele, cameraPosition);
    // floatingStar.drawFloatingStar({ scene: this.scene });
    // fallingStar.drawFallingStar({ scene: this.scene });
    breathingLight.createBreathingLight({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
      width: this.width,
      height: this.height,
    });

    this.controls = this.addOrbitControls();

    cameraGuide.addGuide({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
      controls: this.controls,
    });
  }
  // 初始化场景   配置功能
  initSetting(ele: HTMLElement | string) {
    const cameraPosition = [0, 477, 0];
    this.init(ele, cameraPosition);
    this.controls = this.addOrbitControls();
    this.controls.enableRotate = false;
    breathingLight.createBreathingLight({
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
      width: this.width,
      height: this.height,
    });
  }
  // 初始化resize
  initResize() {
    // resize只修改了摄像头角度，不再重绘
    window.addEventListener("resize", () => {
      if (!this.dom) return;
      // 重置渲染器输出画布canvas尺寸
      this.width = this.dom.clientWidth;
      this.height = this.dom.clientHeight;
      this.renderer.setSize(this.width, this.height, false); // 如果有后处理对象，重置size
      if (breathingLight.bloomComposer) {
        breathingLight.bloomComposer.setSize(this.width, this.height, false);
      }
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    });
  }
  // 添加缩放旋转控件
  addOrbitControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement); //创建控件对象
    controls.addEventListener("change", () => {
      this.execute.call(this);
    }); //监听鼠标、键盘事件
    controls.minDistance = 120; //最小俯视距离
    controls.maxDistance = 820; //最小俯视距离
    controls.maxPolarAngle = Math.PI * 0.7;
    return controls;
  }

  // 根据事件返回触发的物体
  // 可能为 空场景 地面 设备
  getTargetByEvent(event: PointerEvent): ActiveData {
    const intersects = this.getIntersects(event);
    // 点击了场景
    if (!intersects || !intersects.length) {
      // console.log("未选中 Mesh!");
      return null;
    }
    const deviceIds = intersects
      .filter((item) => item.object.userData.type === "device")
      .map((item) => item.object.userData.id);
    const floorIds = intersects
      .filter((item) => item.object.userData.type === "floor")
      .map((item) => item.object.userData.id);
    const areasIds = intersects
      .filter((item) => item.object.userData.type === "area")
      .map((item) => item.object.userData.id);
    // 点击了设备
    if (deviceIds.length) {
      const deviceId = deviceIds[0];
      const mesh = this.getTargetById(
        this.scene,
        this.currentGroupId,
        deviceId
      );
      return {
        type: "device",
        data: mesh,
        id: deviceId,
      };
    }
    // 点击了区域
    if (areasIds.length) {
      const areasId = areasIds[0];
      const mesh = this.getTargetById(this.scene, this.currentGroupId, areasId);
      const line = this.getTargetById(
        this.scene,
        this.currentGroupId,
        `${areasId}-l`
      );
      return {
        type: "area",
        data: mesh,
        id: areasId,
        lineData: line,
      };
    }
    // 点击了floor
    if (!deviceIds.length && floorIds.length) {
      const floorId = floorIds[0];
      return {
        type: "floor",
        data: this.getTargetById(this.scene, this.currentGroupId, floorId),
        id: floorId,
      };
    }
    return null;
  }
  // 获取与射线相交的对象数组
  getIntersects(event: PointerEvent) {
    const viewDom = this.dom;
    const camera = this.camera;
    const scene = this.scene;
    if (!viewDom) return;

    event.preventDefault();

    // 声明 raycaster 和 mouse 变量
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 通过鼠标点击位置,计算出 raycaster 所需点的位置,以屏幕为中心点,范围 -1 到 1
    mouse.x =
      ((event.clientX - viewDom.offsetLeft) / viewDom.clientWidth) * 2 - 1;
    mouse.y =
      -((event.clientY - viewDom.offsetTop) / viewDom.clientHeight) * 2 + 1;
    //通过鼠标点击的位置(二维坐标)和当前相机的矩阵计算出射线位置
    raycaster.setFromCamera(mouse, camera);

    // 获取与射线相交的对象数组，其中的元素按照距离排序，越近的越靠前
    const intersects = raycaster.intersectObjects(scene.children, true);

    //返回选中的对象
    return intersects;
  }

  // 清除场景中的数据 事件
  clearGroups() {
    breathingLight.clearBreathingLight();
    device.clearDevice();
    area.clearArea();
    userEvent.clearUserEvent();
    // 根据组删除元素
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.name.startsWith("g-")) {
          this.scene.remove(obj);
        }
      });
    }
  }
  //执行渲染，如果当前场景有render动画，则不执行避免重复
  execute() {
    if (sceneAnimation.timeIndex) {
      return;
    }
    this.renderer.render(this.scene, this.camera);
  }
  // 关闭清除场景
  clearScence() {
    this.clearGroups();
    if (this.scene) {
      this.scene.clear();
    }
    if (this.controls) {
      this.controls.dispose();
    }
    this.dom = null;
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.controls = null;
    this.clickTarget = null;
    this.currentGroupId = null;
    sceneAnimation.clearAnimation();
    userEvent.clearUserEventAndInterceptor();
  }
  // 暂停场景动画，供外部调用
  pauseRenderStack() {
    sceneAnimation.pauseRenderStack();
  }
  // 触发停场景动画，供外部调用
  callRenderStack() {
    sceneAnimation.callRenderStack();
  }
}

export default new Scene();
