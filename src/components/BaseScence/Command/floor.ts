import Base from "@BaseScence/Command/base";
import resource from "@BaseScence/Command/resource";
import * as THREE from "three";
import scene from "@BaseScence/Command/scene/index";
import breathingLight from "@BaseScence/Command/scene/breathingLight";
import { ImageTexture } from "./types/resource";
import { FloorData } from "./types/floor";

class Floor extends Base {
  plantHeight: number;
  plantWidth: number;

  constructor() {
    super();
    this.plantHeight = 500;
    this.plantWidth = 320;
  }
  // 绘制顶部贴图立方体 地面
  //存在异步，该方法不支持链式调用
  async drawFloorsByGroup({
    groupId,
    geometryConfig,
  }: {
    groupId: string;
    geometryConfig: FloorData;
  }) {
    this.plantHeight = geometryConfig.size.x;
    this.plantWidth = geometryConfig.size.z;


    // 根据楼层创建组
    const group = new THREE.Group();
    group.name = `g-${groupId}`;
    // 记录当前激活的组
    scene.currentGroupId = groupId;
    scene.scene.add(group);

    try {
      const image = geometryConfig.material.image;
      const materialConfs: ImageTexture = await resource.loadImage(image);
      const { x, y, z } = geometryConfig.size;
      const { px, py, pz } = geometryConfig.pos;
      const materialConf = geometryConfig.material;

      const geometry = new THREE.BoxGeometry(x, y, z);

      geometry.translate(px, py, pz);
      // 顶面材质
      // const materialTop = new THREE.MeshStandardMaterial( { color: 0x808080, roughness: 0, metalness: 0 } );
      const materialTop = new THREE.MeshStandardMaterial({
        ...materialConfs,
        roughness: 0.8,
        metalness: 0,
      });
      // 其他面材质
      // 清除image配置项
      const _materialConf = { color: materialConf.color };
      const material = new THREE.MeshLambertMaterial(_materialConf);
      const mats = [
        material,
        material,
        materialTop,
        material,
        material,
        material,
      ];

      const mesh = new THREE.Mesh(geometry, mats);
      mesh.userData = geometryConfig.userData;
      group.add(mesh);
      // 绘制墙
      this.addWall(group)
      // // 绘制物体
      // this.addGoods(group)
      // 绘制发光带
      this.drawLine(geometryConfig, group);
    } catch (e) { }
  }
  // 发光带
  drawLine(geometryConfig: FloorData, group: THREE.Group) {
    const { x, z } = geometryConfig.size;

    const p1 = new THREE.Vector3(x / 2, 0, z / 2); //底部开始节点
    const p2 = new THREE.Vector3(x / 2, 0, -z / 2); //底部开始节点
    const p3 = new THREE.Vector3(-x / 2, 0, -z / 2); //底部开始节点
    const p4 = new THREE.Vector3(-x / 2, 0, z / 2); //底部开始节点

    // 画线cene.
    const line1 = new THREE.LineCurve3(p1, p2);
    const line2 = new THREE.LineCurve3(p2, p3);
    const line3 = new THREE.LineCurve3(p3, p4);
    const line4 = new THREE.LineCurve3(p4, p1);

    const curvePath = new THREE.CurvePath();
    curvePath.curves.push(line1, line2, line3, line4);
    const material = new THREE.MeshLambertMaterial({
      transparent: true,
      opacity: 0.2,
      color: "#00FFFF",
    });
    const geometry = new THREE.TubeGeometry(curvePath, 1000, 0.3, 10, false); //0.5为粗细

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    breathingLight.breathingMeshes.push(mesh);
  }
  // 墙壁
  async addWall(group: THREE.Group) {
    const groupId = group.name.split("-")[1];
    try {
      const model: THREE.Scene = await resource.loadModel(`wall-${groupId}.glb`);
      
      const mesh = model.scene;
      const material = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        color: "#026bb5",
      });
      mesh.children.forEach((m) => {
        m.material = material;
      });
      mesh.scale.set(500, 500, 500);
      if(groupId === 'EE'){
        mesh.scale.set(25,25,25)
      }
      group.add(mesh);
    } catch (e) { }

  }
  // // 物体
  // async addGoods(group: THREE.Group) {
  //   try {
  //     const groupId = group.name.split("-")[1];
  //     const model: THREE.Scene = await resource.loadModel(`goods-${groupId}.glb`);
  //     const mesh = model.scene;
  //     mesh.scale.set(500, 500, 500);
  //     group.add(mesh);
  //   } catch (e) { }
  // }
}

export default new Floor();
