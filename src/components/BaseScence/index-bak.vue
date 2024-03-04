<template>
  <div class="wrap">
    <!-- 左上楼层切换 模式mode为view 和setting都显示-->
    <div class="switch">
      <Floor
        @select="handleSelectFloor"
        v-for="item in floors"
        :key="item.index"
        :data="item"
      />
    </div>
    <!-- 左下设备详情 模式mode为view时显示-->
    <!-- <div v-show="deviceDetail" v-if="mode === 'view'" class="info">
      <div>
        <BaseInfo class="base-info" v-if="deviceDetail" :data="deviceDetail" />
        <Status class="status" v-if="deviceDetail" :data="deviceDetail" />
      </div>
      <Description
        class="description"
        v-if="alarmList.length"
        :data="alarmList"
      />
    </div>
    <div class="avg-oee" v-show="avgOeeDetail" v-if="mode === 'view'">
      <AvgOee v-if="avgOeeDetail" :data="avgOeeDetail" />
    </div> -->
    <!-- 右侧统计 模式mode为view时显示 -->
    <!-- <div class="total" v-if="mode === 'view'">
      <TotalWrap
        :statusKeys="statusKeys"
        :spreadIndex="spreadIndex"
        :totalData="totalData"
        :deviceData="deviceData"
        @changeEqpStatus="handleChangeEqpStatus"
        @confirmFilter="handleFilter"
        :deviceFilter="deviceFilter"
      />
    </div> -->
    <!-- 新增、编辑、删除设备  模式mode为setting时显示 -->
    <div class="setting" v-if="mode === 'setting'">
      <el-button type="primary" @click="handleAddDevice">新增设备</el-button>
      <br />
      <br />
      <el-button type="primary" @click="handleShowAxis">{{
        axisVisible ? "隐藏坐标" : "显示坐标"
      }}</el-button>
    </div>
    <SettingDialog
      ref="SettingDialog"
      :dialogMode="dialogMode"
      :dialogVisible.sync="dialogVisible"
      :rectValidator="rectValidator"
      :currentFloor="currentFloor"
      @updateRender="handleUpdate"
    />
    <!-- 3D场景 模式mode为view 和setting都显示-->
    <div id="main"></div>
    <!-- 关闭按钮 模式mode为view 和setting都显示-->
    <div
      class="close-btn"
      @click="backHome"
      @keyup.enter="backHome"
      tabindex="0"
    ></div>
    <div class="loading" v-if="loading">
      <div id="loading-container">
        <div class="spinner">
          <div class="rect1"></div>
          <div class="rect2"></div>
          <div class="rect3"></div>
          <div class="rect4"></div>
          <div class="rect5"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Floor from "../Floor/index.vue";

import TotalWrap from "../Total/TotalWrap.vue";
import SettingDialog from "../SettingDialog/index.vue";

import { statusEnum } from "./config.js";

import Detail from "../Detail";

import command3d from "./Command";
import { buildGroup } from "./dataAdaptor";
import RectValidator from "./rectValidator";
import { groupBy } from "lodash";
import { getFloorSizeById } from "./dataAdaptor";

import {
  getDeviceList,
  getDeviceDetail,
  judgeDevice,
  getAvgOee,
} from "@/server/publicApi";

export default {
  name: "BaseScence",
  components: {
    Floor,
    // Area,
    TotalWrap,
    SettingDialog,
    Description: Detail.Description,
    Status: Detail.Status,
    BaseInfo: Detail.BaseInfo,
    AvgOee: Detail.AvgOee,
  },
  props: {
    currentBuild: {
      type: Object,
      default: () => ({}),
    },
    mode: {
      validator: function(value) {
        // 这个值必须匹配下列字符串中的一个
        return ["view", "setting"].indexOf(value) !== -1;
      },
    },
  },
  watch: {
    $route: {
      handler() {
        try {
          command3d.scene.clearScence();
        } catch (e) {}
        this.initBaseScence();
      },
      immediate: true,
      deep: true,
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
      initFlag: true,
      loading: false,
      deviceData: [],
      deviceFilter: {}, //设备筛选条件
      axisVisible: false, //显示轴
    };
  },

  methods: {
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
    createTotal(deviceData) {
      this.totalData = this.statusKeys.map((k) => {
        const devices = (deviceData || []).filter((d) => {
          return k === "ALL" ? true : d.status === k;
        });
        // 根据stepName分组
        const data = groupBy(devices, "stepName");
        return {
          type: k,
          num: devices.length,
          list: Object.keys(data)
            .filter((stepName) => stepName !== "undefined")
            .map((stepName) => {
              return {
                stepName,
                count: data[stepName].length,
              };
            }),
        };
      });
    },
    // 右侧统计信息赋值
    handleUpdateTotal(res) {
      // 保证组件被重置
      this.totalData = [];
      this.$nextTick(() => {
        const { deviceInfo: deviceData } = res.data;
        // 根据已有条件过滤设备
        const devices = this.filterDevices(deviceData);
        this.createTotal(devices);
        //TODO  使用原来的total
        // this.totalData = window._.get(res, "data.results", []);
      });
    },
    // 全量刷新 设备相关变量重置
    resetDevicesVars() {
      this.spreadIndex = "ALL";
      this.deviceDetail = null;
      this.alarmList = [];
    },
    //切换楼层 重置设备相关变量 及初始化变量
    resetFloorVars() {
      this.resetDevicesVars();
      this.timeStamp = "";
      this.initFlag = true;
      this.axisVisible = false;
    },
    // 初始化3d场景
    init() {
      if (this.currentFloor) {
        //查询当前厂部当前楼层的设备
        console.log("调用接口", this.currentFloor.name);
        // // // 初始化校验器
        // const deviceData = window.deviceList
        // this.initRectValidator(deviceData)
        // // 初始化场景渲染
        // this.initRender(deviceData)
        // return
        const params = {
          locationMark: this.currentFloor.name,
        };
        this.loading = true;
        getDeviceList(params).then((res) => {
          if (res.flag) {
            this.deviceData = window._.get(res, "data.deviceInfo", []);
            // 右侧统计信息赋值
            this.handleUpdateTotal(res);
            // 初始化校验器
            this.initRectValidator();
            // 初始化场景渲染
            this.initRender();
            // 绑定resize  弃用
            // this.addResize();
            // 初始化轮询器
            this.addLoop();
            this.loading = false;
          }
        });
      }
    },
    // 初始化创建场景
    async initRender() {
      const dom = document.getElementById("main");
      dom.innerHTML = "";
      const currentFloor = this.currentFloor;
      const { floor, devices } = buildGroup(currentFloor, this.deviceData);
      const floorData = {
        groupId: currentFloor.id,
        geometryConfig: floor,
      };
      const groupData = {
        groupId: currentFloor.id,
        geometries: devices,
      };
      if (this.mode === "view") {
        await command3d.scene.initView(dom);
        await command3d.floor.drawFloorsByGroup(floorData);
        await command3d.device.drawDevicesByGroup(groupData);
        await command3d.mark.drawTextByGroup(floorData);
        await command3d.area.drawAreaByGroup(floorData);

        command3d.device.addMouseclick((mesh) => {
          if (mesh && mesh.type === "device") {
            this.handleSwitchDevice(mesh);
          } else {
            this.deviceDetail = null;
            this.alarmList = [];
          }
        });
        command3d.device.addMousemove();
        command3d.area.addMouseclick();
        command3d.area.addMousemove();
        //TODO 新二楼展示agv
        if (this.$route.query.fid === "BNF2") {
          command3d.agv.drawAgv(this.currentFloor);
        }
      } else {
        await command3d.scene.initSetting(dom);
        await command3d.floor.drawFloorsByGroup(floorData);

        await command3d.device.drawDevicesByGroup(groupData);
        await command3d.mark.drawTextByGroup(floorData);
        await command3d.area.drawAreaByGroup(floorData);
        await command3d.device.addMouseclick((mesh) => {
          if (mesh && mesh.type === "device") {
            this.handleSwitchDevice(mesh);
          } else {
            this.deviceDetail = null;
            this.alarmList = [];
          }
        });
        await command3d.device.addMousemove();
      }
      // 触发查询条件
      command3d.device.filterMeshByFields(
        this.currentFloor.id,
        this.deviceFilter
      );
    },
    // 更新场景数据，供接口轮询、楼层切换回调使用
    async updateRender() {
      const currentFloor = this.currentFloor;
      const { floor, devices } = buildGroup(currentFloor, this.deviceData);
      const floorData = {
        groupId: currentFloor.id,
        geometryConfig: floor,
      };
      const groupData = {
        groupId: currentFloor.id,
        geometries: devices,
      };
      await command3d.scene.clearGroups();
      await command3d.floor.drawFloorsByGroup(floorData);
      await command3d.device.drawDevicesByGroup(groupData);
      await command3d.mark.drawTextByGroup(floorData);
      await command3d.area.drawAreaByGroup(floorData);
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
        const deviceCode = window._.get(userData, "originData.deviceCode");
        const params = {
          deviceCode: deviceCode,
          locationMark: this.currentFloor.name,
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
      this.axisVisible = false;
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
      } else {
        this.resetFloorVars();
        // 更新active 楼层
        this.floors.forEach((f) => {
          f.active = false;
        });
        currentFloor.active = true;
        this.currentFloor = currentFloor;
        const params = {
          locationMark: this.currentFloor.name,
        };
        this.loading = true;
        getDeviceList(params).then((res) => {
          if (res.flag) {
            this.deviceData = window._.get(res, "data.deviceInfo", []);
            // 右侧统计信息赋值
            this.handleUpdateTotal(res);
            // 更新渲染
            this.updateRender();
            // 初始化校验器
            this.initRectValidator();
            // 初始化轮询器
            this.addLoop();
            this.loading = false;
          }
        });
      }
    },
    // 设备变更 新增 删除 改变位置等触发
    handleUpdate(previousDeviceCode) {
      this.previousDeviceCode = previousDeviceCode;
      const params = {
        locationMark: this.currentFloor.name,
      };
      // 从数据库实时拿数据  调用单独接口
      this.loading = true;
      getDeviceList(params).then((res) => {
        if (res.flag) {
          this.deviceData = window._.get(res, "data.deviceInfo", []);

          // 右侧统计信息赋值
          this.handleUpdateTotal(res);
          // 更新渲染
          this.updateRender();
          // 初始化校验器
          this.initRectValidator();
          // 初始化轮询器
          this.addLoop();
          this.loading = false;
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
      command3d.scene.clearScence();
      this.$emit("backHome");
    },

    // 添加轮询器
    addLoop() {
      this.handleLoop();
      this.handleAvgOee();
      this.$once("hook:destroyed", () => {
        clearTimeout(this.timer);
        this.timer = null;
      });
    },
    handleLoop() {
      const judgeParams = {
        locationMark: this.currentFloor.name,
        timeStamp: this.timeStamp, //初始化时间戳为空
      };
      // console.log('轮询', this.currentFloor.name)
      judgeDevice(judgeParams).then((res) => {
        this.timeStamp = res.timeStamp || "";
        const judgeRes = res;
        // flag true 需要刷新
        if (judgeRes.flag) {
          this.resetDevicesVars();
          // 情况1、refresh为all 全量刷新  设备出现增删，布局变化（改）
          if (judgeRes.refresh === "all") {
            // 初始化initFlag为true  及时得到全量刷新也不用刷，防止重复调用
            if (this.initFlag) {
              this.initFlag = false;
            } else {
              console.log("全量刷新");
              const params = {
                locationMark: this.currentFloor.name,
              };
              this.loading = true;
              getDeviceList(params).then((res) => {
                if (res.flag) {
                  this.deviceData = window._.get(res, "data.deviceInfo", []);
                  this.updateRender();
                  // 右侧统计信息赋值
                  this.handleUpdateTotal(res);
                }
                this.loading = false;
              });
            }
          } else {
            //情况2、 refresh为partial  增量刷新  局部更新设备状态和统计情况
            console.log("增量刷新");
            const changeDevices = window._.get(judgeRes, "data.deviceInfo", []);
            command3d.device.changeMeshesStatus(changeDevices);
            // 右侧统计信息赋值
            if (judgeRes.results) {
              this.handleUpdateTotal(judgeRes);
            }
          }
        }
        clearTimeout(this.timer);
        this.timer = null;
        this.timer = setTimeout(() => {
          this.handleLoop();
        }, 10000);
      });
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
    // 改变查询条件，触发设备过滤
    handleFilter(filter) {
      this.deviceFilter = { ...filter };
      // 更新3d场景设备数据
      command3d.device.filterMeshByFields(this.currentFloor.id, filter);
      // 更新total 将筛选后的设备传入total组件
      const devices = this.filterDevices(this.deviceData);
      // 保证组件被重置
      this.totalData = [];
      this.$nextTick(() => {
        this.createTotal(devices);
      });
      this.handleAvgOee(filter);
    },
    handleAvgOee(data) {
      this.avgOeeDetail = null;
      const param = {
        factoryCode: this.currentFloor.name,
        stepName: data ? data.stepName : "",
        deviceType: data ? data.deviceType : "",
        lotId: data ? data.lotId : "",
      };
      getAvgOee(param)
        .then((res) => {
          this.avgOeeDetail = res || {};
        })
        .catch(() => {});
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
  },
};
</script>
<style lang="scss" scoped>
#main {
  height: 99%;
  width: 100%;
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
}
.wrap {
  width: 100vw;
  height: 100vh;
  background-image: url(../../assets/bg.png);
  background-size: cover;
  // min-height: 800px;
  // position: relative;
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  background-image: url(../../assets/close.png);
  background-size: cover;
  cursor: pointer;
  width: 0.4rem;
  height: 0.4rem;
  // width: 40px;
  // height: 40px;
}
.loading {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  #loading-container {
    position: fixed;
    z-index: 1000;
    width: 100%;
    height: 100%;
    background: rgb(255, 255, 255, 0.3);
  }
  .spinner {
    position: relative;
    top: 40%;
    left: 50%;
    z-index: 10;
    width: 50px;
    height: 60px;
    font-size: 10px;
    text-align: center;
  }

  .spinner > div {
    display: inline-block;
    width: 6px;
    height: 100%;
    background-color: #2d89fe;
    -webkit-animation: stretchdelay 1.2s infinite ease-in-out;
    animation: stretchdelay 1.2s infinite ease-in-out;
  }

  .spinner .rect2 {
    -webkit-animation-delay: -1.1s;
    animation-delay: -1.1s;
  }

  .spinner .rect3 {
    -webkit-animation-delay: -1s;
    animation-delay: -1s;
  }

  .spinner .rect4 {
    -webkit-animation-delay: -0.9s;
    animation-delay: -0.9s;
  }

  .spinner .rect5 {
    -webkit-animation-delay: -0.8s;
    animation-delay: -0.8s;
  }

  @-webkit-keyframes stretchdelay {
    0%,
    40%,
    100% {
      -webkit-transform: scaleY(0.4);
    }
    20% {
      -webkit-transform: scaleY(1);
    }
  }

  @keyframes stretchdelay {
    0%,
    40%,
    100% {
      -webkit-transform: scaleY(0.4);
      transform: scaleY(0.4);
    }
    20% {
      -webkit-transform: scaleY(1);
      transform: scaleY(1);
    }
  }
}
</style>
