import * as THREE from "three";
import Konva from "konva";
import Base from "@Command/base";

class DynamicMark extends Base {
  // 创建小车mark
  constructor() {
    super();
    // 横纵比例系数
    this.ratio = 1
  }
  createDynamicMark(data) {
    const texture = new THREE.CanvasTexture(this.createTextCanvas(data));
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture, //设置精灵纹理贴图
    });
    // 创建精灵模型对象，不需要几何体geometry参数
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.name = "DynamicMark";
    const width = 60
    const height = 45
    this.ratio = height / width
    sprite.scale.set(width, height);
    const dynamicMeshHeight = 20//物体高度
    sprite.position.y = height / 2 + dynamicMeshHeight; //高度

    return sprite;
  }

  createTextCanvas(data) {
    const width = 550;
    const height = width * this.ratio;

    // 创建 Konva 舞台
    const stage = new Konva.Stage({
      width: width,
      height: height,
      container: document.createElement("canvas"),
    });

    // 创建 Konva 层
    const layer = new Konva.Layer();
    stage.add(layer);
    // 边框
    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      stroke: "#fff",
      strokeWidth: 2,
      fill: "#0000005c",
      width: width,
      height: height,
    });
    layer.add(rect);
    // 内容
    // const statusColorMap = {
    //   待命: "#FECD2D", //黄
    //   告警: "#fd2d2d", //红
    //   运行: "#2FD861", //绿
    // };
    const fields = [
      {
        label: "编码:",
        value: data.code,
      },
      {
        label: "状态:",
        value: data.status,
        color: data.statusColor,
      },
      {
        label: "配送时长:",
        value: data.deliveryTime,
      },
      {
        label: "电量:",
        value: data.battery,
      },
      {
        label: "起始位:",
        value: data.startAddress,
      },
      {
        label: "终点位:",
        value: data.endAddress,
      },
    ];
    fields.forEach((field, index) => {
      this.addField(field, index, layer);
    });

    // 渲染 Konva 舞台
    stage.draw();

    // 获取 Konva 舞台的画布
    const canvas = stage.toCanvas();

    return canvas;
  }
  // 添加字段
  addField(field, rowIndex, layer) {
    const padding = 20;
    const rowHeight = 56;
    const group = new Konva.Group({
      x: padding,
      y: rowHeight * rowIndex + padding,
      // width: 200,
      height: rowHeight,
    });
    layer.add(group);
    const textLeft = new Konva.Text({
      x: 0,
      y: 0,
      text: field.label,
      fontSize: 42,
      fontFamily: "Calibri",
      fill: "#fff",
    });
    group.add(textLeft);
    const textRight = new Konva.Text({
      x: 170,
      y: 0,
      text: field.value,
      fontSize: 42,
      fontFamily: "Calibri",
      fill: field.color ? field.color : "#fff",
    });
    group.add(textRight);
  }
}

export default new DynamicMark();
