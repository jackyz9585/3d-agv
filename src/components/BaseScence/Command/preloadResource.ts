import resource from "@/components/BaseScence/Command/resource";

// 逐层加载floor
//@ts-ignore
window.buildList.forEach((building) => {
  const floors = building.floors || [];
  floors.forEach((floor) => {
    resource.loadImage(floor.image);
  });
});

// resource.loadImage("三厂五楼.jpg");
// resource.loadImage("三厂三楼.jpg");
// resource.loadImage("二厂一楼.jpg");
// resource.loadImage("二厂三楼.jpg");
// resource.loadImage("一厂三楼.jpg");
// resource.loadImage("一厂一楼.jpg");
resource.loadImage("tkc.jpg");
resource.loadModel("Device1.glb");
