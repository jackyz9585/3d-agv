<template>
  <div class="wrap">
    <BaseHeader
      ref="BaseHeader"
      :floors="floors"
      @select="handleSelectFloor"
      @backHome="backHome"
    >
    </BaseHeader>
    <!-- 左上楼层切换 模式mode为view 和setting都显示-->
    <div class="switch">
      <Floor
        @select="handleSelectFloor"
        v-for="item in floors"
        :key="item.index"
        :data="item"
      />
    </div>
    <!-- 新增、编辑、删除设备  模式mode为setting时显示 -->
    <div class="setting" v-if="mode === 'setting'">
      <!-- <div>
        <el-button type="primary" @click="handleAddDevice" :disabled="dragMode"
          >新增设备</el-button
        >
      </div> -->
      <div>
        <el-button type="primary" @click="handleShowAxis">{{
          axisVisible ? "隐藏坐标" : "显示坐标"
        }}</el-button>
      </div>
      <div>
        <span class="label">拖拽模式</span>
        <el-switch v-model="dragMode"></el-switch>
      </div>
      <div v-show="dragMode && dragViewPosition.x">
        <span class="text">X:{{ parseInt(dragViewPosition.x) }}</span>
        <span class="text">Y:{{ parseInt(dragViewPosition.y) }}</span>
      </div>
    </div>
    <!-- <SettingDialog
      ref="SettingDialog"
      :dialogMode="dialogMode"
      :dialogVisible.sync="dialogVisible"
      :rectValidator="rectValidator"
      :currentFloor="currentFloor"
      @updateRender="handleUpdate"
    /> -->
    <!-- 3D场景 模式mode为view 和setting都显示-->
    <canvas id="main"></canvas>

    <Loading :loading="loading" />
    <template>
      <Widget
        v-for="(widget, index) in widgetData"
        :key="index"
        :widget="widget"
        :ref="widget.id"
      />
    </template>
  </div>
</template>

<script lang="ts">
import Floor from "../Floor/index.vue";

import SettingDialog from "../SettingDialog/index.vue";

import { statusEnum } from "./config";

import Loading from "../Loading/index.vue";
import command3d from "./Command";
import { buildGroup } from "./dataAdaptor";
import RectValidator from "./rectValidator";
import {
  inverseXAdaptor,
  inverseYAdaptor,
  getFloorSizeById,
} from "./dataAdaptor";

import {
  getDeviceList,
  getDeviceDetail,
  judgeDevice,
  getCTUAGV,
  getDockingStatus
} from "@/server/publicApi";

import { GroupFloorData, GroupDeviceData } from "./types";

import { get } from "lodash";
import BaseHeader from "@/components/BaseHeader/index.vue";
import Widget from "@/components/Widget/index.vue";
import { widgetData } from "@/components/Widget/widgetData";

export default {
  name: "BaseScence",

  components: {
    Floor,
    SettingDialog,
    Loading,
    BaseHeader,
    Widget,
  },

  props: {
    currentBuild: {
      type: Object,
      default: () => ({}),
    },
    mode: {
      validator: function (value) {
        // 这个值必须匹配下列字符串中的一个
        return ["view", "setting"].indexOf(value) !== -1;
      },
    },
  },

  data() {
    return {
      // 设备明细
      deviceDetail: null,
      // 平均OEE MTBA数据
      avgOeeDetail: null,
      alarmList: [],
      statusKeys: Object.keys(statusEnum),
      spreadIndex: "ALL",
      floors: [],
      totalData: [],
      currentFloor: null,
      dialogVisible: false,
      dialogMode: "add",
      rectValidator: null, //设备列表校验器实例
      //前端：轮询接口穿时间戳参数。每次初始化将其置空，首次调用穿空，接口返回：不更新|全量更新|增量更新。下次调用使用上一次接口返回的时间戳。
      //后端：设备每次增删改更新数据库、更新redis。启动定时任务更新redis。每次从前端拿到时间戳和当前redis ts比较。
      //1、拿到时间戳若早于ts则通知全量刷新
      //2、若相等则说明前端的设备数据是最新的，进一步对当前redis的数据和近一次的redis数据进行比较，若设备状态发生变化则将差量返给前端，通知增量更新，若一致则通知不更新
      timeStamp: "",
      actived: true,
      loading: false,
      deviceData: [],
      deviceFilter: {}, //设备筛选条件
      axisVisible: false, //显示轴
      interval: 1000, //动画间隔
      dragMode: false,
      dragViewPosition: {
        x: "",
        y: "",
      },
      dragStart3dPosition: {
        x: 0,
        z: 0,
      },
      widgetData: widgetData,
    };
  },

  watch: {
    $route: {
      handler() {
        try {
          this.disposeBaseScence();
        } catch (e) {}
        this.actived = true;
        this.timeStamp = "";
        // 初始化agv图表
        this.drawAgvWidget([]);
        this.initBaseScence();
        // this.floorCarousel()
      },
      immediate: true,
      deep: true,
    },
    // 检测拖拽模式变化
    dragMode(v) {
      this.handleChangeDragMode(v);
    },
  },
  beforeDestroy() {
    this.disposeBaseScence();
  },
  methods: {
    floorCarousel() {
      clearTimeout(this.floorCarouselTimer);
      this.floorCarouselTimer = setTimeout(() => {
        const index = this.floors.findIndex((floor) => floor.active);
        const nextFloor = this.floors[(index + 1) % this.floors.length];
        // console.log("nextFloor", nextFloor.name);
        if (this.$refs.BaseHeader) {
          this.$refs.BaseHeader.handleChange(nextFloor.id);
        }
      }, 10000);
    },
    disposeBaseScence() {
      command3d.scene.clearScence();
      clearTimeout(this.initTimer);
      this.initTimer = null;
      this.actived = false;
    },
    initBaseScence() {
      this.floors = (this.currentBuild.floors || [])
        .map((f, i) => ({
          ...f,
          active: false,
        }))
        .reverse();
      this.currentFloor = this.floors[0];
      const fid = this.$route.query.fid;
      if (fid) {
        const defaultFloor = this.floors.find((floor) => floor.id === fid);
        if (defaultFloor) {
          this.currentFloor = defaultFloor;
        }
      }
      this.currentFloor.active = true;

      this.init();
    },
    initRectValidator() {
      const { plantWidth, plantHeight } = getFloorSizeById(
        this.currentFloor.parentId,
        this.currentFloor.id
      );
      this.rectValidator = new RectValidator(
        this.deviceData,
        plantWidth,
        plantHeight
      );
    },
    // 全量刷新 设备相关变量重置
    resetDevicesVars() {
      this.spreadIndex = "ALL";
      this.deviceDetail = null;
      this.alarmList = [];
    },
    // 初始化3d场景 静态物体
    async init() {
      // 初始化场景渲染
      if (this.currentFloor) {
        // 获取静态物体  货柜、工作台
        this.loading = true;
        command3d.scene.pauseRenderStack();
        const params = {
          locationMark: this.currentFloor.id,
        };
        const deviceRes = await getDeviceList(params);

        if (deviceRes.flag) {
          this.deviceData = get(deviceRes, "data.deviceInfo", []);
          await this.initRender();
          // 初始化校验器
          this.initRectValidator();
          // 获取小车
          command3d.dynamicObject.initDynamicObject();
          this.loadDynamic();
        }
       
        
      }
    },
    // 初始化动态场景 CTU AGV 接驳位
    async loadDynamic() {
      try {
        const params = {
          locationMark: this.currentFloor.id,
        };
        const dynamicRes = await getCTUAGV(params);
        if (dynamicRes.success) {
          this.drawAgvWidget(dynamicRes.data);
          //防止退出后执行
          if (this.actived) {
            // console.log(
            //   dynamicRes.data[0].x,
            //   "x--y",
            //   dynamicRes.data[0].y,
            //   "direction",
            //   dynamicRes.data[0].direction
            // );
            // 初始化创建模型
            await command3d.dynamicObject.loadDynamicObject(dynamicRes);
            // 触发自动门动画
            command3d.fixedObject.callDoorAnimation(
              this.currentFloor.id,
            );
          }
        }
        const dockingRes = await getDockingStatus({})
        if(dockingRes.success){
          command3d.fixedObject.changeMeshesStatus(dockingRes.data)
        }
      } catch (e) {}

      // 初始化轮询器
      if (this.actived) {
        clearTimeout(this.initTimer);
        this.initTimer = setTimeout(() => {
          //防止退出后执行
          this.loadDynamic();
        }, this.interval);
      }
    },
    // 初始化创建场景
    async initRender() {
      this.axisVisible = false;
      this.dragMode = false;
      this.dragViewPosition = {
        x: "",
        y: "",
      };
      const dom = document.getElementById("main");
      const currentFloor = this.currentFloor;
      const { floor, devices, fixedObject } = buildGroup(
        currentFloor,
        this.deviceData
      );
      
      const floorData: GroupFloorData = {
        groupId: currentFloor.id,
        geometryConfig: floor,
      };
      const groupData: GroupDeviceData = {
        groupId: currentFloor.id,
        geometries: devices,
      };
      if (this.mode === "view") {
        await command3d.scene.initView(dom);
        await command3d.floor.drawFloorsByGroup(floorData);
        // await command3d.device.drawDevicesByGroup(groupData);
        await command3d.mark.drawTextByGroup(floorData);
        await command3d.area.drawAreaByGroup(floorData);

        // command3d.device.addMouseclick((mesh) => {
        //   if (mesh && mesh.type === "device") {
        //     this.handleSwitchDevice(mesh);
        //   } else {
        //     this.deviceDetail = null;
        //     this.alarmList = [];
        //   }
        // });
        // command3d.device.addMousemove();

        await command3d.fixedObject.drawDevicesByGroup({
          groupId: currentFloor.id,
          geometries: fixedObject,
        });
        command3d.area.addMouseclick();
        command3d.area.addMousemove();
      } else {
        await command3d.scene.initSetting(dom);
        await command3d.floor.drawFloorsByGroup(floorData);

        // await command3d.device.drawDevicesByGroup(groupData);
        await command3d.mark.drawTextByGroup(floorData);
        await command3d.area.drawAreaByGroup(floorData);
        await command3d.fixedObject.drawDevicesByGroup({
          groupId: currentFloor.id,
          geometries: fixedObject,
        });
        // await command3d.device.addMouseclick((mesh) => {
        //   if (mesh && mesh.type === "device") {
        //     this.handleSwitchDevice(mesh);
        //   } else {
        //     this.deviceDetail = null;
        //     this.alarmList = [];
        //   }
        // });
        // await command3d.device.addMousemove();
      }
      // // 触发查询条件
      // command3d.device.filterMeshByFields(
      //   this.currentFloor.id,
      //   this.deviceFilter
      // );
      setTimeout(() => {
        this.loading = false;
        // 触发场景动画，开始渲染
        command3d.scene.callRenderStack();
      }, 0);
    },
    // 更新场景数据，供接口轮询、楼层切换回调使用
    async updateRender() {
      const currentFloor = this.currentFloor;
      const { floor, devices } = buildGroup(currentFloor, this.deviceData);
      const floorData: GroupFloorData = {
        groupId: currentFloor.id,
        geometryConfig: floor,
      };
      const groupData: GroupDeviceData = {
        groupId: currentFloor.id,
        geometries: devices,
      };
      await command3d.scene.clearGroups();
      await command3d.floor.drawFloorsByGroup(floorData);
      await command3d.device.drawDevicesByGroup(groupData);
      await command3d.mark.drawTextByGroup(floorData);
      await command3d.area.drawAreaByGroup(floorData);
      console.log("update");
      await command3d.device.addMouseclick((mesh) => {
        if (mesh && mesh.type === "device") {
          this.handleSwitchDevice(mesh);
        } else {
          this.deviceDetail = null;
          this.alarmList = [];
        }
      });
      await command3d.device.addMousemove();
      if (this.mode === "view") {
        command3d.area.addMouseclick();
        command3d.area.addMousemove();
      }
      // 新增、编辑后激活操作设备
      if (this.previousDeviceCode) {
        command3d.device.setActiveMeshByDeviceCode(this.previousDeviceCode);
      }
      // 触发查询条件
      command3d.device.filterMeshByFields(
        this.currentFloor.id,
        this.deviceFilter
      );
      // 设备更新后，保持坐标轴、拖拽模式
      if (this.dragMode) {
        this.handleChangeDragMode(true);
      }
      if (this.axisVisible) {
        this.axisVisible = false;
        this.handleShowAxis();
      }
      setTimeout(() => {
        this.loading = false;
        command3d.scene.callRenderStack();
      }, 0);
    },
    // 切换设备回调
    handleSwitchDevice(mesh) {
      const userData = mesh.data.userData;
      // 查询模式显示设备详情
      if (this.mode === "view") {
        //排除掉筛选状态隐藏的设备
        console.log("点击了设备", userData);
        this.deviceDetail = null;
        this.alarmList = [];
        const deviceCode = get(userData, "originData.deviceCode");
        const params = {
          deviceCode: deviceCode,
          locationMark: this.currentFloor.id,
        };
        getDeviceDetail(params).then((res) => {
          if (res.flag) {
            if (res.data) {
              this.deviceDetail = res.data.deviceInfos || {};
              this.alarmList = res.data.alarmInfos || [];
            }
          }
        });
      } else {
        if (this.dragMode) {
          return;
        }
        // 配置模式打开编辑弹框
        const positionX = userData.originData.positionX;
        const positionY = userData.originData.positionY;

        // const deviceX = userData.originData.deviceX;
        // const deviceY = userData.originData.deviceY;

        const originDeviceX = userData.originData.originDeviceX;
        const originDeviceY = userData.originData.originDeviceY;

        const deviceData = {
          deviceCode: userData.originData.deviceCode,
          rotateFlag: userData.originData.rotateFlag,
          posx: Number(positionX),
          posy: Number(positionY),
          //表单中的显示宽高，使用原始数据，不使用渲染数据，校验也是用原始数据
          sizew: Number(originDeviceX),
          sizeh: Number(originDeviceY),
          // osizew: Number(originDeviceX),
          // osizeh: Number(originDeviceY),
          deviceType: userData.originData.deviceType,
          model: userData.originData.model,
        };

        this.handleEditDevice();
        this.$nextTick(() => {
          this.$refs.SettingDialog &&
            this.$refs.SettingDialog.getData(deviceData);
        });
      }
    },
    // 切换楼层
    handleSelectFloor(currentFloor) {
      clearTimeout(this.timer);
      clearTimeout(this.initTimer);
      this.timer = null;
      this.initTimer = null;
      //URL模式直接触发路由变化 否则走原逻辑
      if (this.$route.query.bid) {
        // url更新
        this.$router
          .push({
            name: this.$route.name,
            query: {
              bid: this.$route.query.bid,
              fid: currentFloor.id,
            },
          })
          .catch((e) => {});
      }
    },
    // 设备变更 新增 删除 改变位置等触发
    handleUpdate(previousDeviceCode) {
      this.previousDeviceCode = previousDeviceCode;
      const params = {
        locationMark: this.currentFloor.id,
      };
      // 从数据库实时拿数据  调用单独接口
      this.loading = true;
      command3d.scene.pauseRenderStack();
      getDeviceList(params).then((res) => {
        if (res.flag) {
          this.deviceData = get(res, "data.deviceInfo", []);

          // 更新渲染
          this.updateRender();
          // 初始化校验器
          this.initRectValidator();
          // 初始化轮询器
          this.addLoop();
        }
      });
    },
    // 切换查看的设备状态
    handleChangeEqpStatus(value) {
      this.spreadIndex = value;
      // 筛选当前状态的设备 去掉切换效果
      if (value === "ALL") {
        command3d.device.filterMeshByFields(this.currentFloor.id, {
          ...this.deviceFilter,
        });
      } else {
        command3d.device.filterMeshByFields(this.currentFloor.id, {
          ...this.deviceFilter,
          status: value,
        });
      }
    },
    backHome() {
      this.disposeBaseScence();
      this.$emit("backHome");
    },

    // 添加轮询器,调度动画
    async addLoop() {
      try {
        const currentFloorId = this.currentFloor.id;
        const params = {
          locationMark: currentFloorId,
        };
        const dynamicRes = await getCTUAGV(params);
        if (!dynamicRes.success) return;
        this.drawAgvWidget(dynamicRes.data);
        //优化，轮询过程可能楼层切换了，currentFloor如果变化了退出函数
        if (currentFloorId !== this.currentFloor.id) {
          return;
        }
        //调度小车
        command3d.dynamicObject.moveDynamicObject(dynamicRes);
      } catch (e) {}

      clearTimeout(this.timer);
      this.timer = null;
      this.timer = setTimeout(() => {
        this.addLoop();
      }, this.interval);
    },
    // 显示新增设备弹框
    handleAddDevice() {
      this.dialogVisible = true;
      this.dialogMode = "add";
    },
    // 编辑设备
    handleEditDevice() {
      this.dialogVisible = true;
      this.dialogMode = "edit";
    },

    // 根据条件过滤设备
    filterDevices(deviceData = []) {
      return deviceData.filter((d) => {
        return Object.keys(this.deviceFilter).every((k) => {
          if (this.deviceFilter[k]) {
            return d[k] === this.deviceFilter[k];
          }
          return true;
        });
      });
    },
    //显示坐标轴
    handleShowAxis() {
      const { floor } = buildGroup(this.currentFloor, this.deviceData);
      const floorData = {
        groupId: this.currentFloor.id,
        geometryConfig: floor,
      };
      if (!this.axisVisible) {
        command3d.axis.showAxis(floorData);
        this.axisVisible = true;
      } else {
        command3d.axis.hideAxis(floorData);
        this.axisVisible = false;
      }
    },
    //切换拖拽模式
    handleChangeDragMode(dragMode) {
      if (dragMode) {
        //初始化
        command3d.dragControler.addDragControler();

        //添加开始拖拽事件
        const dragStartFn = (object) => {
          this.dragStart3dPosition.x = object.position.x;
          this.dragStart3dPosition.z = object.position.z;
        };
        command3d.dragControler.addListener(
          "dragstart",
          dragStartFn.bind(this)
        );

        // 添加拖拽事件
        const dragFn = (object) => {
          const { plantWidth, plantHeight } = getFloorSizeById(
            this.currentFloor.parentId,
            this.currentFloor.id
          );
          // position为物体中心点，需要转化为视图坐标系中物体左下角顶点
          const viewPosX = object.position.z;
          const viewPosY = object.position.x;

          const viewSizeX = object.userData.size.z;
          const viewSizeY = object.userData.size.x;

          const viewX = inverseXAdaptor(viewPosX, plantWidth) - viewSizeX / 2;
          const viewY = inverseYAdaptor(viewPosY, plantHeight) - viewSizeY / 2;

          this.dragViewPosition = {
            x: viewX,
            y: viewY,
          };
        };
        command3d.dragControler.addListener("drag", dragFn.bind(this));
        // 添加拖拽结束事件
        const dragEndFn = (object) => {
          if (!this.dragViewPosition.x || !this.dragViewPosition.y) {
            return;
          }
          const x = parseInt(this.dragViewPosition.x);
          const y = parseInt(this.dragViewPosition.y);

          const userData = object.userData;

          const originDeviceX = userData.originData.originDeviceX;
          const originDeviceY = userData.originData.originDeviceY;

          const deviceData = {
            deviceCode: userData.originData.deviceCode,
            rotateFlag: userData.originData.rotateFlag,
            posx: x,
            posy: y,
            //表单中的显示宽高，使用原始数据，不使用渲染数据，校验也是用原始数据
            sizew: Number(originDeviceX),
            sizeh: Number(originDeviceY),
            deviceType: userData.originData.deviceType,
            model: userData.originData.model,
          };
          // 验证体积冲突
          const { success, result } =
            this.rectValidator["editCheckOverlay"](deviceData);
          if (!success) {
            const overlapError = result.source;
            const str = `存在位置冲突，坐标范围x:${overlapError.x1},y:${overlapError.y1}px至x:${overlapError.x2},y:${overlapError.y2}已经存放了设备，设备号：${overlapError.deviceCode}`;
            this.$message.warning(str);
            // 恢复位置
            object.position.x = this.dragStart3dPosition.x;
            object.position.z = this.dragStart3dPosition.z;

            return;
          }
          //验证范围超出
          const rangeSuccess = this.rectValidator.checkRangeOut(deviceData);
          if (!rangeSuccess) {
            const str = "设备范围已超出了楼层区域";
            this.$message.warning(str);
            // 恢复位置
            object.position.x = this.dragStart3dPosition.x;
            object.position.z = this.dragStart3dPosition.z;
            return;
          }

          //掉接口保存
          // this.loading = true;
          // const params = {
          //   deviceCode: deviceData.deviceCode,
          //   positionX: deviceData.posx,
          //   positionY: deviceData.posy,
          //   rotateFlag: deviceData.rotateFlag,
          //   deviceX: deviceData.sizew,
          //   deviceY: deviceData.sizeh,
          //   deviceType: deviceData.deviceType,
          //   model: deviceData.model,
          //   locationMark: this.currentFloor.name,
          // };
          // updateDevice(params).then((res) => {
          //   if (res.flag) {
          //     this.$message.success(`位置更新成功至x:${x}, y:${y}`);
          //   } else {
          //     this.$message.warning("位置更新失败");
          //   }
          //   this.loading = false;
          // });
        };
        command3d.dragControler.addListener("dragend", dragEndFn.bind(this));
      } else {
        command3d.dragControler.removeDragControler();
      }
    },
    // 绘制agv详情表格
    drawAgvWidget(data) {
      const agvInfoList = get(this, "$refs.agvInfoList[0]", null);
      if (agvInfoList) {
        const headers = [
          {
            value: "code",
            name: "编号",
            width: 80,
          },
          {
            value: "battery",
            name: "电量",
            width: 60,
          },
          {
            value: "speed",
            name: "速度 mm/s",
            width: 150,
          },
          {
            value: "status",
            name: "状态",
            width: 150,
          },
        ];
        agvInfoList.renderChart({
          data,
          headers,
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#main {
  height: 100%;
  width: 100%;
  display: block;
}

.switch {
  position: absolute;
  padding: 10px;
}
.info {
  left: 10px;
  position: absolute;
  bottom: 140px;
  & > div {
    position: relative;
    .base-info {
      position: absolute;
      bottom: 95px;
    }
    .status {
      bottom: 0;
    }
  }
}
.avg-oee {
  width: 300px;
  position: absolute;
  bottom: 10px;
  left: 10px;
}
.base-info,
.status,
.description {
  margin-bottom: 10px;
}
.description {
  width: 748px;
}
.base-info {
  width: 300px;
}
.status {
  width: 300px;
}
.total {
  margin-right: 10px;
  width: 230px;
  position: absolute;
  right: 0;
  top: 1.5rem;
  ::v-deep .card {
    margin-top: 10px;
  }
}

.setting {
  position: absolute;
  right: 0;
  top: 1.5rem;
  border: 1px solid #2d89feab;
  box-shadow: #2d89fe 0px 0px 10px;
  background-color: rgb(4, 13, 38, 0.5);
  padding: 0.2rem;
  padding-bottom: 0;
  z-index: 999;
  .label,
  .text {
    color: #fff;
    margin-right: 0.08rem;
    display: inline-block;
  }
  .text {
    font-size: 0.16rem;
  }
  .text:last-child {
    margin-right: 0rem;
  }
  & > div {
    margin-bottom: 0.2rem;
  }
}
.wrap {
  width: 100vw;
  height: 100vh;
  background-image: url(../../assets/layout/bg.png);
  background-size: cover;
  position: relative;
}

.card {
  animation: fadeout 0.5s;
}
@keyframes fadeout {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
