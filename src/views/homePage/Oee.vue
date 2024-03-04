<!--OEE-->
<template>
  <div class="oee panel">
    <div class="title">
      <img src="../../assets/img/icon-OEE.png"
           alt="" />
    </div>
    <div class="content">
      <div id="oee-echarts"></div>
      <div class="data-detail">
        <div class="item-detail"
             v-for="(item, index) in detailList"
             :key="index">
          <span :style="{ borderColor: item.color }"
                class="circle"></span>
          <span class="text"
                :style="{ width: calcWidth }">{{
            item.stepName
          }}</span>
          <span class="percentage">{{ item.percentage }}%</span>
          <span class="unit-wrapper">
            <span class="number">{{ item.number }} </span>
            <span class="unit">件</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const echarts = require("echarts");
import "../../utils/dark.js";
import { inspectionOee } from "@/server/publicApi";
import _ from "lodash";
export default {
  name: "Overview",
  data () {
    return {
      echartsColorList: [],
      detailList: [],
      option: {
        tooltip: {},
        grid: {
          height: "80%",
          width: "90%",
          left: "5",
          top: "15%",
          right: "0%",
          bottom: "20%",
          containLabel: true,
        },
        // interval: 1000,
        xAxis: {
          data: [""],
        },
        yAxis: {},
        series: [],
        // 文字宽度
        widthMap: "",
      },
    };
  },
  mounted () {
    const resizeFn = _.debounce(this.handleResize, 200)
    window.addEventListener("resize", resizeFn);
    this.$once("hook:beforeDestroy", () => {
      window.removeEventListener("resize", resizeFn);
    });
    // this.initData();
    this.getOee();
  },
  computed: {
    calcWidth () {
      let byteLength = 6;
      const GBK_BYTE = 3;
      const NOMAL_BYTE = 1;
      this.detailList.forEach((item) => {
        let maxLength = null;
        for (let i = 0; i < item.stepName.length; i++) {
          let charCode = item.stepName.charCodeAt(i);
          maxLength += charCode >= 0 && charCode <= 128 ? NOMAL_BYTE : GBK_BYTE;
        }
        byteLength = maxLength > byteLength ? maxLength : byteLength;
      });

      return Math.ceil(byteLength / 3) * 0.12 + "rem";
    },
  },
  methods: {
    handleResize () {
      this.oeeEcharts && this.oeeEcharts.resize();
    },
    // 获取OEE数据
    getOee () {
      let param = {};
      inspectionOee(param).then((res) => {
        this.option.series = res.map((item) => {
          return {
            name: item.NAME,
            type: "bar",
            data: [item.NUM],
          };
        });
        this.initData();
        this.detailList = res.map((item, index) => {
          return {
            stepName: item.NAME,
            number: item.NUM,
            percentage: item.OEE,
            color: this.echartsColorList[index % 10],
          };
        });
      });
    },
    initData () {
      this.oeeEcharts = echarts.init(
        document.getElementById("oee-echarts"),
        "dark"
      );
      // 使用刚指定的配置项和数据显示图表。
      this.oeeEcharts.setOption(this.option);
      this.echartsColorList = this.oeeEcharts._theme.color;
    },
  },
};
</script>

<style lang="scss" scoped>
.panel {
  box-sizing: border-box;
  padding: 0.2rem 0.2rem 0;
  width: 4.7rem;
  height: 2.3rem;
  color: #fff;
  margin-bottom: 0.2rem;
  .title {
    img {
      width: 1.7rem;
    }
  }
  .content {
    display: flex;
    height: 2.1rem;
  }
  #oee-echarts {
    width: 2.2rem;
    height: 1.8rem;
  }
  .data-detail {
    padding: 0.1rem 0;
    width: 2.3rem;
    height: 1.6rem;
    overflow: auto;
    .item-detail {
      margin-top: 0.04rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    span {
      line-height: 0.18rem;
    }
    .circle {
      display: inline-block;
      width: 0.05rem;
      height: 0.05rem;
      border-radius: 50%;
      border: 0.01rem solid;
    }
    .text {
      color: #eee;
      // width: 0.9rem;
      display: inline-block;
    }
    .percentage {
      font-size: 0.14rem;
      width: 0.5rem;
      display: inline-block;
      font-weight: bold;
    }
    .unit-wrapper {
      width: 0.6rem;
      margin-left: 5px;
    }
    .number {
      font-size: 0.16rem;
      font-weight: bold;
      color: #707fb5;
    }
    .unit {
      color: #707fb5;
    }
  }
}
::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 10px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  background: rgba(21, 50, 125, 0.8);
}
::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  background: rgba(21, 50, 125, 0.4);
}
</style>