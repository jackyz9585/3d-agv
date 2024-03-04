<!--各部设备状态-->
<template>
  <div class="status panel">
    <div class="title">
      <img src="../../assets/img/icon-gebushebeizhuangtai.png"
           alt="" />
    </div>
    <div class="content">
      <div class="status-eqp">
        <div>
          <span style="background: #009a42"
                class="block"></span>
          <span>RUN</span>
        </div>
        <div>
          <span style="background: #cec731"
                class="block"></span>
          <span>IDEL</span>
        </div>
        <div>
          <span style="background: #949494"
                class="block"></span>
          <span>OFFLINE</span>
        </div>
      </div>
      <div class="echarts-container">
        <div class="status-echarts"
             id="one-echarts"></div>
        <span>制造一部</span>
      </div>
      <div class="echarts-container">
        <div class="status-echarts"
             id="two-echarts"></div>
        <span>制造二部</span>
      </div>
      <div class="echarts-container">
        <div class="status-echarts"
             id="three-echarts"></div>
        <span>制造三部</span>
      </div>
    </div>
  </div>
</template>

<script>
const echarts = require("echarts");
import "../../utils/dark.js";
import { inspectionEqpStatus } from "@/server/publicApi";
import _ from "lodash";
export default {
  name: "Status",
  data () {
    return {
      timer: null,
      Oneoption: {
        tooltip: {
          trigger: "item",
        },
        color: ["#009a42", "#cec731", "#949494"],
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],

            label: {
              show: false,
              position: "center",
            },
            data: [
              { value: 0, name: "RUN" },
              { value: 0, name: "IDLE" },
              { value: 0, name: "OFFLINE" },
            ],
          },
        ],
      },
      twoOption: {
        tooltip: {
          trigger: "item",
        },
        color: ["#009a42", "#cec731", "#949494"],
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],

            label: {
              show: false,
              position: "center",
            },
            data: [
              { value: 0, name: "RUN" },
              { value: 0, name: "IDLE" },
              { value: 0, name: "OFFLINE" },
            ],
          },
        ],
      },
      threeOption: {
        tooltip: {
          trigger: "item",
        },
        color: ["#009a42", "#cec731", "#949494"],
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],

            label: {
              show: false,
              position: "center",
            },
            data: [
              { value: 0, name: "RUN" },
              { value: 0, name: "IDLE" },
              { value: 0, name: "OFFLINE" },
            ],
          },
        ],
      },
    };
  },
  mounted () {
    this.getEqpStatusData();
    const resizeFn = _.debounce(this.handleResize, 200)
    
    window.addEventListener("resize",resizeFn);
    this.$once("hook:beforeDestroy", () => {
      window.removeEventListener("resize",resizeFn);
    });
  },
  methods: {
    handleResize () {
      this.oneEcharts && this.oneEcharts.resize();
      this.twoEcharts && this.twoEcharts.resize();
      this.threeEcharts && this.threeEcharts.resize();
    },
    // 获取各部设备状态
    getEqpStatusData () {
      const params={
        factoryCodes:'01,02,04'
      }
      // let factoryCodes = "factoryCodes=01,02,04";
      inspectionEqpStatus(params).then((res) => {
        res.forEach((item) => {
          switch (item.factoryName) {
            case "制造一部":
              this.mappingEqpSatus(this.Oneoption, item);
              this.initEchartsOne();
              break;
            case "制造二部":
              this.mappingEqpSatus(this.twoOption, item);
              this.initEchartsTwo();
              break;
            case "制造三部":
              this.mappingEqpSatus(this.threeOption, item);
              this.initEchartsThree();
              break;
          }
        });
        this.setTimer();
      });
    },
    mappingEqpSatus (option, item) {
      option.series[0].data.forEach((obj) => {
        switch (obj.name) {
          case "RUN":
            obj.value = item.runNum;
            break;
          case "IDLE":
            obj.value = item.idleNum;
            break;
          case "OFFLINE":
            obj.value = item.offlineNum;
            break;
        }
      });
    },
    initEchartsOne () {
      this.oneEcharts = echarts.getInstanceByDom(document.getElementById("one-echarts"))
      if (!this.oneEcharts) {
        this.oneEcharts = echarts.init(
          document.getElementById("one-echarts"),
          "dark"
        );
      }
      // 使用刚指定的配置项和数据显示图表。
      this.oneEcharts.setOption(this.Oneoption);
    },
    initEchartsTwo () {
      this.twoEcharts = echarts.getInstanceByDom(document.getElementById("two-echarts"))
      if(!this.twoEcharts){
         this.twoEcharts = echarts.init(
        document.getElementById("two-echarts", "dark")
      );
      }
      this.twoEcharts.setOption(this.twoOption);
    },
    initEchartsThree () {
      this.threeEcharts = echarts.getInstanceByDom(document.getElementById("three-echarts"))
      if(!this.threeEcharts){
        this.threeEcharts = echarts.init(
        document.getElementById("three-echarts", "dark")
      );
      }
      this.threeEcharts.setOption(this.threeOption);
    },
    setTimer () {
      this.timer = setTimeout(() => {
        this.getEqpStatusData();
      }, 60000);
    },
  },
  beforeDestroy () {
    clearInterval(this.timer);
    this.timer = null;
  },
};
</script>

<style lang="scss" scoped>
.panel {
  box-sizing: border-box;
  padding: 0.2rem;
  width: 4.7rem;
  height: 1.7rem;
  color: #fff;
  margin-bottom: 0.2rem;
  .title {
    img {
      width: 2.2rem;
    }
  }
  .content {
    display: flex;
    .status-eqp {
      width: 0.8rem;
      padding: 0.1rem 0;
      & > div {
        margin: 0.05rem 0;
      }
      .block {
        display: inline-block;
        width: 0.05rem;
        height: 0.05rem;
        margin: 0.05rem;
      }
    }
  }
  .echarts-container {
    width: 1.1rem;
    text-align: center;
    span {
      font-weight: 600;
      color: #eee;
    }
    .status-echarts {
      width: 1.1rem;
      height: 1rem;
    }
  }
}
</style>