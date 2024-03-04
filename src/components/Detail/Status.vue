<template>
  <div>
    <table class="main-table" border="1" cellspacing="0" cellpadding="0">
      <tbody>
        <tr>
          <td>UPH</td>
          <td>{{ data.uph }}</td>
        </tr>
        <tr>
          <td>OEE</td>
          <td>{{ data.oee }}%</td>
        </tr>
        <tr>
          <td>MTBA</td>
          <td>{{ data.mtba }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "Status",
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
