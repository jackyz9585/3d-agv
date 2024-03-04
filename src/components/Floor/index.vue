<template>
  <div
    :class="['floor-selector', data.active || hover ? 'hover' : 'base']"
    tabindex="0"
    @click="handleClick"
    @keyup.enter="handleClick"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
  >
    <div class="floor-icon"></div>
    <div class="floor-txt">{{ data.name }}</div>
  </div>
</template>

<script>
export default {
  name: "Floor",
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      hover: false,
    };
  },
  methods: {
    handleClick() {
      this.$emit("select", this.data);
    },
    handleEnter() {
      this.hover = true;
    },
    handleLeave() {
      this.hover = false;
    },
  },
};
</script>

<style scoped lang="scss">
.floor-selector {
  cursor: pointer;
  scale: 0.95;
  display: flex;
  .floor-icon {
    width: 2rem;
    background-size: cover;
  }
  .floor-txt {
    font-size: 0.26rem;
    line-height: 1rem;
  }
}
.base {
  .floor-icon {
    background-image: url(../../assets/f-base.png);
  }
  .floor-txt {
    color: rgba(255, 255, 255, 0.4);
  }
  animation: hoverOff 0.3s;
  scale: 0.95;
}
.hover {
  .floor-icon {
    background-image: url(../../assets/f-hover.png);
  }
  .floor-txt {
    color: #fff;
  }
  animation: hoverOn 0.3s;
  scale: 1;
}

@keyframes hoverOn {
  from {
    scale: 0.95;
  }
  to {
    scale: 1;
  }
}
@keyframes hoverOff {
  from {
    scale: 1;
  }
  to {
    scale: 0.95;
  }
}
</style>
