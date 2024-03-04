import Base from "@BaseScence/Command/base";
import scene from "@BaseScence/Command/scene/index";

import model from "./model";
import dynamicObject from "../dynamicObject";

import { fixedData, ObjectModel } from "./types";

class Device extends Base {
  constructor() {
    super();
  }
  // 绘制立方体  设备（异步）
  async drawDevicesByGroup({
    groupId,
    geometries,
  }: {
    groupId: string;
    geometries: fixedData[];
  }) {
    let i = 0,
      len = geometries.length;
    for (; i < len; i++) {
      const data: fixedData = geometries[i];
      const meshType = data.userData.model;
      // 调用对应的模型方法，生成mesh
      const instance = model[meshType];
      if (!instance) {
        console.error(`不存在该模型${meshType}`);
        continue;
      }
      const mesh: ObjectModel = await instance.createMesh(data);

      const group = scene.getGroupByIndex(scene.scene, groupId);
      group && group.add(mesh);
    }
  }

  // 门开关
  callDoorAnimation(groupId) {
    const group = scene.getGroupByIndex(scene.scene, groupId);
    if (!group) {
      console.warn("group is undefined");
      return;
    }
    const doorMeshList = group.children.filter((mesh) =>
      mesh.name.includes("d-door")
    );

    // 给每一个门设定感应范围10，当车辆进入感应范围时，开门，否则关门
    doorMeshList.forEach((doorMesh) => {
      // 从agv model，获取车辆下一秒视图坐标
      const AGVContainer = dynamicObject.getModelContainer().agv;
      const agvs = Object.values(AGVContainer);
      // 门视图坐标
      const { x: dx, z: dz } = doorMesh.position;
      // 感应范围
      const radius = 10;
      const agv = agvs.find((agvMesh) => {
        const { x: ax, z: az } = agvMesh.targetPos;
        return Math.abs(dx - ax) < radius && Math.abs(dz - az) < radius;
      });
      // 范围有车，开门
      if (agv) {
        if (doorMesh.userData.status === "close") {
          // console.log('open')
          model["Door"].callAnimation(doorMesh, {
            type: "Open",
            duration: 1,
          });
          doorMesh.userData.status = "open";
        }
      } else {
        // 范围无车，关门
        if (doorMesh.userData.status === "open") {
          // console.log('close')
          model["Door"].callAnimation(doorMesh, {
            type: "Close",
            duration: 1,
          });
          doorMesh.userData.status = "close";
        }
      }
    });
  }

	changeMeshesStatus(changeList){
    const currentDockingGroup = this.getTargetsByGroup(scene.scene,scene.currentGroupId)
    if(currentDockingGroup){
      const dockingGroups = currentDockingGroup.filter(item => item.name === 'docking')
      const dockingIds = dockingGroups.map(group => group.children[1].userData.dockingId)
      console.log(dockingGroups);
      
      changeList.forEach(el => {
        if(dockingIds.includes(el.id)){
         const item = this.getDockingItemById(dockingGroups, el.id); 
         item.material.color.set('#FECD2D')
        }
      })
    }
	}

  getDockingItemById(groups,id){
    return groups.filter(item => {
      return item.children[1].userData.dockingId === id
    })[0].children[1]
  }
}

export default new Device();
