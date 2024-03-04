import * as THREE from "three";
import Base from "@BaseScence/Command/base";
import scene from "@BaseScence/Command/scene/index";

class Axis extends Base {
  axisGroup: THREE.Group;
  y: number;

  constructor() {
    super();
    this.axisGroup = new THREE.Group();
    this.y = 1;
  }
  drawLine(start, end, opacity = 1) {
    const points: THREE.Vector3 = [];
    points.push(new THREE.Vector3(start.x, this.y, start.z));
    points.push(new THREE.Vector3(end.x, this.y, end.z));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: "#fff",
      transparent: true,
      opacity,
    });
    return new THREE.Line(geometry, material);
  }
  createTextCanvas(value) {
    const canvas = document.createElement("canvas");
    canvas.width = 20;
    canvas.height = 20;

    const cxt = canvas.getContext("2d") as CanvasRenderingContext2D;
    cxt.fillStyle = "#fff";
    const fontSize = 10;
    cxt.font = `${fontSize}px Arial`;
    cxt.textBaseline = "middle";
    cxt.textAlign = "center";
    cxt.fillText(value, canvas.width / 2, canvas.height / 2);
    return canvas;
  }
  drawText({ x, z, value }) {
    // 写字
    const canvas = this.createTextCanvas(value);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
    });
    // 创建精灵模型对象，不需要几何体geometry参数
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width, canvas.height);
    sprite.position.set(x, this.y, z);

    this.axisGroup.add(sprite);
  }
  showAxis({ groupId, geometryConfig }) {
    const group = this.getGroupByIndex(scene.scene, groupId);
    const axName = `ax-${groupId}`;
    // 楼层组加载过轴线，则return
    if (group.children.find((mesh) => mesh.name === axName)) {
      return;
    }

    // 重新创建组
    this.axisGroup = new THREE.Group();
    const { x: xTotal, z: zTotal } = geometryConfig.size;

    const gap = 10; //线之间的间隙
    // 总长宽如果不能被gap整除，需要进行偏移保证起始为 0
    const xOffset = zTotal % gap; //页面上的x轴偏移
    // const yOffset = xTotal % gap; //页面上的y轴偏移

    // 竖线
    for (let i = -xTotal / 2; i <= xTotal / 2; i += gap) {
      let line;
      const value = i + xTotal / 2;

      if (value === 0) {
        this.drawText({ x: i, z: -zTotal / 2 - 15, value: "X" });
      }
      if (!((value / 5) % 5)) {
        line = this.drawLine(
          { x: i, z: -zTotal / 2 - 5 },
          { x: i, z: zTotal / 2 + 5 },
          1
        );
        this.drawText({ x: i, z: zTotal / 2 + 12, value });
      } else {
        line = this.drawLine(
          { x: i, z: -zTotal / 2 },
          { x: i, z: zTotal / 2 },
          0.5
        );
      }
      this.axisGroup.add(line);
    }
    // 横线
    for (let i = -zTotal / 2; i <= zTotal / 2; i += gap) {
      let line;
      const value = zTotal - i - zTotal / 2 - xOffset; //减去偏移量保证在0起始

      if (value === 0) {
        this.drawText({ x: xTotal / 2 + 20, z: i + xOffset, value: "Y" });
      }
      if (!((value / 5) % 5)) {
        line = this.drawLine(
          { x: -xTotal / 2 - 5, z: i + xOffset },
          { x: xTotal / 2 + 5, z: i + xOffset },
          1
        );
        this.drawText({ x: -xTotal / 2 - 15, z: i, value });
      } else {
        line = this.drawLine(
          { x: -xTotal / 2, z: i + xOffset },
          { x: xTotal / 2, z: i + xOffset },
          0.5
        );
      }

      this.axisGroup.add(line);
    }
    group && group.add(this.axisGroup);
  }
  hideAxis({ groupId }) {
    const group = this.getGroupByIndex(scene.scene, groupId);
    group.remove(this.axisGroup);
  }
}

export default new Axis();
