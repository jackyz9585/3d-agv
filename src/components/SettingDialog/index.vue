<template>
  <el-dialog
    class="setting-dialog"
    :title="dialogTitle"
    :close-on-click-modal="false"
    :visible.sync="dialogVisible"
    width="800px"
    :before-close="handleClose"
  >
    <div v-loading="loading">
      <div class="panel">
        <el-form
          ref="form"
          :model="form"
          :inline="true"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item
            label="设备号："
            key="1"
            v-if="dialogMode === 'add'"
            prop="deviceCode"
          >
            <el-autocomplete
              v-model="form.deviceCode"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入设备号"
              @select="handleSelect"
            ></el-autocomplete>
          </el-form-item>
          <el-form-item v-else key="2" label="设备号：">
            <span>{{ form.deviceCode }}</span>
          </el-form-item>
          <br />
          <el-form-item label="设备类型：">
            <span>{{ form.deviceType }}</span>
          </el-form-item>
          <br />
          <el-form-item label="显示长度：">
            <span v-if="form.sizew">{{ form.sizew }}</span>
          </el-form-item>
          <el-form-item label="显示宽度：">
            <span v-if="form.sizeh">{{ form.sizeh }}</span>
          </el-form-item>

          <br />
          <el-form-item label="显示旋转90度">
            <el-switch
              v-model="form.rotateFlag"
              active-value="1"
              inactive-value="0"
            ></el-switch>
          </el-form-item>
          <br />
          <el-form-item label="位置X坐标：" prop="posx">
            <el-input
              v-model="form.posx"
              class="small-input"
              placeholder="请输入X坐标"
            ></el-input
            >
          </el-form-item>
          <el-form-item label="位置Y坐标：" prop="posy">
            <el-input
              v-model="form.posy"
              class="small-input"
              placeholder="请输入Y坐标"
            ></el-input>
            
          </el-form-item>
          <el-form-item label="外观：" prop="model" class="small-input">
            <el-select v-model="form.model" placeholder="请选择外观">
              <el-option
                v-for="item in modelList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
                <div
                  style="display:flex;justify-content:space-between;align-items:center;"
                >
                  <span>{{ item.label }}</span>
                  <img
                    :src="modelImgConfig[item.value]"
                    alt=""
                    style="width:20px;height:20px"
                  />
                </div>
              </el-option>
            </el-select>
            <img :src="modelImgConfig[form.model]" alt="" class="model-img" />
          </el-form-item>
        </el-form>
        <div class="tip">
          <i class="el-icon-info"></i>
          底图西北角为坐标系原点，向东为x轴正方向，南为y轴正方向
        </div>
        <div class="error" v-if="overlapError">
          <i class="el-icon-warning"></i>
          存在位置冲突，坐标范围x:{{ overlapError.x1 }},y:{{
            overlapError.y1
          }}至x:{{ overlapError.x2 }},y:{{
            overlapError.y2
          }}已经存放了设备，设备号：{{ overlapError.deviceCode }}
        </div>
        <div class="error" v-if="rangeOutError">
          <i class="el-icon-warning"></i>
          设备范围已超出了楼层区域
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <div>
          <el-button @click="handleCloseDialog">取 消</el-button>
          <el-button type="primary" @click="handleConfirmDialog"
            >确 定</el-button
          >
        </div>
        <el-button
          v-if="dialogMode === 'edit'"
          @click="handleDeleteDevice"
          type="danger"
          >删除设备</el-button
        >
      </span>
    </div>
  </el-dialog>
</template>

<script>
import {
  getDevicesByCode,
  addDevice,
  updateDevice,
  deleteDevice,
} from "@/server/publicApi";

const Device1 = require("../../assets/deviceModel/Device1.png");
const BoxGeometry = require("../../assets/deviceModel/BoxGeometry.png");

export default {
  name: "SettingDialog",
  props: {
    dialogMode: {
      type: String,
      default: "add",
    },
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    currentFloor: {
      type: Object,
    },
    rectValidator: {
      type: Object,
    },
  },
  data() {
    const NUM_REG = /^([1-9]\d{0,2}|0)$/;
    function validator(rule, value, callback) {
      if (value === "") {
        callback(new Error("请输入坐标"));
      }
      if (!NUM_REG.test(value)) {
        callback(new Error("坐标值为三位以内正整数"));
      }
      callback();
    }
    return {
      form: {
        deviceCode: "",
        rotateFlag: "0",
        posx: "",
        posy: "",
        sizew: "",
        sizeh: "",
        deviceType: "",
        model: "Device1",
      },
      rules: {
        deviceCode: {
          required: true,
          message: "请选择设备",
        },
        posx: {
          validator: validator,
          trigger: "blur",
          required: true,
        },
        posy: {
          validator: validator,
          trigger: "blur",
          required: true,
        },
      },
      modelImgConfig: {
        Device1,
        BoxGeometry,
      },
      overlapError: null,
      rangeOutError: null,
      loading: false,
      modelList: [
        {
          value: "Device1",
          label: "模型1",
        },
        {
          value: "BoxGeometry",
          label: "模型2",
        },
      ],
    };
  },
  computed: {
    dialogTitle() {
      return this.dialogMode === "add" ? "新增" : "编辑";
    },
  },
  methods: {
    handleShowDialog() {
      this.$emit("update:dialogVisible", true);
    },
    handleCloseDialog() {
      this.$emit("update:dialogVisible", false);
    },
    handleClose() {
      this.handleCloseDialog();
    },
    // 1、验证设备重叠
    checkOverlay() {
      const { success, result } = this.rectValidator[
        this.dialogMode === "add" ? "addCheckOverlay" : "editCheckOverlay"
      ](this.form);
      if (!success) {
        this.overlapError = result.source;
      } else {
        this.overlapError = null;
      }
      return success;
    },
    // 2、验证范围超出底图
    checkRangeOut() {
      const success = this.rectValidator.checkRangeOut(this.form);
      if (!success) {
        this.rangeOutError = Object.create(null);
      } else {
        this.rangeOutError = null;
      }
      return success;
    },
    handleConfirmDialog() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 调用校验器
          // 1、验证设备重叠
          if (!this.checkOverlay()) return;
          // 2、验证范围超出底图
          if (!this.checkRangeOut()) return;
          this.loading = true;
          const params = {
            deviceCode: this.form.deviceCode,
            positionX: this.form.posx,
            positionY: this.form.posy,
            rotateFlag: this.form.rotateFlag,
            deviceX: this.form.sizew,
            deviceY: this.form.sizeh,
            deviceType: this.form.deviceType,
            model: this.form.model,
            locationMark: this.currentFloor.name,
          };
          (this.dialogMode === "add" ? addDevice : updateDevice)(params)
            .then((res) => {
              if (res.flag) {
                this.loading = false;
                this.$message.success("保存成功！");
                this.handleCloseDialog();
                this.$emit("updateRender", this.form.deviceCode);
              } else {
                this.$message.warning("保存失败！");
                this.loading = false;
              }
            })
            .catch(() => {
              this.loading = false;
            });
        }
      });
    },
    querySearchAsync(queryString, cb) {
      const params = {
        deviceCode: queryString,
        locationMark: this.currentFloor.name,
      };
      getDevicesByCode(params)
        .then((res) => {
          if (res.flag && res.list) {
            const result = (res.list || []).map((item) => {
              return {
                ...item,
                value: `${item.deviceCode} （${item.deviceType}）`,
              };
            });
            cb(result);
          } else {
            cb([]);
            this.form.deviceCode = "";
          }
        })
        .catch(() => {
          this.form.deviceCode = "";
        });
    },
    handleSelect(item) {
      this.form.deviceCode = item.deviceCode;
      this.form.sizew = item.deviceX;
      this.form.sizeh = item.deviceY;
      this.form.deviceType = item.deviceType;
    },
    handleDeleteDevice() {
      this.loading = true;
      const params = {
        deviceCode: this.form.deviceCode,
        locationMark: this.currentFloor.name,
      };
      deleteDevice(params)
        .then((res) => {
          if (res.flag) {
            this.loading = false;
            this.$message.success("删除成功！");
            this.handleCloseDialog();
            this.$emit("updateRender");
          } else {
            this.$message.warning("删除失败！");
            this.loading = false;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    // 编辑，初始化数据  此方法共外部调用
    getData(deviceData) {
      this.form = { ...deviceData };
    },
  },
  watch: {
    dialogVisible: {
      handler(v) {
        if (v) {
          this.$refs.form && this.$refs.form.resetFields();
          this.form = {
            deviceCode: "",
            rotateFlag: "0",
            posx: "",
            posy: "",
            sizew: "",
            sizeh: "",
            osizew: "",
            osizeh: "",
            deviceType: "",
            model: "Device1",
          };
          this.overlapError = null;
          this.rangeOutError = null;
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
.panel {
  ::v-deep .el-input__inner {
    width: 510px;
  }
  .small-input {
    width: auto;
    ::v-deep .el-input__inner {
      width: 160px;
      margin-right: 10px;
    }
    ::v-deep .el-input__suffix {
      right: 15px;
    }
  }
  .tip {
    color: #d4d4d4;
  }
  .error {
    color: #f56c6c;
  }
  .model-img {
    width: 70px;
    height: 70px;
    position: absolute;
    left: 313px;
  }
}
.setting-dialog {
  .dialog-footer {
    display: flex;
    justify-content: space-between;
    flex-direction: row-reverse;
    padding-top: 10px;
  }
}
</style>
