import Base from "@BaseScence/Command/base";
import * as THREE from "three";
import scene from "@BaseScence/Command/scene/index";
import userEvent from "@BaseScence/Command/scene/userEvent";
import cameraGuide from "@BaseScence/Command/scene/cameraGuide";
import breathingLight from "@BaseScence/Command/scene/breathingLight";
import { ActiveArea } from "./scene/types";
import { FloorData, TextData } from "./types/floor";

const baseColor = "#98ffff";

class Area extends Base {
  activeArea: ActiveArea | null;
  hoverArea: ActiveArea | null;

  constructor() {
    super();
    this.activeArea = null;
    this.hoverArea = null;
  }
  // 绘制文字
  drawAreaByGroup({
    groupId,
    geometryConfig,
  }: {
    groupId: string;
    geometryConfig: FloorData;
  }) {
    const group = this.getGroupByIndex(scene.scene, groupId);
    const texts = geometryConfig.texts;
    texts.forEach((t) => {
      if (t.points && t.points.length) {
        this.drawArea(t, group);
      }
    });
  }
  drawArea(t: TextData, group: THREE.Group) {
    const xMax = Math.max(...t.points.map((p) => p.px));
    const xMin = Math.min(...t.points.map((p) => p.px));
    const zMax = Math.max(...t.points.map((p) => p.pz));
    const zMin = Math.min(...t.points.map((p) => p.pz));
    const center = {
      x: (xMax - xMin) / 2 + xMin,
      z: (zMax - zMin) / 2 + zMin,
    };
    const points = t.points.map((p) => {
      return new THREE.Vector2(p.px, p.pz, 0);
    });
    points.push(new THREE.Vector2(t.points[0].px, t.points[0].pz, 0));

    // 通过顶点定义轮廓
    const shape = new THREE.Shape(points);
    const material = new THREE.MeshLambertMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      color: baseColor,
    });

    // 区域
    const geometry = new THREE.ShapeGeometry(shape, 25);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI * 0.5;
    mesh.position.y = 1;
    mesh.name = t.userData.id;
    mesh.userData = { ...t.userData, center: center };
    group.add(mesh);

    // 发光带
    const pathList: THREE.LineCurve3 = [];

    for (let i = 0, len = t.points.length; i < len; i++) {
      const p1 = t.points[i];
      const p2 = t.points[(i + 1) % len];
      const path = new THREE.LineCurve3(
        new THREE.Vector3(p1.px, p1.pz, 0),
        new THREE.Vector3(p2.px, p2.pz, 0)
      );
      pathList.push(path);
    }
    const CurvePath = new THREE.CurvePath(); // 创建CurvePath对象
    CurvePath.curves.push(...pathList); // 插入多段线条

    const lineGeometry = new THREE.TubeGeometry(CurvePath, 1000, 0.3, 5, true);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: "red",
      transparent: true,
      opacity: 0,
    });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.rotation.x = Math.PI * 0.5;
    line.position.y = 1;
    line.name = `${t.userData.id}-l`; //l表示线
    line.userData = { ...t.userData, center: center };
    group.add(line);
  }
  // 添加点击事件
  addMouseclick() {
    const _this = this;
    userEvent.addUserEvent({
      eventName: "click",
      id: "AreaClick",
      fn: (event) => {
        _this.setActiveMesh.call(_this, event);
      },
    });
  }
  //点击事件 鼠标触发当前物体active
  setActiveMesh(event) {
    const target = scene.getTargetByEvent(event);

    // 根据areaId找到区域中心点

    if (target) {
      switch (target.type) {
        case "area":
          {
            // 点击了自己
            if (this.activeArea && this.activeArea.id === target.id) {
              return;
            }
            if (this.activeArea) {
              // 去除呼吸灯
              const idx = breathingLight.breathingMeshes.findIndex((mesh) => {
                return mesh.name === `${this.activeArea?.data.name}-l`;
              });
              breathingLight.breathingMeshes.splice(idx, 1);
            }
            breathingLight.breathingMeshes.push(target.lineData);
            const area = this.getTargetById(
              scene.scene,
              scene.currentGroupId,
              target.id
            );
            cameraGuide.createCameraAnimation({
              center: area.userData.center,
              scale: !this.activeArea, //已有选中区域，不缩放
            });
            this.activeArea = target;
          }
          break;
        case "floor":
          break;
        default:
          break;
      }
    } else {
      if (this.activeArea) {
        cameraGuide.resetCameraAnimation();
        // 去除呼吸灯
        const idx = breathingLight.breathingMeshes.findIndex((mesh) => {
          return mesh.name === this.activeArea?.data.name;
        });
        breathingLight.breathingMeshes.splice(idx, 1);
        this.activeArea = null;
      }
    }
  }
  // 添加鼠标移动事件
  addMousemove() {
    const _this = this;
    userEvent.addUserEvent({
      eventName: "mousemove",
      id: "AreaMousemove",
      fn: (event) => {
        _this.setHoverMesh.call(_this, event);
      },
    });
  }
  //鼠标移动事件 触发当前物体active
  setHoverMesh(event) {
    const target = scene.getTargetByEvent(event);
    if (!target) return;
    // 当前有激活设备，将其设置为未激活
    if (this.hoverArea) {
      this.hoverArea.data.material.opacity = 0;
      this.hoverArea = null;
    }
    switch (target.type) {
      case "area":
        this.hoverArea = target;
        this.hoverArea.data.material.opacity = 0.1;
        break;
      case "floor":
        break;
      default:
        break;
    }
  }
  clearArea() {
    this.activeArea = null;
    cameraGuide.resetCamera();
  }
}

export default new Area();
