import * as THREE from "three";
import Base from "@BaseScence/Command/base";
import resource from "@BaseScence/Command/resource";
import { ObjectModel, fixedData } from "../types";
import { ImageTexture } from "../../types/resource";
import sceneAnimation from "@BaseScence/Command/scene/animation";

class Door extends Base {
  cacheMesh: ObjectModel | null;
  cacheTexture: { [key: string]: ImageTexture };
  scale: number;
  animations: THREE.AnimationClip[];


  // 实例化创建基础mesh
  constructor() {
    super();
    this.cacheMesh = null;
    this.cacheTexture = {};
    this.initBaseMesh();
  }
  initBaseMesh() { }
  //   根据参数创建mesh
  async createMesh(data: fixedData) {

    if (!this.cacheMesh) {
      const gltf: THREE.Scene = await resource.loadModel("door.glb");
      this.cacheMesh = gltf.scene;
      this.animations = gltf.animations
    }
    const meshGroup: ObjectModel = this.cacheMesh.clone();

    // 缩放 位置 角度
    const rotate = data.rotate;
    meshGroup.rotation.y = rotate;

    const { px, py, pz } = data.pos;
    const scale = data.userData.scale;
    const { x, y, z } = scale;
    meshGroup.scale.set(x, y, z);
    
    meshGroup.position.x = px;
    meshGroup.position.y = py;
    meshGroup.position.z = pz;

    meshGroup.name = data.userData.id;
    meshGroup.userData = data.userData
    // 调整材质
    const material = new THREE.MeshLambertMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
      color: "#01ffff",
    });
    meshGroup.children.forEach((m) => {
      m.material = material;
    });

    // 初始化关闭
    this.callAnimation(meshGroup, {
      type: 'Close',
      duration: 0
    })

    return meshGroup;
  }
  // 执行动画
  callAnimation(mesh, { type, duration }) {
    const mixer = new THREE.AnimationMixer(mesh);
    const animations = this.animations.filter(clip => clip.name.includes(type));

    animations.forEach(clip => {
      const action = mixer.clipAction(clip);
      action.setLoop(THREE.LoopOnce); // 设置动画播放一次
      action.clampWhenFinished = true; // 动画播放结束后保持最后一帧状态
      action.setDuration(duration);
      action.play();
    });
    sceneAnimation.addAnimation("door", () => {
      mixer.update(0.01);
    });
  }
}

export default new Door();
