import * as THREE from "three";
import TWEEN from "tween.js";

class FallingStar {
  constructor() {}
  // 流星雨
  drawFallingStar({ scene }) {
    const light = new THREE.PointLight("#2d89fe", 0.8, 600, 1);
    const group = new THREE.Group();
    group.name = "FallingStar";
    // 批量创建雨滴精灵模型
    const texture = new THREE.TextureLoader().load("/star.png");
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture, //设置精灵纹理贴图
      transparent: true,
      opacity: 1,
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(10, 20, 1);

    const tween = () => {
      const initX = Math.random() * 300;
      group.position.set(initX, Math.random() * 100 + 500, -160);
      new TWEEN.Tween(group.position)
        .to(
          {
            x: initX - 300,
            y: Math.random() * 100 - 200,
          },
          Math.random() * 3000 + 3000
        )
        .easing(TWEEN.Easing.Quadratic.In)
        .start()
        .onComplete(function () {
          tween();
        });
    };
    tween();

    group.add(sprite);
    group.add(light);

    scene.add(group);
  }
}

export default new FallingStar();
