<template>
  <div class="header">
    <div class="floor">
      <!-- <el-select
        class="floor-select"
        v-model="currentFloorId"
        placeholder=""
        size="mini"
        @change="handleChange"
      >
        <el-option
          v-for="item in floors"
          :key="item.index"
          :label="item.name"
          :value="item.id"
        ></el-option>
      </el-select> -->
    </div>
    <div class="title">
      <span>丙类仓智能物流</span>
    </div>
    <!-- 关闭按钮 模式mode为view 和setting都显示-->
    <div>
      <div
        class="close-btn"
        @click="backHome"
        @keyup.enter="backHome"
        tabindex="0"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseHeader",
  props: {
    floors: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      currentFloorId: this.floors.find((f) => f.active)?.id,
    };
  },
  methods: {
    handleChange(v) {
      this.currentFloorId = v;
      const currentFloor = this.floors.find((f) => f.id === v);
      this.$emit("select", currentFloor);
    },
    backHome() {
      this.$emit("backHome");
    },
  },
};
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
  height: 0.8rem;
  background-repeat: no-repeat;
  background-image: url(../../assets/layout/nav.png);
  background-size: 100% 100%;
  position: absolute;
  display: flex;
  justify-content: space-between;

  & > div {
    flex: 1;

    .close-btn {
      position: absolute;
      top: 0;
      right: 0;
      background-image: url(../../assets/close.png);
      background-size: 100% 100%;
      cursor: pointer;
      width: 0.4rem;
      height: 0.4rem;
      // width: 40px;
      // height: 40px;
    }
  }
  .floor {
    // .icon {
    //   display: inline-block;
    //   width: 0.4rem;
    //   height: 0.4rem;
    //   background-image: url(../../assets/layout/floor.png);
    //   background-size: cover;
    // }
    .label {
      font-size: 0.2rem;
      color: #fff;
      margin-left: 0.1rem;
      margin-right: 0.1rem;
      line-height: 0.55rem;
      font-family: "标题斜字体";
      text-shadow: 2px 2px 10px #01ffff;
    }
    .floor-select {
      margin-top: 0.15rem;
      width: 2rem;
      font-size: 0.14rem;
      ::v-deep .el-input--mini .el-input__inner {
        height: 0.3rem;
        line-height: 0.3rem;
      }
      ::v-deep .el-input__suffix {
        height: 100%;
        right: 0.1rem;
      }
      ::v-deep .el-input--mini .el-input__icon {
        line-height: 0.3rem;
      }
    }
  }
  .title {
    text-align: center;
    font-size: 0.36rem;
    line-height: 0.6rem;
    font-family: "标题字体";
    color: #fff;
    text-shadow: 2px 2px 10px #01ffff;
  }
}
</style>
