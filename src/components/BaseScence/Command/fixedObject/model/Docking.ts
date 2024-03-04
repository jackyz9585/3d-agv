import * as THREE from "three";
import Base from "@BaseScence/Command/base";
import { ObjectModel, fixedData } from "../types";
import dockingMark from "@Command/fixedObject/dockingMark/index";

/**
 * 接驳位实现类
 */
class Docking extends Base{
  cacheMesh: ObjectModel | null;
  animations: THREE.AnimationClip[];
  constructor(){
    super();
    this.cacheMesh = null;
    this.initBaseMesh()
  }
  initBaseMesh(){
    const rect = new THREE.BoxGeometry(15, 1, 15);
    const material = new THREE.MeshBasicMaterial();
    this.cacheMesh = new THREE.Mesh(rect, material);
  }


  async createMesh(data: fixedData){
    
    const meshGroup = new THREE.Group()
    meshGroup.name = 'docking'
    const mark = dockingMark.createDockingMark(data);

    meshGroup.add(mark)
    // if(!this.cacheMesh){
    
    // }
    const material = new THREE.MeshBasicMaterial({ color: 0x2FD861 })
    const mesh: ObjectModel = this.cacheMesh.clone();
    mesh.material = material
    meshGroup.add(mesh)
    const rotate = data.rotate;
    mesh.rotation.y = rotate;
    // 缩放
    const scale = data.userData.scale;
    const { x, y, z } = scale;
    mesh.scale.set(x, y, z);
    // 坐标
    const { px, py, pz } = data.pos;
    mesh.position.x = px
    mesh.position.y = py
    mesh.position.z = pz
    mesh.name = data.userData.id;
    mesh.userData = data.userData
    mark.position.set(px, py + 10, pz);
    return meshGroup
  }
}

export default new Docking();