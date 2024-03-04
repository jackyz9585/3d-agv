import Base from "@BaseScence/Command/base";
import scene from "@BaseScence/Command/scene/index";
import userEvent from "@BaseScence/Command/scene/userEvent";
import { statusEnum } from "@BaseScence/config";
import model from "./model";
import breathingLight from "@BaseScence/Command/scene/breathingLight";


import { DeviceData, ActiveDevice, ObjectModel } from "./types";

class Device extends Base {
  activeDevice: ActiveDevice;
  hoverDevice: ActiveDevice;

  constructor() {
    super();
    // 维护设备型号对应的材质或模型等,避免重复加载
    this.activeDevice = null;
    this.hoverDevice = null;
  }
  // 绘制立方体  设备（异步）
  async drawDevicesByGroup({
    groupId,
    geometries,
  }: {
    groupId: string;
    geometries: DeviceData[];
  }) {
    let i = 0,
      len = geometries.length;
    for (; i < len; i++) {
      const data: DeviceData = geometries[i];
      const meshType = data.material.meshType;
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
  // 根据条件筛选指定组的设备
  filterMeshByFields(groupId, filter) {
    // console.log('根据条件筛选指定组的设备', filter)
    if (!scene.getGroupByIndex(scene.scene, groupId)) {
      console.warn("group is undefined");
      return;
    }
    const meshs = scene
      .getGroupByIndex(scene.scene, groupId)
      .children.filter((mesh) => mesh.userData.type === "device");
    meshs.forEach((mesh) => {
      const originData = mesh.userData.originData;
      if (
        Object.keys(filter).every((k) => {
          /**
           * 1、k为recipeName，模糊匹配 忽略大小写
           * 2、k非空等值判断
           * 3、否则返回true
           */
          if (k === "recipeName") {
            return originData[k]
              .toLowerCase()
              .includes(filter[k].toLowerCase());
          } else if (filter[k]) {
            return originData[k] === filter[k];
          } else {
            return true;
          }
        })
      ) {
        this.switchMeshDisplay(mesh, true);
      } else {
        this.switchMeshDisplay(mesh, false);
      }
    });
  }
  // 改变设备缩放比例 0 隐藏 1 显示
  switchMeshDisplay(mesh, display) {
    const { x, y, z } = mesh.userData.size;
    const scale = mesh.userData.scale;
    if (display) {
      mesh.scale.set(x * scale, y * scale, z * scale);
    } else {
      mesh.scale.set(0, 0, 0);
    }
  }
  // 添加点击事件
  addMouseclick(fn) {
    const _this = this;
    userEvent.addUserEvent({
      eventName: "click",
      id: "DeviceClick",
      fn: (event: PointerEvent) => {
        _this.setActiveMesh.call(_this, event);
        fn && fn(scene.clickTarget);
      },
    });
  }
  //点击事件 鼠标触发当前物体active
  setActiveMesh(event: PointerEvent) {
    const target = scene.getTargetByEvent(event) as ActiveDevice;

    // 当前有激活设备，将其设置为未激活
    if (this.activeDevice) {
      // 去除呼吸灯
      const idx = breathingLight.breathingMeshes.findIndex((mesh) => {
        return mesh.name === this.activeDevice?.data.name;
      });
      breathingLight.breathingMeshes.splice(idx, 1);
      // this.setMeshStatus(this.activeDevice.data, "base");
      this.activeDevice = null;
    }
    scene.clickTarget = target;

    if (target) {
      switch (target.type) {
        case "device":
          // 将当前设备激活
          // this.setMeshStatus(target.data, "active");
          // 添加呼吸灯
          breathingLight.breathingMeshes.push(target.data);
          this.activeDevice = target;
          break;
        default:
          break;
      }
    }
  }
  // 添加鼠标移动事件
  addMousemove() {
    const _this = this;
    userEvent.addUserEvent({
      eventName: "mousemove",
      id: "DeviceMousemove",
      fn: (event) => {
        _this.setHoverMesh.call(_this, event);
      },
    });
  }
  //鼠标移动事件 触发当前物体active
  setHoverMesh(event) {
    const target = scene.getTargetByEvent(event);
    if (!target) return;
    // 当前有激活设备，将其设置为未激活
    if (this.hoverDevice) {
      this.setMeshStatus(this.hoverDevice.data, "base");
      this.hoverDevice = null;
    }
    switch (target.type) {
      case "device":
        // 遍历meshes将当前设备激活
        this.setMeshStatus(target.data, "hover");
        this.hoverDevice = target;

        break;
      case "floor":
        break;
      default:
        break;
    }
    // 点击事件的激活项再激活
    // if (this.activeDevice) {
    // this.setMeshStatus(this.activeDevice.data, "active");
    // }
  }
  // 根据设备号标识当前编辑的设备  效果类似于setActiveMesh，这里为了新增和修改后标识激活效果
  setActiveMeshByDeviceCode(deviceCode) {
    const currentDevice = this.getTargetById(
      scene.scene,
      scene.currentGroupId,
      `d-${deviceCode}`
    );
    if (currentDevice) {
      // 添加呼吸灯
      breathingLight.breathingMeshes.push(currentDevice);
      // this.setMeshStatus(currentDevice, "active");
      this.activeDevice = {
        type: "device",
        id: currentDevice.name,
        data: currentDevice,
      };
    }
  }
  // 读取到设备状态变化，改编设备节点状态信息、修改颜色
  changeMeshesStatus(changeDevices) {
    changeDevices.forEach((changeDevice) => {
      const currentDevice = this.getTargetById(
        scene.scene,
        scene.currentGroupId,
        `d-${changeDevice.deviceCode}`
      );
      if (currentDevice) {
        currentDevice.userData.status = {
          ...statusEnum[changeDevice.status],
          type: changeDevice.status,
        };
        currentDevice.userData.originData.status = changeDevice.status;
        this.setMeshStatus(currentDevice, "base");
      }
    });
  }
  // 根据设备自身的状态  更新交互显示的颜色  hover base  isFixedMaterial为不需要改变颜色的mesh
  setMeshStatus(item, status) {
    // item可能为mesh或group
    item.traverse((obj) => {
      if (obj.type === "Mesh" && !obj.userData.isFixedMaterial) {
        // material可能是数组
        if (Array.isArray(obj.material)) {
          obj.material.forEach((mtl) => {
            mtl.color.set(item.userData.status[status]);
          });
        } else {
          obj.material.color.set(item.userData.status[status]);
        }
      }
    });
  }
  clearDevice() {
    this.activeDevice = null;
    this.hoverDevice = null;
  }
}

export default new Device();
