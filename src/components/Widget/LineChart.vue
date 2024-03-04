<template>
  <div :id="`chart-${chartId}`" style="width: 100%; height: 100%"></div>
</template>

<script>
const echarts = require("echarts");
import "../../utils/dark";
import { LineChartData } from "./widgetData";
import { getLineChartData } from "@/server/publicApi";

export default {
  name: "LineChart",
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
      getLineChartData().then((res) => {
        if (res.flag) {
          // console.log("update line chart");
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

      var option = {
        textStyle: {
          fontSize: 8,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: data.map((d) => d.name),
          axisLabel: {
            fontSize: 8,
            rotate: -45,
          },
        },
        yAxis: {
          name: "包",
          type: "value",
          axisLabel: {
            fontSize: 8,
          },
        },
        grid: {
          top: 25,
          bottom: 30,
        },
        series: [
          {
            data: data,
            type: "line",
            color: "#877bf4",
            // 线条宽度和点大小
            symbolSize: 2,
            lineStyle: {
              width: 1,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "#877bf4",
                },
                {
                  offset: 1,
                  color: "rgba(0,5,56,1)",
                },
              ]),
            },
          },
        ],
      };

      this.myChart.setOption(option);
    },
  },
};
</script>
