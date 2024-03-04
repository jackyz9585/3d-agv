
import { Mesh } from "three";

type stack = {
  x: number;
  y: number;
  direction: number;
};

export interface CTUAGVContainer {
  id: string;
  mesh: Mesh;
  timeStamp: number;
  tween: {
    p: any;
    r: any;
  };
  stack: stack[];
  //3d坐标系中，目标点位
  targetPos: {
    x: number;
    z: number;
  }
}
