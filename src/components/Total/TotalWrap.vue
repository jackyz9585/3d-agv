<template>
  <div class="total-wrap">
    <DeviceFilter
      :deviceData="deviceData"
      :visible.sync="visible"
      :deviceFilter="deviceFilter"
      @confirm="handleFilter"
    />

    <img
      v-if="totalDataFormat.length"
      class="el-icon-setting"
      title="设置查询条件"
      :src="filterImg"
      @click="handleShowDeviceFilterDialog"
      alt=""
    />
    <Total
      v-for="data in totalDataFormat"
      :key="data.status"
      :data="data"
      :isCollapse="data.status !== spreadIndex"
      :deviceData="deviceData"
      @setActiveIndex="handleSetActiveStatus"
      @confirmFilter="handleFilter"
    />
  </div>
</template>

<script>
import DeviceFilter from "../DeviceFilter/index.vue";
const emptyFilter = require("../../assets//img/filter-empty.png");
const fullFilter = require("../../assets//img/filter-full.png");

import Total from "./index";
export default {
  name: "TotalWrap",
  components: {
    Total,
    DeviceFilter,
  },
  props: {
    statusKeys: {
      type: Array,
      default: () => [],
    },
    spreadIndex: {
      type: String,
    },
    totalData: {
      type: Array,
      default: () => [],
    },
    deviceData: {
      type: Array,
      default: () => [],
    },
    deviceFilter: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      visible: false,
      emptyFilter,
      fullFilter,
    };
  },

  computed: {
    totalDataFormat() {
      return this.totalData.map((data) => {
        return {
          status: data.type,
          num: data.num,
          list: data.list || [],
        };
      });
    },
    filterImg() {
      return Object.values(this.deviceFilter).some(Boolean)
        ? fullFilter
        : emptyFilter;
    },
  },

  methods: {
    handleSetActiveStatus(value) {
      this.$emit("changeEqpStatus", value);
    },
    handleFilter(filter) {
      this.$emit("confirmFilter", filter);
    },
    // 打开设备筛选弹框
    handleShowDeviceFilterDialog() {
      this.visible = true;
    },
  },
};
</script>

<style scoped lang="scss">
.total-wrap {
  position: relative;
}
.el-icon-setting {
  position: absolute;
  left: 44px;
  top: 8px;
}
</style>