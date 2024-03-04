import * as THREE from "three";
import Base from "@BaseScence/Command/base";
import resource from "@BaseScence/Command/resource";
import { ObjectModel, DeviceData } from "../types";
import { ImageTexture } from "../../types/resource";

class ComposeGeometry extends Base {
  cacheMeshGroup: ObjectModel | null;
  cacheTexture: { [key: string]: ImageTexture };

  // 实例化创建基础mesh
  constructor() {
    super();
    this.cacheMeshGroup = null;
    this.cacheTexture = {}; //纹理池
    this.initBaseMesh();
  }
  //   基础mesh单位1，材质空
  initBaseMesh() {
    this.cacheMeshGroup = new THREE.Object3D();
    const geometry1 = new THREE.BoxGeometry(0.5, 1, 1);
    const geometry2 = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const geometry3 = new THREE.BoxGeometry(0.25, 0.25, 0.25);

    const material = new THREE.MeshLambertMaterial();
    const mesh1 = new THREE.Mesh(geometry1, material);
    const mesh2 = new THREE.Mesh(geometry2, material);
    const mesh3 = new THREE.Mesh(geometry3, material);

    mesh2.position.x = -0.375;
    mesh2.position.y = -0.25;

    mesh3.position.x = 0.375;
    mesh3.position.y = -0.25;

    this.cacheMeshGroup.add(mesh1);
    this.cacheMeshGroup.add(mesh2);
    this.cacheMeshGroup.add(mesh3);
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
        texture = (await resource.loadImage(image)) as ImageTexture;
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
    const mesh = this.cacheMeshGroup.clone();
    mesh.traverse((obj) => {
      if (obj.type === "Mesh") {
        obj.material = material;
      }
    });
    // 包一层，内部旋转，外部缩放平移
    const wrap = new THREE.Object3D();
    wrap.add(mesh);

    this.moveAndScale(wrap, data);
    return wrap;
  }
}

export default new ComposeGeometry();
