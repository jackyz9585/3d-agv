<template>
  <div>
    <BaseScence
      v-if="showModel === 'scence'"
      :currentBuild="currentBuild"
      mode="view"
      @backHome="checkModel"
    />
    <homePage v-if="showModel === 'home'" @checkBuild="checkBuild" />
  </div>
</template>

<script>
import BaseScence from "@/components/BaseScence";
import homePage from "@/views/homePage/index.vue";

export default {
  name: "Layout",
  components: {
    BaseScence,
    homePage,
  },
  data() {
    return {
      showModel: "home",
      //楼索
      currentBuild: null,
    };
  },
  watch: {
    $route: {
      handler() {
        // 如果页面有参数，直接进入楼层
        const bid = this.$route.query.bid;
        const fid = this.$route.query.fid;
        if (bid) {
          this.checkBuild({ bid, fid });
        } else {
          this.checkModel();
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    checkModel() {
      this.$router
        .push({
          name: "layout",
          query: {},
        })
        .catch((e) => {});
      this.showModel = "home";
    },
    checkBuild({ bid, fid }) {
      this.$router
        .push({
          name: "layout",
          query: {
            bid,
            fid,
          },
        })
        .catch((e) => {});
      this.showModel = "scence";
      // 获取点选厂部信息
      this.currentBuild = window.buildList.find((b) => b.id === bid);
    },
  },
};
</script>

<style></style>
