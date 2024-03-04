import resource from "@Command/resource";
import TWEEN from "tween.js";
import * as THREE from "three";
import Base from "@Command/base";
import Floor from "@Command/floor";
import Scene from "@Command/scene/index";
import { config, coefficient } from "@Command/dynamicObject/constant";
import dynamicMark from "@Command/dynamicObject/DynamicMark";
import { CTUAGVContainer } from "./types";

class AGV extends Base {
  cacheMesh: THREE.Mesh;
  container: { [key: string]: CTUAGVContainer };
  maxStack: number;
  // 创建agv类型小车
  constructor() {
    super();
    this.cacheMesh = null;
    this.container = {};
    this.maxStack = 2;
  }

  // 创建模型
  async createIns(data) {
    const meshGroup = new THREE.Group();
    meshGroup.name = 'agv'
    const mark = dynamicMark.createDynamicMark(data);
    meshGroup.add(mark);
    if (this.cacheMesh) {
      const mesh = this.cacheMesh.clone();
      meshGroup.add(mesh);
      this.setIns(data, meshGroup);

      return meshGroup;
    }
    const originModel = await resource.loadModel("agv.glb");
    const meshModel = originModel.scene;
    // 调整模型朝向
    meshModel.rotation.y = this.anlgeToRadian(90);
    meshModel.position.y = 1;

    // 设置大小
    meshModel.scale.y = 4;
    meshModel.scale.z = 4;
    meshModel.scale.x = 4;
    this.cacheMesh = meshModel;
    const mesh = this.cacheMesh.clone();
    meshGroup.add(mesh);
    this.setIns(data, meshGroup);
    return meshGroup;
  }
  // 更新模型实例（动态更新改变mark）
  updateIns(data) {
    const model = this.container[data.id];
    if (!model) {
      return;
    }
    const meshGroup = model.mesh;
    // 去掉旧的mark
    const originMark = meshGroup.children.find(
      (mesh) => mesh.name === "DynamicMark"
    );
    meshGroup.remove(originMark);
    // 创建新的mark
    const mark = dynamicMark.createDynamicMark(data);
    meshGroup.add(mark);
  }
  // 设置初始位置、角度
  setIns(data, mesh) {
    const { id, direction } = data;
    const { x, z } = this.positionAdaptor({
      x: data.x,
      y: data.y,
      plantWidth: Floor.plantWidth,
      plantHeight: Floor.plantHeight,
    });
    this.container[id] = {
      id,
      mesh,
      timeStamp: +new Date(),
      tween: null,
      stack: [data],
      targetPos: {
        x,
        z
      }
    };
    // 初始化位置
    mesh.position.x = x;
    mesh.position.z = z;
    mesh.rotation.y = this.anlgeToRadian(direction);
  }

  // 推入新的点位到点位栈，执行stack[0] =>  stack[1]
  createTween(data) {
    const model = this.container[data.id];
    const timeStamp = +new Date();
    const interval = timeStamp - model.timeStamp;
    // console.log(timeStamp, model.timeStamp, interval);

    // 推入新的动画
    const stack = model.stack;
    if (stack.length < this.maxStack) {
      stack.push(data);
    } else {
      stack.shift();
      stack.push(data);
    }
    if (stack.length <= 1) {
      console.log(`stack must >= 2`);
      return;
    }

    const { x, z } = this.positionAdaptor({
      x: stack[1].x,
      y: stack[1].y,
      plantWidth: Floor.plantWidth,
      plantHeight: Floor.plantHeight,
    });
    model.targetPos = {
      x,
      z
    }
    // console.log(x, z)
    // 定义动画
    // 移动
    const p = new TWEEN.Tween(model.mesh.position).to(
      {
        x: x,
        z: z,
      },
      interval
    );
    // 完成清掉当前动画

    p.onComplete(() => {
      model.tween = null;
    });

    // 旋转
    const r = new TWEEN.Tween(model.mesh.rotation).to(
      {
        y: this.anlgeToRadian(data.direction),
      },
      //不执行补间动画，立即调整角度
      0
    );

    // 跨越180轴的处理,重置初始坐标再调度动画，保证旋转方向正确
    const lastRotate = stack[0].direction;
    const rotate = data.direction;
    let updateInitRotate = null;
    if (
      rotate !== lastRotate &&
      lastRotate * rotate < 0 &&
      Math.abs(lastRotate) >= 90 &&
      Math.abs(rotate) >= 90
    ) {
      // 逆时针
      if (rotate < lastRotate) {
        updateInitRotate = this.anlgeToRadian(lastRotate - 360);
      } else {
        //顺时针
        updateInitRotate = this.anlgeToRadian(360 + lastRotate);
      }
    }
    // 完成清掉当前动画
    r.onComplete(() => {
      model.tween = null;
    });

    // 受到网络延时的影响,2种情况，当前没有正在运行中的动画，直接调用
    if (!model.tween) {
      if (updateInitRotate) {
        console.log("跨越180,当前没有正在执行的动画,等待接口返回");
        model.mesh.rotation.y = updateInitRotate;
      }
      p.start();
      r.start();
    } else {
      //另一种情况 衔接动画
      if (updateInitRotate) {
        console.log("跨越180,当前有正在执行的动画,衔接等待执行");
        model.tween.r.onComplete(() => {
          model.mesh.rotation.y = updateInitRotate;
        });
      }
      model.tween.p.chain(p);
      model.tween.r.chain(r);
    }
    // 更新时间戳
    model.timeStamp = +new Date();
    //更新当前动画
    model.tween = {
      r,
      p,
    };
  }

  // 坐标及角度的转换
  positionAdaptor(data) {
    // agv坐标转视图坐标
    data = this.modelToViewPositionAdaptor(data);
    // 视图坐标系转换为3d坐标
    return this.viewTo3dPositionAdaptor(data);
  }

  // agv坐标系转换
  modelToViewPositionAdaptor(data) {
    const conf = config[Scene.currentGroupId];
    if (!conf) {
      console.warn("缺少坐标转换配置");
      return { ...data };
    }
    const { scale, agvOriginPoint } = conf;

    // 转为视图的x y
    const y =
      Floor.plantHeight - (data.y * coefficient + agvOriginPoint.y) * scale;
    const x = (data.x * coefficient + agvOriginPoint.x) * scale;
    // console.log(x, y)
    return { ...data, x, y };
  }
  // 清除模型
  removeIns(id) {
    delete this.container[id];
  }
  // 清除容器
  clearContainer() {
    this.cacheMesh = null;
    this.container = {};
  }

}

export default new AGV();