<template>
  <div :id="`chart-${chartId}`" style="width: 100%; height: 100%"></div>
</template>

<script>
const echarts = require("echarts");
import "../../utils/dark.js";
import { LineChartData } from "./widgetData";
import { getBarChartData } from "@/server/publicApi";

export default {
  name: "BarChart",
  props: {
    chartId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      myChart: null,
      interval: 10 * 60 * 1000,
    };
  },
  mounted() {
    this.addLoop();
    // this.renderChart(LineChartData.data);
    const resizeFn = () => {
      if (this.myChart) {
        this.myChart.resize();
      }
    };
    window.addEventListener("resize", resizeFn);
    this.$once("hook:beforeDestroy", () => {
      echarts.dispose(this.myChart);
      this.myChart = null;
      clearTimeout(this.timer);
      this.timer = null;
      window.removeEventListener("resize", resizeFn);
    });
  },
  methods: {
    getData() {
      getBarChartData().then((res) => {
        if (res.flag) {
          // console.log("update bar chart");
          this.renderChart(res.data);
        }
      });
    },
    addLoop() {
      this.getData();
      this.timer = setTimeout(() => {
        clearTimeout(this.timer);
        this.timer = null;
        this.addLoop();
      }, this.interval);
    },
    renderChart(data) {
      if (!this.myChart) {
        this.myChart = echarts.init(
          document.getElementById(`chart-${this.chartId}`),
          "dark"
        );
      }

      const option = {
        textStyle: {
          fontSize: 8,
        },
        grid: {
          top: 25,
          bottom: 30,
        },
        xAxis: {
          type: "category",
          data: data.map((d) => d.name),
          axisLabel: {
            fontSize: 8,
            rotate: -45,
          },
        },
        yAxis: {
          name: "%",
          type: "value",
          axisLabel: {
            fontSize: 8,
          },
        },
        series: [
          // 主体
          {
            z: 1,
            data: data,
            type: "pictorialBar",
            symbol: "reat",
            symbolSize: ["50%", "100%"],
            symbolOffset: ["-50%", "0%"],
            // barWidth: 30,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#6bfce9cc" },
                { offset: 1, color: "#6bfce999" },
              ]),
            },
          },
          {
            z: 1,
            data: data,
            type: "pictorialBar",
            symbol: "reat",
            symbolSize: ["50%", "100%"],
            symbolOffset: ["50%", "0%"],
            // barWidth: 30,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#6bfce999" },
                { offset: 1, color: "#6bfce936" },
              ]),
            },
          },
          // 底
          {
            z: 2,
            type: "pictorialBar",
            symbol: "diamond",
            symbolOffset: ["0%", "50%"],
            symbolSize: ["100%", 12],
            toolltip: {
              show: false,
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#6bfce911" },
                { offset: 1, color: "#6bfce9cc" },
              ]),
            },
            data: data.map(() => 1),
          },
          // 顶
          {
            z: 3,
            type: "pictorialBar",
            symbol: "diamond",
            symbolPosition: "end",
            symbolOffset: ["0%", "-50%"],
            symbolSize: ["100%", 12],
            toolltip: {
              show: false,
            },
            itemStyle: {
              color: "#6bfce9",
            },
            data: data,
          },
          // {
          //   z: 0,
          //   type: "bar",
          //   barWidth: 30,
          //   data: [400, 400, 400, 400, 400], // [400, 400, 400, 400, 400]
          //   itemStyle: {
          //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //       { offset: 0, color: "#9cc1ff" },
          //       { offset: 1, color: "#ecf5ff" },
          //     ]),
          //   },
          // },
          // {
          //   z: 3,
          //   type: "pictorialBar",
          //   symbol: "diamond",
          //   symbolPosition: "end",
          //   symbolOffset: ["0%", "-50%"],
          //   symbolSize: [30, 12],
          //   toolltip: {
          //     show: false,
          //   },
          //   itemStyle: {
          //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //       { offset: 0, color: "#1f7eff" },
          //       { offset: 1, color: "#64adff" },
          //     ]),
          //   },
          //   data: [400, 400, 400, 400, 400],
          // },
        ],
      };

      this.myChart.setOption(option);
    },
  },
};
</script>
