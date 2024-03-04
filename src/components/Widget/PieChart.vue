<template>
  <div :id="`chart-${chartId}`" style="width: 100%; height: 100%"></div>
</template>

<script>
const echarts = require("echarts");
import "../../utils/dark.js";
import { LineChartData } from "./widgetData";
import { getPieChartData } from "@/server/publicApi";

export default {
  name: "PieChart",
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
      getPieChartData().then((res) => {
        if (res.flag) {
          // console.log("update pie chart");
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
        tooltip: {
          trigger: "item",
        },
        legend: {
          top: "5%",
          left: "center",
          itemWidth: 12,
          itemHeight: 7,
          textStyle: {
            fontSize: 8,
          },
        },
        grid: {
          top: 20,
          bottom: 30,
        },

        series: [
          {
            center: ["50%", "60%"],
            name: "Access From",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            label: {
              show: true,
              color: "#feffff",
              formatter(param) {
                return param.name + ": " + param.value;
              },
            },

            // emphasis: {
            //   label: {
            //     show: true,
            //     fontSize: 40,
            //     fontWeight: "bold",
            //   },
            // },
            labelLine: {
              show: false,
            },
            data: data,
            //   data1: [
            //     {
            //       value: 1048,
            //       name: "Search Engine",
            //       itemStyle: {
            //         color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
            //           { offset: 0, color: "#6bfce9" },
            //           { offset: 0.5, color: "#6bfce9" },
            //           { offset: 1, color: "#6bfce955" },
            //         ]),
            //       },
            //     },
            //     {
            //       value: 735,
            //       name: "Direct",
            //       itemStyle: {
            //         color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
            //           { offset: 0, color: "#db470b" },
            //           { offset: 0.5, color: "#db470b" },
            //           { offset: 1, color: "#db470b55" },
            //         ]),
            //       },
            //     },
            //     {
            //       value: 580,
            //       name: "Email",
            //       itemStyle: {
            //         color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
            //           { offset: 0, color: "#56b5ff" },
            //           { offset: 0.5, color: "#56b5ff" },
            //           { offset: 1, color: "#56b5ff55" },
            //         ]),
            //       },
            //     },
            //     {
            //       value: 484,
            //       name: "Union Ads",
            //       itemStyle: {
            //         color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
            //           { offset: 0, color: "#9121d8" },
            //           { offset: 0.5, color: "#9121d8" },
            //           { offset: 1, color: "#9121d855" },
            //         ]),
            //       },
            //     },
            //     {
            //       value: 300,
            //       name: "Video Ads",
            //       itemStyle: {
            //         color: new echarts.graphic.LinearGradient(1, 0, 0, 1, [
            //           { offset: 0, color: "#877bf4" },
            //           { offset: 0.5, color: "#877bf4" },
            //           { offset: 1, color: "#877bf455" },
            //         ]),
            //       },
            //     },
            //   ],
          },
        ],
      };

      this.myChart.setOption(option);
    },
  },
};
</script>
