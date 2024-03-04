import { Mesh, Group, Object3D } from "three";

export interface ActiveDevice {
  type: "device";
  id: string;
  data: Mesh;
}

export interface ActiveArea {
  type: "area";
  id: string;
  data: Mesh;
  lineData: Mesh;
}

export interface ActiveFloor {
  type: "floor";
  id: string;
  data: Mesh;
}

export type ActiveData = ActiveDevice | ActiveArea | ActiveFloor | null;

export type BreathingLightModel = Mesh | Group | Object3D;

export interface UserEventFn {
  fn: (any) => void;
  id: string;
  eventName: string;
}

export interface InterceptorFn {
  fn: (any) => void;
  id: string;
}
