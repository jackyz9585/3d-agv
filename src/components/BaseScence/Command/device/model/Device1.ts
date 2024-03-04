import * as THREE from "three";
import Base from "@BaseScence/Command/base";
import resource from "@BaseScence/Command/resource";
import { ObjectModel, DeviceData } from "../types";
import { ImageTexture } from "../../types/resource";

class Device1 extends Base {
  cacheMesh: ObjectModel | null;
  cacheTexture: { [key: string]: ImageTexture };
  scale: number;

  // 实例化创建基础mesh
  constructor() {
    super();
    this.cacheMesh = null;
    this.cacheTexture = {};
    this.scale = 10; //模型需要的缩放比例
    this.initBaseMesh();
  }
  initBaseMesh() {}
  //   根据参数创建mesh
  async createMesh(data: DeviceData) {
    const materialConf = data.material;
    if (!this.cacheMesh) {
      const model: THREE.Scene = await resource.loadModel("Device1.glb");
      this.cacheMesh = model.scene;
    }
    const meshGroup: ObjectModel = this.cacheMesh.clone();
    // 根据模型数据结构处理材质
    const material = new THREE.MeshLambertMaterial({
      color: materialConf.color,
    });

    let textureMaterial: THREE.MeshLambertMaterial;
    try {
      let texture: ImageTexture = {};
      const image = "tkc.jpg";
      if (!this.cacheTexture[image]) {
        texture = (await resource.loadImage(image)) as ImageTexture;
        this.cacheTexture[image] = texture;
      } else {
        texture = this.cacheTexture[image];
      }

      texture.color = materialConf.color;
      textureMaterial = new THREE.MeshLambertMaterial(texture);
    } catch (e) {
      textureMaterial = material;
    }
    meshGroup.traverse((obj) => {
      if (obj.type === "Mesh") {
        switch (obj.name) {
          case "立方体002":
            obj.material = material;
            obj.material = textureMaterial;
            break;
          case "立方体003":
            obj.userData.isFixedMaterial = true;
            break;
          default:
            obj.userData.isFixedMaterial = true;
            break;
        }
      }
    });
    data.userData.scale = this.scale;
    // 包一层，内部旋转，外部缩放平移
    const wrap = new THREE.Object3D();
    wrap.add(meshGroup);
    this.moveAndScale(wrap, data);

    return wrap;
  }
}

export default new Device1();
