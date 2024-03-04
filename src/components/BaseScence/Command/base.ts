import { XAdaptor, YAdaptor } from "@BaseScence/dataAdaptor";

export default class Base {
  constructor() {}

  // 在场景中查找楼层组，（查找一层）
  getGroupByIndex(scene, groupId) {
    if (!scene) {
      console.warn("scene is undefined");
      return null;
    }
    return scene.children.find((item) => item.name === `g-${groupId}`);
  }
  // 在楼层组查找指定的 device、floor、area ，（查找一层）
  getTargetById(scene, currentGroupId, id) {
    const currentGroup = this.getGroupByIndex(scene, currentGroupId);
    if (currentGroup && currentGroup.children) {
      return (currentGroup.children || []).find(
        (meshOrGroup) => meshOrGroup.name === id
      );
    }
    return null;
  }
  // 根据组获取物体集合
  getTargetsByGroup(scene, currentGroupId) {
    const currentGroup = this.getGroupByIndex(scene, currentGroupId);
    if (currentGroup && currentGroup.children) {
      return currentGroup.children;
    }
    return [];
  }
  // 重置坐标并将基础物体缩放 平移到指定位置(通用) 给物体附上数据
  moveAndScale(wrap, data) {
    const meshGroup = wrap.children[0];
    if (!meshGroup) {
      console.error("模型缺少外层Object3D");
      return;
    }
    // 内部控制旋转
    const rotate = data.rotate;
    meshGroup.rotation.y = rotate;
    // 外部控制缩放平移

    const { x, y, z } = data.size;
    const { px, py, pz } = data.pos;
    const scale = data.userData.scale;
    wrap.scale.set(x * scale, y * scale, z * scale);
    wrap.position.x = px;
    wrap.position.y = py;
    wrap.position.z = pz;
    // 递归赋值，便于批量查找
    wrap.traverse((obj) => {
      obj.name = data.userData.id;
      obj.userData = { ...obj.userData, ...data.userData };
    });
  }
  // 角度转弧度
  anlgeToRadian(angle) {
    return (angle * Math.PI) / 180;
  }
  // 将用户配置xy转为webgl坐标系的xz
  viewTo3dPositionAdaptor({ plantWidth, plantHeight, x, y }) {
    return {
      x: YAdaptor(y, plantHeight),
      z: XAdaptor(x, plantWidth),
    };
  }
}
