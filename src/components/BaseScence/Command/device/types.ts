import { ActiveDevice as ActiveData } from "../scene/types";
import { Mesh, Group, Object3D } from "three";
import { Status } from "../../config";
type MeshType = "BoxGeometry" | "ComposeGeometry" | "Device1";

interface Pos {
  px: number;
  py: number;
  pz: number;
}

interface Material {
  color: string;
  meshType: MeshType;
}

interface Size {
  x: number;
  y: number;
  z: number;
}


export interface UnmatchedStatus {
  type: "UNMATCHED";
}
interface UserData {
  type: "device";
  id: string;
  status: Status | UnmatchedStatus;
  size: Size;
  originData: any;
  scale: number;
  draggable: boolean;
}

//组装后的数据
export interface DeviceData {
  material: Material;
  pos: Pos;
  rotate: number;
  size: Size;
  userData: UserData;
}

export type ActiveDevice = ActiveData | null;

export type ObjectModel = Mesh | Group | Object3D;

// 接口返回的源数据
export interface DeviceOrigin {
  deviceCode: string;
  deviceType: string;
  deviceX: number;
  deviceY: number;
  locationMark: string;
  lotId: string;
  model: MeshType;
  positionX: number;
  positionY: number;
  recipeName: string;
  rotateFlag: string;
  status: string;
  stepName: string;
  originDeviceX?: number;
  originDeviceY?: number;
  deviceZ?: number;
  [key: string]: any;
}
