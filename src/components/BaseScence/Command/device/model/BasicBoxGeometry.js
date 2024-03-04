import * as THREE from "three";
import Base from "@BaseScence/Command/base";

class BoxGeometry extends Base {
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
  async createMesh(data) {
    const materialConf = data.material;
    //基础材质，只包含颜色
    const baseMaterial = new THREE.MeshLambertMaterial({
      color: materialConf.color,
      transparent: true,
      opacity: 0.8,
    });

    const mesh = this.cacheMesh.clone();
    mesh.material = baseMaterial;
    // 包一层，内部旋转，外部缩放平移
    const wrap = new THREE.Object3D();
    wrap.add(mesh);
    this.moveAndScale(wrap, data);
    return wrap;
  }
}

export default new BoxGeometry();
