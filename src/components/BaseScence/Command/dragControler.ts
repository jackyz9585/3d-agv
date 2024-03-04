import Base from "./base";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import scene from "./scene/index";

class DragControler extends Base {
  controlsContainer: { [key: string]: any };

  constructor() {
    super();
    this.controlsContainer = {};
  }
  addDragControler() {
    this.removeDragControler();

    const targets = this.getTargetsByGroup(
      scene.scene,
      scene.currentGroupId as string
    ).filter((obj) => obj.userData.draggable);

    targets.forEach((target) => {
      const controlId = target.userData.id;
      const controls: DragControls = new DragControls(
        [target],
        scene.camera,
        scene.renderer.domElement
      );
      controls.transformGroup = true;
      this.controlsContainer[controlId] = controls;
    });
  }
  removeDragControler() {
    Object.values(this.controlsContainer).forEach((controls: DragControls) => {
      controls.deactivate();
      controls.dispose();
    });

    this.controlsContainer = {};
  }

  addListener(eventName, fn) {
    Object.values(this.controlsContainer).forEach((controls: DragControls) => {
      controls.addEventListener(eventName, (event) => {
        fn(event.object);
      });
    });
  }
}

export default new DragControler();
