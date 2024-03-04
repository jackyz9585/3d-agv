<template>
  <div class="home-page">
    <div class="top-content">
      <div class="date">
        <span class="num">{{ date.year }}</span>
        <span class="unit">年</span>
        <span class="num">{{ date.month }}</span>
        <span class="unit">月</span>
        <span class="num">{{ date.date }}</span>
        <span class="unit">日</span>
        <span class="day">星期{{ date.day }}</span>
        <span
          class="el-icon-full-screen fullscreen"
          tabindex="0"
          @keyup.enter="fullScreenClick"
          @click="fullScreenClick"
        ></span>
      </div>
    </div>
    <div class="main-content">
      <!-- <div class="left-wrapper">
        <Overview />
        <Status />
        <Oee />
         <PartOee />
        
      </div>
      <div class="right-wrapper">
        <MTBA />
        <Trend />
        <Capacity />
        
      </div> -->
      <div
        class="center-wrapper"
        tabindex="0"
        @keyup.enter="checkBuild({ bid: 'B', fid: 'DD' })"
        @click="checkBuild({ bid: 'B', fid: 'DD' })"
      >
        <!-- <div class="build-0"
             @click="checkBuild('B3')">

        </div>
        <div class="build-1"
             @click="checkBuild('B3')">

        </div>
        <div class="build-2"
             @click="checkBuild('B1')">

        </div>
        <div class="build-3"
             @click="checkBuild('B2')">

        </div> -->
      </div>
    </div>
  </div>
</template>
<script>
import Overview from "./Overview.vue";
// import Oee from './Oee.vue'
import Status from "./Status.vue";
import Capacity from "./Capacity.vue";

import MTBA from "./MTBA.vue";
import PartOee from "./PartOee.vue";
import Trend from "./Trend.vue";

export default {
  components: { Overview, Status, Capacity, MTBA, PartOee, Trend },
  name: "homePage",
  data() {
    return {
      date: {},
      isFullScreen: false,
    };
  },
  created() {
    this.getDate();
  },
  methods: {
    getDate() {
      const date = new Date();
      this.date.year = date.getFullYear();
      this.date.month = date.getMonth() + 1;
      this.date.date = date.getDate();
      const dayStr = ["日", "一", "二", "三", "四", "五", "六"];
      this.date.day = dayStr[date.getDay()];
    },
    checkBuild({ bid, fid }) {
      this.$emit("checkBuild", { bid, fid });
    },
    fullScreenClick() {
      if (this.isFullScreen) {
        this.exitFullscreen();
      } else {
        this.requestFullScreen();
      }
    },
    //进入全屏
    requestFullScreen() {
      const el = document.body;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
      this.isFullScreen = true;
    },
    //退出全屏
    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      this.isFullScreen = false;
    },
  },
};
</script>
<style lang="scss" scoped>
.home-page {
  // width: 19.2rem;
  width: 100%;
  // height: 1080px;
  // height: 10.8rem;
  height: 100vh;

  background-image: url(../../assets/layout/bg.png);
  background-size: cover;
  .top-content {
    // background-image: url(../../assets/header.png);
    background-size: 100% 100%;
    width: 100%;
    width: 100%;
    height: 1rem;
    .date {
      color: #fff;
      line-height: 1rem;
      text-align: right;
      padding-right: 20px;
      .num {
        font-weight: bold;
        font-size: 30px;
        margin-right: 5px;
      }
      .unit {
        font-size: 16px;
        margin-right: 5px;
      }
      .day {
        font-size: 16px;
        color: #a2a2a2;
      }
    }
    .fullscreen {
      margin-left: 0.3rem;
      text-align: right;
      cursor: pointer;
      font-size: 0.3rem;
      color: #fff;
    }
  }
  .main-content {
    position: absolute;
    top: 1rem;
    left: 0;
    bottom: 0;
    right: 0;
    .center-wrapper {
      cursor: pointer;
      float: left;
      position: absolute;
      top: 0;
      left: 0;
      // left: 4.5rem;
      bottom: 0;
      // right: 3rem;
      right: 0;

      // margin-left: 20px;
      // border: 2px red solid;
      z-index: 1;
      .build-0 {
        width: 3.29rem;
        height: 1.46rem;
        position: absolute;
        left: 1.2763rem;
        top: 4.139651647758928rem;
        transform: rotate3d(1, 1, 1, 283deg);
        &:hover {
          cursor: pointer;
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0px 0px 20px #2b6cf0;
        }
      }
      .build-1 {
        width: 5.3rem;
        height: 1.6rem;
        position: absolute;
        top: 5.460344800797299rem;
        left: 1.4760688181017088rem;
        transform: rotate3d(1, 1, 1, 283deg);
        //border: 2px blue solid;
        cursor: pointer;
        &:hover {
          cursor: pointer;
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0px 0px 20px #2b6cf0;
        }
      }
      .build-2 {
        width: 2.3rem;
        height: 2rem;
        position: absolute;
        top: 2.452715855642689rem;
        right: 2.130866263725775rem;
        transform: rotate3d(1, 1, 1, 281deg);
        //border: 2px blue solid;

        &:hover {
          cursor: pointer;
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0px 0px 20px #2b6cf0;
        }
      }
      .build-3 {
        width: 2.3rem;
        height: 4.2rem;
        position: absolute;
        top: 0.16647392685357618rem;
        right: 1.0321383464921723rem;
        transform: rotate3d(1, 1, 1, 277deg);
        &:hover {
          cursor: pointer;
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0px 0px 20px #2b6cf0;
        }
      }
    }
    .left-wrapper {
      width: 4.7rem;
      min-width: 380px;
      height: 9.41rem;
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 10;
      & > div {
        background: #000b29ba;
      }
    }
    .right-wrapper {
      width: 4.7rem;
      height: 9.41rem;
      min-width: 380px;
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 10;
      & > div {
        background: #000b29ba;
      }
    }
  }
  .card {
    animation: fadeout 0.5s;
  }
  @keyframes fadeout {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
}
::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 10px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 1px;
}
::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  background: rgba(21, 50, 125, 0.8);
}
::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  background: rgba(21, 50, 125, 0.4);
}
</style>
