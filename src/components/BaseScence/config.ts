interface MarkStyle {
  fontSize: number;
  color: string;
  background: string;
}

export type StatusType = 'ALL'| 'RUN' | 'IDLE' | 'OFFLINE'| 'BLUE';
export interface Status {
  type: StatusType;
  base: string;
  light: string;
  dark: string;
  hover?: string;
  active?: string;
}


// 底图上的默认文字颜色
export const defaultFontStyle: MarkStyle = {
  fontSize: 60,
  color: "#00FFFF",
  background: "#00FFFF",
};

// 整体区域大小
// 原始1200  800
export const defaultPlantHeight: number = 500;
export const defaultPlantWidth: number = 320;

// 状态枚举
export const statusEnum:{[type: string] : Status} = {
  ALL: {
    type: 'ALL',
    base: "#2D89FE", //状态版背景颜色  设备颜色
    light: "#0e1f33", //状态版文字颜色 大
    dark: "#0e1f33", //状态版文字颜色 小
  },
  RUN: {
    type: 'RUN',
    base: "#2FD861",
    hover: "#20FF87",
    active: "#00b0ff",
    light: "#056F36",
    dark: "#033E1E",
  },
  IDLE: {
    type: 'IDLE',
    base: "#FECD2D",
    hover: "#FFF500",
    active: "#00b0ff",
    light: "#918C14",
    dark: "#555206",
  },
  OFFLINE: {
    type: 'OFFLINE',
    base: "#1f94f7",
    hover: "#ffffff",
    active: "#00b0ff",
    light: "#606060",
    dark: "#191919",
  },
  //货架蓝
  BLUE: {
    type: 'BLUE',
    base: "#1a91f7",
    hover: "#339cf5",
    active: "#00b0ff",

    light: "#606060",
    dark: "#191919",
  },
};

export const draggableObjectTypes: string[] = ["device"];
