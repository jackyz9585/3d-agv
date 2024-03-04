<template>
  <div class="card" :style="{ boxShadow: `${headerBackground} 0px 0px 8px` }">
    <div
      class="header"
      :style="{ background: headerBackground }"
      @click="handleChangeCollapse"
    >
      <div class="status" :style="{ color: lightColor }">{{ data.status }}</div>
      <div class="num" :style="{ color: darkColor }">{{ data.num }}</div>
      <div class="unit" :style="{ color: lightColor }">台</div>
    </div>
    <div
      :class="['table-wrap', collapse ? 'collapse' : 'spread']"
      ref="tableWrap"
    >
      <div class="table-text" ref="tableText">
        <table
          class="main-table"
          border="1"
          cellspacing="0"
          cellpadding="0"
          :style="{
            background: tableBackground,
            borderColor: tableBorder,
          }"
        >
          <tr v-for="(item, index) in data.list" :key="index">
            <td>{{ item.stepName }}</td>
            <td>{{ item.count }}台</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { statusEnum } from "../BaseScence/config";
import { hexToRGBA } from "@/utils/hexToRGBA";

export default {
  name: "Total",
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    isCollapse: {
      type: Boolean,
      default: false,
    },
    deviceData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      collapse: false,
      visible: false,
    };
  },
  computed: {
    headerBackground() {
      return statusEnum[this.data.status].base;
    },
    lightColor() {
      return statusEnum[this.data.status].light;
    },
    darkColor() {
      return statusEnum[this.data.status].dark;
    },
    tableBackground() {
      const baseColor = statusEnum[this.data.status].base;
      return hexToRGBA(baseColor, 0.1);
    },
    tableBorder() {
      const baseColor = statusEnum[this.data.status].base;
      return hexToRGBA(baseColor, 0.2);
    },
  },
  mounted() {
    this.collapse = this.isCollapse;
    this.clientHeight = this.$refs.tableWrap.clientHeight;
    this.refreshCollapse();
  },
  methods: {
    handleChangeCollapse() {
      // 同一时刻只有一个展开项
      this.$emit("setActiveIndex", this.data.status);
      // this.collapse = !this.collapse;
      // this.refreshCollapse();
      // // 展开，触发父级其他收起
      // if (!this.collapse) {
      //   this.$emit("setActiveIndex", this.data.status);
      // } else {
      //   this.$emit("setActiveIndex", null);
      // }
    },
    refreshCollapse() {
      const tableWrap = this.$refs.tableWrap;
      const tableText = this.$refs.tableText;
      if (this.collapse) {
        tableWrap.style.height = 0;
        tableText.style.top = -this.clientHeight + "px";
      } else {
        tableWrap.style.height = this.clientHeight + "px";
        tableText.style.top = 0;
      }
    },
    handleFilter(filter) {
      this.$emit("confirmFilter", filter);
    },
  },
  watch: {
    isCollapse() {
      this.collapse = this.isCollapse;
      this.refreshCollapse();
    },
  },
};
</script>

<style scoped lang="scss">
.header {
  height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 10px;

  cursor: pointer;

  display: flex;
  .status {
    font-size: 12px;
    position: relative;
    top: 5px;
    font-weight: 600;
  }
  .num {
    font-size: 32px;
    font-weight: 600;
    flex: 1;
    text-align: right;
  }
  .unit {
    font-size: 12px;
    width: 50px;
    text-align: center;
    position: relative;
    top: 5px;
    font-weight: 600;
  }
}
.table-wrap {
  overflow: hidden;
  transition: 0.5s height;
  .table-text {
    position: relative;
    transition: 0.5s top;
  }
  .main-table {
    width: 100%;
    color: #fff;
    // border: 1px solid rgb(21, 50, 125);
    text-align: center;
    font-size: 12px;

    td {
      box-sizing: border-box;
      min-width: 100px;
      padding: 5px 10px;
      // background-color: rgb(4, 13, 38);
    }
  }
}
</style>
