<!--OEE趋势-->
<template>
  <div class="trend panel">
    <div class="title">
      <img src="../../assets/img/icon-OEEqushi.png"
           alt="" />
    </div>
    <div class="content">
      <div id="trend-echarts"></div>
    </div>
  </div>
</template>

<script>
const echarts = require("echarts");
import "../../utils/dark.js";
import _ from "lodash";
// import get from 'lodash/get'
import { inspectionOeeTrend } from "@/server/publicApi";
export default {
  name: "Trend",
  data () {
    return {
      echartsDom: "",
      option: {
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: [],
          selected:{}
        },

        grid: {
          height: "73%",
          width: "90%",
          left: "3%",
          right: "1%",
          top: "30%",
          bottom: "1%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
              axisLabel: {
            interval: 0,
            rotate: -15, // 倾斜度 -90 至 90 默认为0
            // textStyle: {
            //   fontSize: '', 
            // },
          },
            data: [],
            // data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
        dataZoom: [
          {
            type: 'inside', 
            start: 10, 
            end: 80,
            z: -9999,
          },
        ],
        series: [],
      },
    };
  },
  mounted () {
    // this.initData();
    const resizeFn = _.debounce(this.handleResize, 200)

    window.addEventListener("resize", resizeFn);
    this.$once("hook:beforeDestroy", () => {
      window.removeEventListener("resize", resizeFn);
    });
    this.getOeeTrend();
  },
  methods: {
    handleResize () {
      this.myChart && this.myChart.resize();
    },
    // 获取OEE趋势数据
    getOeeTrend () {
      const params = {
        factoryCodes: '01'
      }
      // let factoryCodes = "factoryCodes=01,02,04";
      inspectionOeeTrend(params).then(res => {
        const legrndData=Array.from(new Set((res||[]).map(item=>item.NAME)))
        this.option.legend.data=legrndData
         const xAxisData=Array.from(new Set(res.map(item=>item.PERIOD_DATE)))
        this.option.xAxis[0].data=xAxisData
        legrndData.forEach(item=>{
           if(item==='压焊'){
            this.option.legend.selected[item]=true
          }else{
            this.option.legend.selected[item]=false
          }
          const dataList=res.filter(obj=>obj.NAME===item)
          this.option.series.push({
            name:item,
            type:'line',
            stack:'Total',
            data:dataList.map(item=>item.OEE)
          })
        })
        this.initData()
      });
    },
    initData () {
      this.echartsDom = document.getElementById("trend-echarts");
      this.myChart = echarts.init(
        document.getElementById("trend-echarts"),
        "dark"
      );

      // 使用刚指定的配置项和数据显示图表。
      this.myChart.setOption(this.option);
    },
  },
};
</script>

<style lang="scss" scoped>
.panel {
  box-sizing: border-box;
  padding: 0.1rem;
  width: 4.7rem;
  height: 3.25rem;
  color: #fff;
  margin-bottom: 0.2rem;
  #trend-echarts {
    width: 4.7rem;
    height: 2.8rem;
  }
}
</style>