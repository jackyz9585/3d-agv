import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ImageTexture } from "./types/resource";

class Resource {
  materialConfContainer: { [key: string]: ImageTexture };
  modelContainer: { [key: string]: THREE.scene };

  constructor() {
    this.materialConfContainer = {};
    this.modelContainer = {};
  }

  // 根据几何体的图片信息 预处理图片加载，构建promise
  loadImage(image: string): Promise<ImageTexture> {
    const cache: ImageTexture | undefined = this.materialConfContainer[image];
    if (cache) {
      //   console.log(`已经加载过纹理，从缓存取${image}`);
      return Promise.resolve(cache);
    }
    return new Promise((resolve, reject) => {
      // const img = require(`../../../assets/${geometry.material.image}`);
      // 图片名从public下取，传绝对路径给loader
      const ImageLoader = new THREE.ImageLoader();
      ImageLoader.load(
        //@ts-ignore
        `/${window.PUBLIC_PATH}/${image}`,
        (img) => {
          const texture = new THREE.Texture(img);
          // 下次使用纹理时触发更新
          texture.needsUpdate = true;
          const materialConf: ImageTexture = {
            map: texture,
          };
          this.materialConfContainer[image] = materialConf;
          resolve(materialConf);
        },
        null,
        (e) => {
          reject(e);
        }
      );
    });
  }
  // 加载模型
  loadModel(file: string): Promise<THREE.scene> {
    const cache: THREE.scene | undefined = this.modelContainer[file];
    if (cache) {
      //   console.log(`已经加载过模型，从缓存取${file}`);
      return Promise.resolve(cache);
    }
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.load(file, (obj: THREE.scene) => {
        this.modelContainer[file] = obj;
        resolve(obj);
      });
    });
  }
}
export default new Resource();
