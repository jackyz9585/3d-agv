<template>
  <div class="area" :style="{ background: data.color }">
    {{ data.label }}
  </div>
</template>

<script>
export default {
  name: "Area",
  props: {
    data: {
      type: Object,
    },
  },
};
</script>

<style scoped lang="scss">
.area {
  width: 80px;
  height: 30px;
  line-height: 30px;
  color: #fff;
  text-align: center;
}
</style>
