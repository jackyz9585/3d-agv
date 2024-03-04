import { Mesh, Group, Object3D } from "three";


interface Pos {
  px: number;
  py: number;
  pz: number;
}


interface Scale {
  x: number;
  y: number;
  z: number;
}

interface UserData {
  model: string;
  id: string;
  status: string;
  scale: Scale;
  dockingId: String;
}

//组装后的数据
export interface fixedData {
  pos: Pos;
  rotate: number;
  userData: UserData;
}


export type ObjectModel = Mesh | Group | Object3D;

// 接口返回的源数据
export interface FixedObjectOrigin {
  // deviceCode: string;
  // deviceType: string;
  // deviceX: number;
  // deviceY: number;
  // locationMark: string;
  // lotId: string;
  // model: MeshType;
  // positionX: number;
  // positionY: number;
  // recipeName: string;
  // rotateFlag: string;
  // status: string;
  // stepName: string;
  // originDeviceX?: number;
  // originDeviceY?: number;
  // deviceZ?: number;
  [key: string]: any;
}
