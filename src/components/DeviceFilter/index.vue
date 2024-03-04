<template>
  <el-dialog
    class="device-filter-dialog"
    title="查询"
    :close-on-click-modal="false"
    :visible.sync="visible"
    width="500px"
    :before-close="handleClose"
  >
    <div>
      <div class="panel">
        <el-form ref="form" :model="filter" label-width="120px">
          <el-form-item label="工序：">
            <el-autocomplete
              clearable
              class="field"
              v-model="filter.stepName"
              :fetch-suggestions="
                (...args) => {
                  querySearchAsync('stepName', ...args)
                }
              "
            ></el-autocomplete>
          </el-form-item>
          <el-form-item label="机型：">
            <el-autocomplete
              clearable
              class="field"
              v-model="filter.deviceType"
              :fetch-suggestions="
                (...args) => {
                  querySearchAsync('deviceType', ...args)
                }
              "
            ></el-autocomplete>
          </el-form-item>
          <el-form-item label="工单：">
            <el-autocomplete
              clearable
              class="field"
              v-model="filter.lotId"
              :fetch-suggestions="
                (...args) => {
                  querySearchAsync('lotId', ...args)
                }
              "
            ></el-autocomplete>
          </el-form-item>
          <el-form-item label="客户代码：" style='width:74%'>
            <el-input
              v-model="filter.recipeName"
              class="el-autocomplete field"
              placeholder=""
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <div>
          <el-button @click="handleResetDialog">重 置</el-button>
          <el-button type="primary" @click="handleConfirmDialog"
            >确 定</el-button
          >
        </div>
      </span>
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    deviceData: {
      type: Array,
      default: () => [],
    },
    deviceFilter: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      filter: {
        stepName: '',
        deviceType: '',
        order: '', //工单
        recipeName: '',
      },
    }
  },
  watch: {
    visible: {
      handler(v) {
        if (v) {
          this.filter.stepName = this.deviceFilter.stepName || ''
          this.filter.deviceType = this.deviceFilter.deviceType || ''
          this.filter.order = this.deviceFilter.order || ''
          this.filter.recipeName = this.deviceFilter.recipeName || ''
        }
      },
    },
  },
  methods: {
    handleResetDialog() {
      this.filter = {
        stepName: '',
        deviceType: '',
        order: '',
        recipeName: '',
      }
      this.handleConfirmDialog()
    },
    handleCloseDialog() {
      this.$emit('update:visible', false)
    },
    handleConfirmDialog() {
      this.$emit('confirm', this.filter)
      this.handleCloseDialog()
    },
    handleClose() {
      this.handleCloseDialog()
    },

    // 搜索值
    querySearchAsync(field, queryString, cb) {
      const filterByField = (field, queryString) => {
        const list = [
          ...new Set(this.deviceData.map((d) => d[field]).filter(Boolean)),
        ].map((v) => ({
          value: v,
        }))
        return queryString
          ? list.filter(
              (v) =>
                v.value.toLowerCase().indexOf(queryString.toLowerCase()) > -1
            )
          : list
      }
      cb(filterByField(field, queryString))
    },
  },
}
</script>

<style lang="scss" scoped>
.device-filter-dialog {
  .dialog-footer {
    display: flex;
    justify-content: space-between;
    flex-direction: row-reverse;
    padding-top: 10px;
  }
}
</style>