/**
 * 接驳位mark
 */
import * as THREE from "three";
import Konva from "konva";
import Base from "@Command/base";

class DockingMark extends Base {
  constructor(){
    super();
    // 横纵比例系数
    this.ratio = 1
  }

  createDockingMark(data){
    const texture = new THREE.CanvasTexture(this.createTextCanvas(data))
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture, //设置精灵纹理贴图
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.name = "DockingMark"
    const width = 15
    const height = 10
    this.ratio = height /width
    sprite.scale.set(width, height)

    return sprite
  }

  createTextCanvas(data){
    const width = 50, height = width * this.ratio
    const stage = new Konva.Stage({
      width: width,
      height: height,
      container: document.createElement("canvas")
    })

    const layer = new Konva.Layer()
    stage.add(layer)
    const rect = new Konva.Rect({
      x: 0,
      y: 0,
      stroke: "#fff",
      strokeWidth: 2,
      fill: "#0000005c",
      width: width,
      height: height,
    })
    layer.add(rect)

    const fields = [
      {
        label: '简称:',
        value: data.userData.id.slice(6)
      }
    ]
    fields.forEach(field => {
      this.addField(field, layer);
    })
    stage.draw()
    const canvas = stage.toCanvas()
    return canvas
  }
  addField(field, layer){
    const padding = 5;
    const rowHeight = 10;
    const group = new Konva.Group({
      x: padding,
      y: rowHeight,
    });
    layer.add(group);
    const textLeft = new Konva.Text({
      x: 0,
      y: 0,
      text: field.value,
      fontSize: 16,
      fontFamily: "Calibri",
      fill: "#fff",
    });
    group.add(textLeft);
  }
}

export default new DockingMark();