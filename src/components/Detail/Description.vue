<template>
  <div style="overflow-y: auto; max-height:180px">
    <table class="main-table" border="1" cellspacing="0" cellpadding="0">
      <thead>
        <tr>
          <td>报警描述</td>
          <td>报警时间</td>
          <td>报警解除时间</td>
          <td>报警持续(min)</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ item.alarmDesc }}</td>
          <td>{{ item.beginDate }}</td>
          <td>{{ item.endDate }}</td>
          <td>{{ item.duration }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "Despription",
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped lang="scss">
.main-table {
  width: 100%;
  color: #fff;
  // border: 1px solid rgb(21, 50, 125);
  border: 1px solid #2d89feab;
  box-shadow: #2d89fe 0px 0px 10px;
  text-align: center;
  font-size: 14px;

  td {
    min-width: 100px;
    padding: 5px 10px;
    background-color: rgb(4, 13, 38, 0.5);
  }
}

// .scrollbar {
//   width: 10px;
//   height: 300px;
//   margin: 0 auto;
// }
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
