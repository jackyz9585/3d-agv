<template>
  <div class="widget" :style="widget.style">
    <div class="header">
      {{ widget.title }}
      <!-- <span class="el-icon-refresh-right refresh" @click="handleRefresh"></span> -->
    </div>
    <div class="content">
      <component :is="widget.type" :chartId="widget.id" ref="chart">
      </component>
    </div>
  </div>
</template>

<script>
import PieChart from "./PieChart.vue";
import BarChart from "./BarChart.vue";
import LineChart from "./LineChart.vue";
import TableChart from "./TableChart.vue";

export default {
  name: "Widget",
  components: {
    PieChart,
    BarChart,
    LineChart,
    TableChart,
  },
  props: {
    widget: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    renderChart(data) {
      if (this.$refs.chart) {
        this.$refs.chart.renderChart(data);
      }
    },
  },
};
</script>

<style lang="scss">
.widget {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  // box-shadow: 0 0 10px #1f9bd3;
}
.header {
  width: 100%;
  height: 0.5rem;
  background-image: url(../../assets/layout/titlebar.png);
  color: #feffff;
  text-shadow: 2px 2px 10px #01ffff;
  font-size: 0.3rem;
  font-family: "标题斜字体";
  padding-left: 0.3rem;
  box-sizing: border-box;
  background-size: 100% 100%;
  .refresh {
    color: #01ffff82;
    float: right;
    margin-top: 0.1rem;
  }
}
.content {
  width: 100%;
  height: calc(100% - 0.5rem);
}
</style>
