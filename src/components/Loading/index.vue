<template>
  <div class="loading" v-show="visible">
    <div :class="['sector', 'left', loading ? 'show' : 'hide']"></div>
    <div :class="['sector', 'right', loading ? 'show' : 'hide']"></div>

    <div :class="['circle', 'out', loading ? 'show' : 'hide']">
      <div class="circle inner">Loading...</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "loading",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      visible: false,
      // loading: true,
    };
  },
  watch: {
    loading: {
      handler(v) {
        if (v) {
          this.visible = true;
        } else {
          setTimeout(() => {
            this.visible = false;
          }, 2000);
        }
      },
      immediate: true,
    },
  },
};
</script>

<style scoped lang="scss">
.loading {
  position: fixed;
  top: 0;
  left: -20%;
  right: -20%;
  bottom: 0;
  // background: rgba(0, 11, 41, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  .sector {
    width: calc(50% + 0.5px);
    height: 100%;
    background: rgba(0, 11, 41, 0.9);
    // border: 1px solid rgb(45, 137, 254);
    transform: skewX(-37deg);
    position: absolute;
  }
  .sector.left {
    left: 0;
  }

  .sector.hide.left {
    transform: skewX(-37deg) translate(-100%, 0);
    animation: sectorleft 2s;
    opacity: 0;
  }
  .sector.right {
    right: 0;
  }
  .sector.hide.right {
    transform: skewX(-37deg) translate(100%, 0);
    animation: sectorright 2s;
    opacity: 0;
  }
  .circle {
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: rgb(45, 137, 254) 0px 0px 10px;
    animation: breath 2s infinite;
    z-index: 999;
  }
  .circle.out {
    width: 100px;
    height: 100px;
    border-radius: 50px;
    border: 2px solid rgb(45, 137, 254);
  }
  .circle.out.hide {
    animation: fadeout 0.5s;
    opacity: 0;
  }
  .circle.inner {
    width: 96px;
    height: 96px;
    border-radius: 48px;
    color: #00ffff;
  }
}
@keyframes fadeout {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
@keyframes breath {
  0% {
    box-shadow: rgb(45, 137, 254) 0px 0px 15px;
  }
  50% {
    box-shadow: rgb(45, 137, 254) 0px 0px 2px;
  }
  100% {
    box-shadow: rgb(45, 137, 254) 0px 0px 15px;
  }
}
@keyframes sectorleft {
  0% {
    transform: skewX(-37deg) translate(0%, 0);
    opacity: 0.9;
  }
  100% {
    transform: skewX(-37deg) translate(-100%, 0);
    opacity: 0;
  }
}
@keyframes sectorright {
  0% {
    transform: skewX(-37deg) translate(0%, 0);
    opacity: 0.9;
  }
  100% {
    transform: skewX(-37deg) translate(100%, 0);
    opacity: 0;
  }
}
</style>
