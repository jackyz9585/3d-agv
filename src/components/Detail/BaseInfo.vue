<template>
  <div class="main-card">
    <div class="status" :style="{ color: headerBgColor }">
      {{ data.deviceCode }}
    </div>
    <div>{{ data.deviceType }}</div>
    <img :src="srcHandler()" alt="" />
    <div>{{ data.recipeName }}</div>
    <div>{{ data.lotId }}</div>
  </div>
</template>

<script>
import { statusEnum } from "../BaseScence/config.ts";

// const deviceImg = require("@/assets/d1.png");
export default {
  name: "BaseInfo",
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      // deviceImg: deviceImg,
    };
  },
  computed: {
    headerBgColor() {
      if (!this.data || !this.data.status) {
        return statusEnum["RUN"].base;
      }
      return window._.get(statusEnum, `${this.data.status}.base`);
    },
  },
  methods: {
    srcHandler() {
      const imgNameIndex = this.data.deviceImg.lastIndexOf("/");
      const imgName = this.data.deviceImg.slice(imgNameIndex);
      console.log("设备图片路径", window.IMG_BASE_URL + imgName);
      return window.IMG_BASE_URL + imgName;
    },
  },
};
</script>

<style scoped lang="scss">
.main-card {
  box-sizing: border-box;
  padding: 10px;
  color: #fff;
  border: 1px solid #2d89feab;
  box-shadow: #2d89fe 0px 0px 10px;
  text-align: center;
  background-color: rgb(4, 13, 38, 0.5);
  font-size: 14px;
  & > div {
    margin-bottom: 5px;
    word-break: break-all;
  }
  .status {
    font-weight: 600;
    font-size: 24px;
  }
}
</style>
