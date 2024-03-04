<template>
  <div class="device-filter" ref="deviceFilter" @click="closeInnerPop">
    <div class="header">
      <span>查询</span>
      <span>
        <el-popover placement="top" width="180" v-model="visible" ref="pop">
          <el-table
            ref="multipleTable"
            :data="filedTable"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column label="查询条件" min-width="120" prop="label">
            </el-table-column>
          </el-table>
          <i
            class="el-icon-setting"
            slot="reference"
            title="设置查询条件"
            @click.stop
          ></i>
        </el-popover>
        <i
          class="el-icon-refresh-left"
          @click="handleClearValue"
          title="清除查询内容"
        ></i>
        <i
          class="el-icon-delete"
          title="清除查询条件"
          @click="handleClearAll"
        ></i>
      </span>
    </div>
    <div class="content">
      <div class="item" v-for="(item, index) in selectedFields" :key="index">
        <div class="label">{{ item.label }}</div>
        <el-autocomplete
          clearable
          class="field"
          size="mini"
          v-model="filter[item.value]"
          @change="handleSelect"
          @select="handleSelect"
          @keyup.enter.native="handleSelect"
          :fetch-suggestions="
            (...args) => {
              querySearchAsync(item.value, ...args);
            }
          "
        ></el-autocomplete>
      </div>
    </div>
  </div>
</template>

<script>
// 默认提供的查询字段
const defaultField = [];
export default {
  name: "DeviceFilter",
  props: {
    deviceData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      // deviceData: [
      //   {
      //     id: 1,
      //     deviceCode: "设备1",
      //     customer: "客户1",
      //     deviceType: "型号1",
      //     status: "RUN",
      //   },
      //   {
      //     id: 2,
      //     deviceCode: "设备2",
      //     customer: "客户2",
      //     deviceType: "型号2",
      //     status: "OFFLINE",
      //   },
      //   {
      //     id: 3,
      //     deviceCode: "设备3",
      //     customer: "客户1",
      //     deviceType: "型号1",
      //   },
      // ],
      filedTable: [
        // {
        //   label: "客户",
        //   value: "customer",
        // },
        {
          label: "设备状态",
          value: "status",
        },
        {
          label: "设备编码",
          value: "deviceCode",
        },
        {
          label: "设备型号",
          value: "deviceType",
        },
        {
          label: "工序",
          value: "stepName",
        },
      ],
      selectedFields: [],
      defaultField: defaultField,
      filter: {},
      visible: false,
    };
  },

  methods: {
    handleSelect() {
      // 去掉值为空的条件
      const filter = Object.keys(this.filter)
        .filter((k) => Boolean(this.filter[k]))
        .reduce((pre, cur) => ({ ...pre, [cur]: this.filter[cur] }), {});
      this.$emit("confirm", filter);
    },

    // 搜索值
    querySearchAsync(field, queryString, cb) {
      const filterByField = (field, queryString) => {
        const list = [
          ...new Set(this.deviceData.map((d) => d[field]).filter(Boolean)),
        ].map((v) => ({
          value: v,
        }));
        return queryString
          ? list.filter(
              (v) =>
                v.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1
            )
          : list;
      };
      cb(filterByField(field, queryString));
    },
    handleSelectionChange(rows) {
      this.selectedFields = rows;
      this.filter = this.selectedFields.reduce((pre, cur) => {
        return { ...pre, [cur.value]: this.filter[cur.value] || "" };
      }, {});
      setTimeout(() => {
        this.handleSelect();
      }, 0);
    },
    toggleSelection(rows) {
      if (rows) {
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    // 清除查询内容
    handleClearValue() {
      Object.keys(this.filter).forEach((k) => {
        this.filter[k] = "";
      });
      this.handleSelect();
    },
    // 清除查询条件
    handleClearAll() {
      this.selectedFields = [];
      this.$nextTick(() => {
        this.toggleSelection();
      });
      this.filter = {};
      this.handleSelect();
    },
    closeInnerPop() {
      this.$refs.pop && this.$refs.pop.doClose();
    },
  },

  mounted() {
    // 将默认值填入selectedFields
    this.selectedFields = this.filedTable.filter((r) =>
      this.defaultField.includes(r.value)
    );
    this.$nextTick(() => {
      this.toggleSelection(this.selectedFields);
    });
  },
};
</script>
<style lang="scss">
.el-popper {
  padding: 0 !important;
}
.el-table td,
.el-table th {
  padding: 5px 0 !important;
}
</style>
<style lang="scss" scoped>
.device-filter {
  // background: #2d89fe42;
  // border: 1px solid #2d89feab;
  // box-shadow: #2d89fe 0px 0px 2px;

  // color: #fff;

  // border-radius: 0 0 2px 2px;
  width: 300px;

  padding: 5px;

  .header {
    line-height: 24px;
    display: flex;
    justify-content: space-between;
    i {
      margin-left: 8px;
    }
  }

  .content {
    .item {
      display: flex;
      margin-top: 5px;
      .label {
        width: 100px;
        line-height: 28px;
      }
      .field {
        flex: 1;
      }
    }
    ::v-deep .el-input input {
      // background-color: #e9f1ff !important;
      padding: 5px;
    }
  }
  .down {
    text-align: center;
  }
}
</style>
