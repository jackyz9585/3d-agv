
<!--各部OEE-->
<template>
  <div class="PartOee panel">
    <div class="title">
      <div>
        <img src="../../assets/img/icon-gebuOEE.png"
             alt="" />
      </div>
      <div class="parts">
        <div v-for="(item, index) in parts"
             :class="['part', item.active ? 'active' : 'unactive']"
             @click="handleClick(item)"
             :key="index">
          {{ item.name }}
        </div>
      </div>
    </div>
    <div class="content">
      <div v-for="(item, index) in data"
           :key="index">
        <span class="content-title">{{ item.type }}</span>
        <div :id="`part-oee-${item.id}-echarts`"
             class="part-oee-echarts"></div>
      </div>
    </div>
  </div>
</template>

<script>
const echarts = require("echarts");
import _ from "lodash";

import "../../utils/dark.js";
import { inspectionDepartment } from "@/server/publicApi";
export default {
  name: "PartOee",
  data () {
    return {
      parts: [
        { name: "一部", active: true, department: "01" },
        { name: "二部", active: false, department: "02" },
        { name: "三部", active: false, department: "04" },
      ],
      data: [],
      department: "01",
    };
  },
  mounted () {
    // this.initData();
    this.getDepartmentOeeData(this.department);
    const resizeFn = _.debounce(this.handleResize, 200)

    window.addEventListener("resize", resizeFn);
    this.$once("hook:beforeDestroy", () => {
      window.removeEventListener("resize", resizeFn);
    });
  },
  methods: {
    handleResize () {
      this.data.forEach((item) => {
        this["oeeEcharts" + item.id] && this["oeeEcharts" + item.id].resize();
      });
    },
    // 获取各部oee数据
    getDepartmentOeeData (department) {
      const params = {
        factoryCode: department
      }
      // let param = `factoryCode=${department}`;
      inspectionDepartment(params).then((res) => {
        this.data = res.map((item, index) => {
          return {
            id: index,
            type: item.NAME,
            oee: item.OEE,
          };
        });
        this.$nextTick(() => {
          this.initData();
        });
      });
    },
    handleClick (item) {
      this.parts.forEach((p) => {
        p.active = false;
      });
      item.active = true;
      this.getDepartmentOeeData(item.department);
    },
    initData () {
      this.data.forEach((d) => {
        this["oeeEcharts" + d.id] = echarts.init(
          document.getElementById(`part-oee-${d.id}-echarts`),
          "dark"
        );
        let option = {
          series: [
            {
              type: "gauge",
              radius: "100%",
              startAngle: 225,
              endAngle: -45,
              min: 0,
              max: 100,
              splitNumber: null,
              itemStyle: {
                color: "#58D9F9",
                shadowColor: "rgba(0,138,255,0.45)",
                shadowBlur: 10,
                shadowOffsetX: 2,
                shadowOffsetY: 2,
              },
              axisLine: {
                lineStyle: {
                  width: 10,
                  color: [
                    [0.33, "#f54ef0"],
                    [0.66, "#58a5ff"],
                    [1, "#42e7e9"],
                  ],
                },
              },
              pointer: {
                icon: "path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z",
                length: "75%",
                width: 12,
                offsetCenter: [0, "10%"],
              },
              axisTick: {
                splitNumber: 2,
                lineStyle: {
                  width: 2,
                  color: "#fff",
                },
              },
              splitLine: {
                length: 12,
                lineStyle: {
                  width: 3,
                  color: "#fff",
                },
              },
              axisLabel: {
                distance: 30,
                color: "#fff",
                fontSize: 20,
              },
              title: {
                show: false,
              },
              detail: {
                formatter: function (value) {
                  return "{value|" + value.toFixed(0) + "}{unit|%}";
                },
                rich: {
                  value: {
                    fontSize: 10,
                    fontWeight: "bolder",
                    color: "#fff",
                  },
                  unit: {
                    fontSize: 10,
                    color: "#fff",
                    // padding: [0, 0, -20, 10]
                  },
                },
              },
              data: [
                {
                  value: d.oee,
                },
              ],
            },
          ],
        };

        // 使用刚指定的配置项和数据显示图表。
        this["oeeEcharts" + d.id].setOption(option);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.panel {
  overflow-y: auto;
  box-sizing: border-box;
  padding: 0.2rem;
  width: 4.7rem;
  height: 4.4rem;
  color: #fff;
  margin-bottom: 0.2rem;
  .content {
    display: flex;
    flex-wrap: wrap;
    text-align: center;
    margin-top: 0.2rem;
    & > div {
      width: 1.1rem;
      margin-left: 0.2rem;
    }
    .content-title {
      display: inline-block;
      padding-top: 0.02rem;
    }
  }
  .part-oee-echarts {
    width: 100%;
    height: 1rem;
  }
  .title {
    display: flex;
    justify-content: space-between;
  }
  .parts {
    display: flex;
    .part {
      font-size: 0.16rem;
      cursor: pointer;
      width: 0.5rem;
      text-align: center;
      line-height: 0.3rem;
      margin-left: 0.05rem;
    }
    .active {
      color: #091431;
      background: #fff800;
    }
    .unactive {
      color: #fff;
    }
  }
}
</style>