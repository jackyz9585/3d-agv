import * as THREE from "three";
import randomNum from "@/utils/randomNum.js";
import sceneAnimation from "./animation";

class FloatingStar {
  constructor() {}
  // 浮动星光
  drawFloatingStar({ scene }) {
    const group = new THREE.Group();
    group.name = "FloatingStar";
    // 批量创建星星精灵模型
    const texture = new THREE.TextureLoader().load("/light.png");

    for (let i = 0; i < 50; i++) {
      // flashType为1则随机闪烁 0则固定闪烁
      const flashType = randomNum(0, 20) > 1 ? 1 : 0;
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture, //设置精灵纹理贴图
        transparent: true,
        opacity: flashType ? randomNum(-10, 0, 2) : 0,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      group.add(sprite);
      const minSize = randomNum(4, 6);

      sprite.scale.set(minSize, minSize, 1);

      const k1 = Math.random() - 0.5;
      const k2 = Math.random() - 0.5;
      const k3 = Math.random() - 0.5;
      // 设置精灵模型位置，在整个空间上上随机分布
      sprite.userData.flashType = flashType;
      sprite.userData.minSize = minSize;

      sprite.position.set(800 * k1, 600 * k3, 800 * k2);
      sprite.userData.dir = true;
      sprite.userData.flashSpeedShow = randomNum(0.03, 0.05, 3);
      sprite.userData.flashSpeedHide =
        sprite.userData.flashSpeedShow - randomNum(0.01, 0.02, 3);
    }
    scene.add(group);

    // 闪烁动画
    const animation = () => {
      group.children.forEach((sprite) => {
        // 显示前准备
        if (sprite.userData.dir && sprite.material.opacity <= 0) {
          sprite.material.opacity += 0.01;
          return;
        }
        // 显示
        if (
          sprite.material.opacity > 0 &&
          sprite.material.opacity < 1 &&
          sprite.userData.dir
        ) {
          sprite.material.opacity += sprite.userData.flashSpeedShow;
          sprite.userData.minSize += 0.05;
          sprite.scale.set(sprite.userData.minSize, sprite.userData.minSize, 1);
          return;
        }
        //超过1.5方向调转
        if (sprite.material.opacity >= 1) {
          sprite.userData.dir = false;
          sprite.userData.minSize -= 0.05;
          sprite.scale.set(sprite.userData.minSize, sprite.userData.minSize, 1);
          sprite.material.opacity -= sprite.userData.flashSpeedHide;
          return;
        }
        // 隐藏
        if (sprite.material.opacity > 0 && sprite.userData.dir === false) {
          sprite.material.opacity -= sprite.userData.flashSpeedHide;
          sprite.userData.minSize -= 0.05;
          sprite.scale.set(sprite.userData.minSize, sprite.userData.minSize, 1);
          return;
        }
        // 重置
        if (sprite.material.opacity <= 0 && sprite.userData.dir === false) {
          // sprite.material.opacity = randomNum(-12, -8, 2);
          sprite.material.opacity = sprite.userData.flashType
            ? randomNum(-12, -8, 2)
            : 0;
          sprite.userData.minSize = randomNum(4, 6);
          sprite.userData.dir = true;
          return;
        }
      });
    };
    sceneAnimation.addAnimation("FloatingStar", animation);
  }
}

export default new FloatingStar();
