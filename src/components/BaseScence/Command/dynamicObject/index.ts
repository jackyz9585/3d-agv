import * as THREE from 'three'
import Base from '@BaseScence/Command/base'
import scene from '@BaseScence/Command/scene/index'
import model from './model'
import { CTUAGVResponse } from '@/server/types'

class DynamicObject extends Base {
  group: THREE.Group | null
  constructor() {
    super()
    this.group = null
  }

  clearDynamicObject() {
    this.group = null
    model.AGV.clearContainer()
  }

  // 切换楼层时，清除动态物体 重置group
  initDynamicObject() {
    this.clearDynamicObject()
    this.group = scene.getGroupByIndex(scene.scene, scene.currentGroupId)
    if (!this.group) {
      console.warn('group未找到')
      return
    }
  }
  // 加载动态物体
  loadDynamicObject(dynamicRes: CTUAGVResponse) {
    const AGVContainer = model.AGV.container
    // 三种情况：新增、移动、清除
    const initDynamicRes = {
      ...dynamicRes,
      data: dynamicRes.data.filter((item) => !AGVContainer[item.id]),
    }
    this.createDynamicObject(initDynamicRes)
    const moveDynamicRes = {
      ...dynamicRes,
      data: dynamicRes.data.filter((item) => AGVContainer[item.id]),
    }
    this.moveDynamicObject(moveDynamicRes)
    const removeDynamicRes = {
      data: Object.keys(AGVContainer).filter(
        (id) => !dynamicRes.data.find((item) => item.id === id)
      ),
    }
    this.removeDynamicObject(removeDynamicRes)
  }
  // 初始化动态物体
  async createDynamicObject(dynamicRes: CTUAGVResponse) {
    // 遍历创建agv小车
    const agv = dynamicRes.data || []
    for (let i = 0; i < agv.length; i++) {
      const obj = agv[i]
      const modelIns = await model.AGV.createIns(obj)
      this.group.add(modelIns)
    }
  }
  // 调度小车
  async moveDynamicObject(dynamicRes: CTUAGVResponse) {
    const agv = dynamicRes.data || []
    for (let i = 0; i < agv.length; i++) {
      const obj = agv[i]
      const modelIns = await model.AGV.updateIns(obj)
      await model.AGV.createTween(obj)
    }
  }
  // 清除小车
  async removeDynamicObject(dynamicRes: { data: string[] }) {
    const AGVContainer = model.AGV.container
    const agv = dynamicRes.data || []
    for (let i = 0; i < agv.length; i++) {
      const id = agv[i]
      this.group.remove(AGVContainer[id].mesh)
      await model.AGV.removeIns(id)
    }
  }
  getModelContainer() {
    return {
      agv: model.AGV.container
    }
  }

  // // 计算坐标集合的折线长度
  // calcLengthBetweenPorints(...points) {
  //   let length = 0;
  //   for (let i = 0; i < points.length - 1; i++) {
  //     const [x1, y1] = [points[i][0], points[i][1]];
  //     const [x2, y2] = [points[i + 1][0], points[i + 1][1]];
  //     const len = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  //     length += len;
  //   }
  //   return length;
  // }
  // createTweenPath(mesh, points, loop = false) {
  //   const speed = 0.01;
  //   const p0 = points[0].pos;
  //   mesh.position.x = p0[0];
  //   mesh.position.z = p0[1];

  //   const ts = [];
  //   for (let i = 0; i < points.length - 1; i++) {
  //     const pos = points[i + 1].pos;
  //     const delay = points[i].delay;

  //     const duration =
  //       this.calcLengthBetweenPorints(points[i].pos, points[i + 1].pos) /
  //         speed || 3000;
  //     ts.push(
  //       new TWEEN.Tween(mesh.position)
  //         .to(
  //           {
  //             x: pos[0],
  //             z: pos[1],
  //           },
  //           duration
  //         )
  //         .delay(delay || 0)
  //         .easing(TWEEN.Easing.Linear.None)
  //     );
  //   }
  //   ts.forEach((t, i) => {
  //     t.onComplete(() => {
  //       if (loop) {
  //         ts[(i + 1) % ts.length].start();
  //       } else {
  //         if (i < ts.length - 1) {
  //           ts[i + 1].start();
  //         }
  //       }
  //     }).onStart(() => {
  //       const deg = points[i].rotate || 0;
  //       if (i > 0) {
  //         mesh.rotation.y += (deg * Math.PI) / 180;
  //       } else {
  //         mesh.rotation.y = (deg * Math.PI) / 180;
  //       }
  //     });
  //   });
  //   ts[0].start();
  // }
}

export default new DynamicObject()
