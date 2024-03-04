<!--设备总数-->
<template>
  <div class="overview panel">
    <div class="top">
      <span class="eqp-num">
        <img
          v-for="(item, index) in getEqpTotal(this.eqpTotal)"
          :key="index"
          :src="item.url"
          alt=""
        />
      </span>
    </div>
    <div class="title">
      <img src="../../assets/img/icon-shebeizhuangtai.png" alt="" />
    </div>
    <div class="status-list">
      <div
        class="status-container"
        v-for="(item, index) in overview"
        :key="index"
      >
        <span>
          <img class="status-icon" :src="item.imgUrl" alt="" />
        </span>
        <span class="status" :style="{ color: item.color }">{{
          item.status
        }}</span>
        <span class="num">{{ item.num }}</span>
        <span class="unit">台</span>
      </div>
    </div>
  </div>
</template>

<script>
import { statusEnum } from "../../components/BaseScence/config";
import { inspectionEqp } from "@/server/publicApi";
export default {
  name: "Overview",
  data() {
    return {
      imgUrlList: [
        { url: require("../../assets/img/icon-zero.png") },
        { url: require("../../assets/img/icon-one.png") },
        { url: require("../../assets/img/icon-two.png") },
        { url: require("../../assets/img/icon-three.png") },
        { url: require("../../assets/img/icon-four.png") },
        { url: require("../../assets/img/icon-five.png") },
        { url: require("../../assets/img/icon-six.png") },
        { url: require("../../assets/img/icon-seven.png") },
        { url: require("../../assets/img/icon-eight.png") },
        { url: require("../../assets/img/icon-nine.png") },
      ],
      viewImg: [
        { url: require("../../assets/img/icon-one.png") },
        { url: require("../../assets/img/icon-two.png") },
        { url: require("../../assets/img/icon-three.png") },
      ],
      overview: [
        {
          status: "RUN",
          num: 0,
          color: statusEnum["RUN"].base,
          imgUrl: require("../../assets/img/icon-yunxing.png"),
        },
        {
          status: "IDLE",
          num: 0,
          color: statusEnum["IDLE"].base,
          imgUrl: require("../../assets/img/icon-idle.png"),
        },
        {
          status: "OFFLINE",
          num: 0,
          color: statusEnum["OFFLINE"].base,
          imgUrl: require("../../assets/img/icon-off_line.png"),
        },
      ],
      eqpTotal: "",
      timer: null,
    };
  },
  computed: {},
  created() {
    this.getEqpData();
  },
  methods: {
    // 计算设备数量图片
    getEqpTotal(num) {
      let imgList = [];
      for (let int = 0; int < num.length; int++) {
        imgList.push(this.imgUrlList[+num[int]]);
      }
      return imgList;
    },
    // 获取设备数据
    getEqpData() {
      let param = {};
      let num = null;
      inspectionEqp(param)
        .then((res) => {
          if (res) {
            this.overview.forEach((item) => {
              res.forEach((map) => {
                if (map.name === item.status) {
                  item.num = map.value;
                  num += +map.value;
                }
              });
            });
            this.eqpTotal = num + "";
            this.setTimer();
          }
        })
        .catch(() => {});
    },
    //  定时器
    setTimer() {
      this.timer = setTimeout(() => {
        this.getEqpData();
      }, 60000);
    },
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  },
};
</script>

<style lang="scss" scoped>
.panel {
  box-sizing: border-box;
  padding: 0.4rem 0.2rem 0.2rem;
  width: 4.7rem;
  height: 2.4rem;
  color: #fff;
  margin-bottom: 0.2rem;
  .top {
    width: 4.7rem;
    height: 0.6rem;
    background: url("../../assets/img/eqp-total.png") no-repeat center;
    background-size: 3.8rem;
    position: relative;
    .eqp-num {
      position: absolute;
      top: -0.1rem;
      left: 1.8rem;
    }
    img {
      width: 0.36rem;
      margin-left: 0.08rem;
    }
  }
  .title {
    img {
      width: 1.7rem;
    }
  }
  .status-list {
    display: flex;
    flex-wrap: wrap;
    margin-top: 0.2rem;
    .status-icon {
      width: 0.2rem;
      height: 0.2rem;
    }
    & > div {
      width: 2rem;
      display: flex;
      align-items:  flex-end;
      span {
        margin-left: 0.1rem;
      }
    }
    .status {
      font-size: 0.16rem;
      font-weight: bold;
    }
    .num {
      font-size: 0.24rem;
      font-weight: bold;
      margin-left: 0.2rem;
    }
    .unit {
      font-size: 0.14rem;
      color: #bbb3b3;
    }
  }
}
</style>