import {
  DeviceData,
  DeviceOrigin,
  UnmatchedStatus,
} from "@/components/BaseScence/Command/device/types";
import {
  fixedData,
  FixedObjectOrigin
} from "@/components/BaseScence/Command/fixedObject/types";
import {
  FloorData,
} from "@/components/BaseScence/Command/types/floor";

import {
  Status,
  defaultFontStyle,
  defaultPlantHeight,
  defaultPlantWidth,
  statusEnum,
} from "./config";

import { get, cloneDeep } from "lodash";

// 地板厚度
const floorHeight = 1;

// 基本单位 控制设备高度
const base = 5;

const plantColor = "#010976";

// 用于设备处理坐标系转换
//视图X (VIEW -> 3D)
export const XAdaptor = (x, plantWidth) => {
  return plantWidth / 2 - x;
};
//视图X (3D -> VIEW)
export const inverseXAdaptor = (x, plantWidth) => {
  return plantWidth / 2 - x;
};
//视图Y (VIEW -> 3D)
export const YAdaptor = (y, plantHeight) => {
  return -plantHeight / 2 + y;
};
//视图Y (3D -> VIEW)
export const inverseYAdaptor = (y, plantHeight) => {
  return plantHeight / 2 + y;
};

export const getFloorSizeById = (bid, fid) => {
  let plantHeight, plantWidth;
  //@ts-ignore
  const build = window.buildList.find((b) => b.id === bid);
  if (build) {
    const floor = build.floors.find((b) => b.id === fid);
    if (floor) {
      plantHeight = floor.plantHeight;
      plantWidth = floor.plantWidth;
    }
  }
  return {
    plantWidth: plantWidth || defaultPlantWidth,
    plantHeight: plantHeight || defaultPlantHeight,
  };
};

export const buildGroup = (
  currentFloor,
  deviceData: DeviceOrigin[],
): { floor: FloorData; devices: DeviceData[], fixedObject: fixedData[] } => {
  const { plantWidth, plantHeight } = getFloorSizeById(
    currentFloor.parentId,
    currentFloor.id
  );
  // 构造地面
  const material = {
    color: plantColor,
    // 自定义的配置
    image: currentFloor.image,
  };
  const floor: FloorData = {
    size: { x: plantHeight, y: floorHeight, z: plantWidth },
    pos: { px: 0, py: 0, pz: 0 },
    texts: (currentFloor.texts || []).map((t) => {
      const { px: tpx, py: tpy, pz: tpz } = t.pos;
      const { x: tx, y: ty, z: tz } = t.size;
      const style = { ...defaultFontStyle, ...t.style };
      const points = (t.points || []).map((p) => {
        return {
          px: YAdaptor(Number(p[1]), plantHeight),
          py: floorHeight,
          pz: XAdaptor(Number(p[0]), plantWidth),
        };
      });
      return {
        ...t,
        size: { x: Number(tx), y: 1, z: Number(ty) },
        pos: {
          px: YAdaptor(Number(tpy), plantHeight),
          py: 0,
          pz: XAdaptor(Number(tpx), plantWidth),
        },
        style: style,
        //文本的z坐标（靠近屏幕）
        textLeft: XAdaptor(0, plantWidth),
        textRight: XAdaptor(plantWidth, plantWidth),

        points: points,
        userData: {
          type: "area",
          id: `a-${t.id}`,
          originData: points,
        },
      };
    }),
    material,
    userData: {
      type: "floor",
      id: `f-${currentFloor.id}`,
    },
  };
  // 设备坐标系需要翻转
  const devices: DeviceData[] = deviceData.map((device: DeviceOrigin) => {
    // console.log(device);
    device = cloneDeep(device);

    let rotate = 0;
    // originDeviceX 原始长宽 用于根据旋转度数校验碰撞
    // deviceY  视图渲长宽
    device.originDeviceX = device.deviceX;
    device.originDeviceY = device.deviceY;

    if (device.rotateFlag === "1") {
      [device.deviceX, device.deviceY] = [device.deviceY, device.deviceX];
      rotate = -Math.PI / 2;
    }

    // 设备高度设定  优先读取deviceZ  否则自动生成高度
    let y = base;
    if (device.deviceZ) {
      y = device.deviceZ;
    } else {
      //  最大值为base,若设备长宽较小，则z取长宽最小值
      y = Math.min(device.deviceX, device.deviceY);
      if (y > base) {
        y = base;
      }
    }

    const size = {
      x: Number(device.deviceY),
      y: y,
      z: Number(device.deviceX),
    };
    // 状态枚举中没有匹配到状态，设置为unmatchedStatus

    const status: Status | UnmatchedStatus = statusEnum[device.status]
      ? {
        ...statusEnum[device.status],
      }
      : {
        type: "UNMATCHED",
      };
    return {
      size,
      pos: {
        px:
          YAdaptor(Number(device.positionY), plantHeight) +
          Number(device.deviceY) / 2,
        py: y / 2 + 0.5,
        pz:
          XAdaptor(Number(device.positionX), plantWidth) -
          Number(device.deviceX) / 2,
      },
      rotate,
      material: {
        color: get(statusEnum, `[${device.status}].base`, "#03a9f4"), //状态未匹配的设备默认颜色
        meshType: device.model || "Device1", //mesh类型，src\components\BaseScence\Command\device\model\index.js中定义
        // meshType: "ComposeGeometry", //mesh类型，src\components\BaseScence\Command\device\model\index.js中定义
      },
      userData: {
        type: "device",
        id: `d-${device.deviceCode}`,
        status,
        size,
        originData: device, //数据库原始数据
        scale: 1, //默认缩放比例
        draggable: true,
      },
    };
  });

  // 设备坐标系需要翻转
  const fixedObject: fixedData[] = (currentFloor.fixedObjects || []).map((fixed: FixedObjectOrigin) => {

    fixed = cloneDeep(fixed);

    let rotate = 0;


    if (fixed.rotateFlag === "1") {
      rotate = -Math.PI / 2;
    }
    return {
      pos: {
        px:
          YAdaptor(Number(fixed.positionY), plantHeight),
        py: 0.5,
        pz:
          XAdaptor(Number(fixed.positionX), plantWidth)
      },
      rotate,
      userData: {
        model: fixed.model,
        id: `fixed-${fixed.code}`,
        status: fixed.status,
        scale: {
          x: +fixed.objectX,
          y: +fixed.objectZ,
          z: +fixed.objectY,
        },
        dockingId:fixed.dockingId
      },
      
    };
  });
  return {
    floor,
    devices,
    fixedObject
  };
};
