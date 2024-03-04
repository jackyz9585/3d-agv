<!--各部设备产能-->
<template>
  <div class="status panel">
    <div class="title">
      <img src="../../assets/img/icon-gebushebeichanneng.png"
           alt="" />
    </div>
    <div class="content">
      <div v-for="(item, index) in dataList"
           :key="index">
        <span class="department">{{ item.department }}</span>
        <div class="progress">
          <img class="icon"
               :src="item.imgUrl"
               alt="" />
          <span class="text">{{ item.text }}</span>
        </div>
        <el-progress :percentage="item.percentage"
                     :status="item.type"></el-progress>
        <div class="text-num">
          <span>实际/预计</span>
          <span class="text progress-num">{{ item.progress }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { inspectionCapacity } from "@/server/publicApi";
export default {
  name: "Capacity",
  data () {
    return {
      dataList: [
        {
          department: "制造一部",
          percentage: 0,
          imgUrl: require("../../assets/img/icon-chanliang.png"),
          text: "0%",
          progress: "0/0",
          type: "success",
        },
        {
          department: "制造二部",
          percentage: 0,
          imgUrl: require("../../assets/img/icon-chanliang.png"),
          text: "0%",
          progress: "0/0",
          type: "warning",
        },
        {
          department: "制造三部",
          percentage: 0,
          imgUrl: require("../../assets/img/icon-chanliang.png"),
          text: "0%",
          progress: "0/0",
          type: "exception",
        },
      ],
    };
  },
  mounted () {
    this.initData();
  },
  methods: {
    initData () {
      let param = {};
      inspectionCapacity(param).then((res) => {
        this.dataList.forEach((item) => {
          res.forEach((map) => {
            if (item.department === map.factoryName) {
              item.text = map.proportion;
              item.percentage = (map.realYield / map.planYield) * 100;
              item.progress = map.realYield + "/" + map.planYield;
            }
          });
        });
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.panel {
  box-sizing: border-box;
  padding: 0.2rem 0.1rem;
  width: 4.7rem;
  height: 2rem;
  color: #fff;
  margin-bottom: 0.2rem;
  .title {
    img {
      width: 2.2rem;
    }
  }
  ::v-deep {
    .el-progress-bar {
      padding-right: 0;
    }
    .el-progress__text i {
      display: none;
    }
  }

  .content {
    display: flex;
    margin-top: 0.2rem;
    & > div {
      width: 1.4rem;
      padding: 0 0.1rem;
    }
    .icon {
      width: 0.28rem;
    }
    .text {
      font-size: 0.18rem;
      float: right;
    }
    .department {
      font-size: 0.16rem;
      color: #bbb3b3;
    }
    padding: 0 0.1rem;
    .progress {
      margin-top: 0.2rem;
    }
    .text-num {
      margin-top: 0.05rem;
    }
    .progress-num {
      font-size: 0.12rem;
    }
  }
}
</style>