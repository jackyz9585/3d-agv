import * as THREE from "three";
import Base from "@BaseScence/Command/base";
import resource from "@BaseScence/Command/resource";

import { ObjectModel, DeviceData } from "../types";
import { ImageTexture } from "../../types/resource";

class BoxGeometry extends Base {
  cacheMesh: ObjectModel | null;
  cacheTexture: { [key: string]: ImageTexture };

  // 实例化创建基础mesh
  constructor() {
    super();
    this.cacheMesh = null;
    this.cacheTexture = {}; //纹理池
    this.initBaseMesh();
  }
  //   基础mesh单位1，材质空
  initBaseMesh() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial();
    this.cacheMesh = new THREE.Mesh(geometry, material);
  }
  //   根据参数创建mesh
  async createMesh(data: DeviceData) {
    const materialConf = data.material;
    //基础材质，只包含颜色
    const baseMaterial = new THREE.MeshLambertMaterial({
      color: materialConf.color,
    });
    let material, textureMaterial;
    try {
      let texture: ImageTexture = {};
      const image = "tkc.jpg";
      if (!this.cacheTexture[image]) {
        texture = await resource.loadImage(image) as ImageTexture;
        this.cacheTexture[image] = texture;
      } else {
        texture = this.cacheTexture[image];
      }

      texture.color = materialConf.color;
      textureMaterial = new THREE.MeshLambertMaterial(texture);
    } catch (e) {
      textureMaterial = baseMaterial;
    }
    material = [
      textureMaterial,
      textureMaterial,
      textureMaterial,
      baseMaterial,
      textureMaterial,
      textureMaterial,
    ];
    const mesh = this.cacheMesh.clone();
    mesh.material = material;
    // 包一层，内部旋转，外部缩放平移
    const wrap = new THREE.Object3D();
    wrap.add(mesh);
    this.moveAndScale(wrap, data);
    return wrap;
  }
}

export default new BoxGeometry();
