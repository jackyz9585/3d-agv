import { cloneDeep } from "lodash";

export default class RectValidator {
  rects: any;
  plantHeight: number;
  plantWidth: number;

  constructor(rects, plantWidth, plantHeight) {
    this.rects = rects;
    this.plantWidth = plantWidth;
    this.plantHeight = plantHeight;
  }
  targetNormalize(rect) {
    rect = { ...rect };
    const x1 = Number(rect.posx);
    const y1 = Number(rect.posy);
    if (rect.rotateFlag === "1") {
      [rect.sizew, rect.sizeh] = [rect.sizeh, rect.sizew];
    }
    const x2 = Number(rect.sizew) + x1;
    const y2 = Number(rect.sizeh) + y1;
    return {
      x1,
      y1,
      x2,
      y2,
      deviceCode: rect.deviceCode,
    };
  }
  sourceDataNormalize(rect) {
    rect = cloneDeep(rect);
    const x1 = Number(rect.positionX);
    const y1 = Number(rect.positionY);
    if (rect.rotateFlag === "1") {
      [rect.deviceX, rect.deviceY] = [rect.deviceY, rect.deviceX];
    }
    const x2 = Number(rect.deviceX) + x1;
    const y2 = Number(rect.deviceY) + y1;
    return {
      x1,
      y1,
      x2,
      y2,
      deviceCode: rect.deviceCode,
    };
  }
  // 校验体积重复
  getOverlap(target, source) {
    const { x1: p1x, y1: p1y, x2: p2x, y2: p2y } = target;
    const { x1: q1x, y1: q1y, x2: q2x, y2: q2y } = source;
    if (q1x >= p2x || q1y >= p2y || q2x <= p1x || q2y <= p1y) {
      return null;
    }
    return { target, source };
  }
  addCheckOverlay(rect) {
    const target = this.targetNormalize(rect);
    for (let i = 0; i < this.rects.length; i++) {
      const source = this.sourceDataNormalize(this.rects[i]);
      // 有重复的，返回数据
      if (this.getOverlap(target, source)) {
        return {
          success: false,
          result: {
            target,
            source,
          },
        };
      }
    }
    return {
      success: true,
    };
  }
  editCheckOverlay(rect) {
    const target = this.targetNormalize(rect);
    for (let i = 0; i < this.rects.length; i++) {
      // 循环到自身不判断
      const source = this.sourceDataNormalize(this.rects[i]);
      if (source.deviceCode === target.deviceCode) {
        continue;
      }
      // 有重复的，返回数据
      if (this.getOverlap(target, source)) {
        return {
          success: false,
          result: {
            target,
            source,
          },
        };
      }
    }
    return {
      success: true,
    };
  }
  checkRangeOut(rect) {
    const target = this.targetNormalize(rect);
    if (target.x2 > this.plantWidth || target.x2 < 0) {
      return false;
    }
    if (target.y2 > this.plantHeight || target.y2 < 0) {
      return false;
    }
    return true;
  }
}
