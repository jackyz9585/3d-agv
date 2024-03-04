<template>
  <div>
    <table class="main-table" border="1" cellspacing="0" cellpadding="0">
      <tbody>
        <tr>
          <td>平均UPH</td>
          <td>{{ data.UPH }}</td>
        </tr>
        <tr>
          <td>平均OEE</td>
          <td>{{ data.OEE }}</td>
        </tr>
         <tr>
          <td>平均MTBA</td>
          <td>{{ data.MTBA }}</td>
        </tr>
        <tr>
          <td>数量</td>
          <td>{{ data.NUM }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "AvgOee",
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style scoped lang="scss">
.main-table {
  font-size: 14px;
  width: 100%;
  color: #fff;
  // border: 1px solid rgb(21, 50, 125);
  border: 1px solid #2d89feab;
  box-shadow: #2d89fe 0px 0px 10px;
  text-align: center;
  td {
    min-width: 100px;
    padding: 5px 10px;
    background-color: rgb(4, 13, 38, 0.5);
  }
}
</style>
