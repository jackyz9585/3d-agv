interface Pos {
  px: number;
  py: number;
  pz: number;
}

interface Material {
  color: string;
  image: string;
}

interface Size {
  x: number;
  y: number;
  z: number;
}

interface UserData {
  type: "floor";
  id: string;
}

export interface TextUserData {
  type: "area";
  id: string;
  originData: TextPoints[];
}

export type TextPoints = {
  px: number;
  py: number;
  pz: number;
};

export interface TextStyle {
  color?: string;
  fontSize?: number;
  background?: string;
}

export interface TextData {
  id: string;
  name: string;
  size: Size;
  pos: Pos;
  points: TextPoints[];
  userData: TextUserData;
  style: TextStyle;
  textLeft: number;
  textRight: number;
}

export interface FloorData {
  size: Size;
  pos: Pos;
  texts: TextData[];
  material: Material;
  userData: UserData;
}
