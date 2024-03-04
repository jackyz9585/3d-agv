import { basePost, baseGet } from "@/utils/api.js";
import { ctuData4, ctuData3, ctuData2, ctuData1 } from "./ctuData";
import { data } from "./3dDarta";
import { Params, CTUAGVResponse } from "@/server/types";
const mock = false;

//首页
//设备总数
export const inspectionEqp = (p: Params) =>
  baseGet("/api/inspection/checklist/dianjian/eqp/status/count", p);

// OEE(当天)
export const inspectionOee = (p: Params) =>
  baseGet("/api/inspection/checklist/dianjian/oee/current/day", p);

// 各设备状态
export const inspectionEqpStatus = (p: Params) =>
  baseGet("/api/inspection/checklist/dianjian/eqp/status/factoryCodes", p);

// 各设备产能
export const inspectionCapacity = (p: Params) =>
  baseGet("/api/inspection/checklist/dianjian/equipment/capacity", p);

// MTBA趋势
export const inspectionMtba = (p: Params) =>
  baseGet("/api/inspection/checklist/dianjian/threed/getMtbaTrend", p);

//   各部OEE
export const inspectionDepartment = (p: Params) =>
  baseGet("/api/inspection/checklist/dianjian/oee/trend/department", p);

//   OOE趋势
export const inspectionOeeTrend = (p: Params) =>
  baseGet("/api/inspection/checklist/dianjian/threed/getOeeTrend", p);

// 3d场景
// 根据设备号查询设备
export const getDevicesByCode = (p: Params) =>
  baseGet("/api/query/like/device/location/info", p);

//新增画布中的设备
export const addDevice = (p: Params) =>
  basePost("/api/save/device/location/info", p);

//修改画布中的设备
export const updateDevice = (p: Params) =>
  basePost("/api/modify/device/location/info", p);

// 删除画布中的设备
export const deleteDevice = (p: Params) =>
  baseGet("/api/delete/device/location/info", p);

// 查询接驳位状态
export const getDockingStatus = (p: Params) =>
// @ts-ignore
  baseGet(`/api/${window.SYSTEM_API}/mdMap/getAgvPosition`, p);
  
// 查询一层楼的设备列表
export const getDeviceList = (p: Params) => {
  let res = {
    data: {
      deviceInfo: [],
    },
    flag: true,
  };
  // // 用于不同楼层测试
  // if (p.locationMark === "BOF2") {
  //   res = {
  //     flag: true,
  //     data: {
  //       deviceInfo: [
  //         {
  //           deviceCode: "W-1",
  //           deviceX: "10",
  //           deviceY: "10",
  //           model: "BasicBoxGeometry",
  //           positionX: "50",
  //           positionY: "50",
  //           status: "IDLE",
  //         },
  //       ],
  //     },
  //   };
  // }
  if (p.locationMark === "BOF2") {
    res = {
      data: {
        deviceInfo: data,
      },
      flag: true,
    };
  }
  // return baseGet("/api/3d/factory/info", p);
  return Promise.resolve(res);
};

// 查询一层楼的设备列表(从数据库拿实时数据)
export const getRealDeviceList = (p: Params) =>
  baseGet("/api/3d/factory/info/real/time", p);

// 设备详情
export const getDeviceDetail = (p: Params) => {
  // return baseGet("/api/3d/device/detail", p)
  return Promise.resolve({ flag: true, data: null });
};

// 轮询判断
export const judgeDevice = (p: Params) => {
  if (!mock) {
    return baseGet("/api/3d/judge", p);
  }
  return Promise.resolve({ flag: false, msg: "不刷新", refresh: "NO" });
};

// 获取平均OEE MTBA数据
export const getAvgOee = (p: Params) => {
  // return baseGet("/api/inspection/checklist/dianjian/threed/getAvgOee", p);
  return Promise.resolve({ MTBA: 0, UPH: 1, OEE: 0, NUM: 0 });
};

let n1 = 0;
let n2 = 0;
let n3 = 0;
let n4 = 0;
// 轮询查询CTU
export const getCTUAGV = (p: Params): Promise<CTUAGVResponse> => {
  if (!mock) {
    // @ts-ignore
    return baseGet(`/api/${window.SYSTEM_API}/mdMap/getAgvStatus`, p);
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      switch (p.locationMark) {
        case "DD":
          resolve({
            code: 200,
            msg: "成功",
            success: true,
            data: [
              {
                id: "4",
                x: ctuData4[n4 % ctuData4.length].x,
                y: ctuData4[n4 % ctuData4.length].y,
                direction: ctuData4[n4 % ctuData4.length].direction,
                code: "5678",
                battery: ctuData4[n4 % ctuData4.length].battery,
                speed: 1089,
                status: ctuData4[n4 % ctuData4.length].status,
                statusColor: ctuData4[n4 % ctuData4.length].statusColor,
                deliveryTime: ctuData4[n4 % ctuData4.length].deliveryTime,
              },
            ],
          });
          n4++;
          break;
        case "BB":
          resolve({
            code: 200,
            msg: "成功",
            success: true,
            data: [
              {
                id: "3",
                x: ctuData3[n3 % ctuData3.length].x,
                y: ctuData3[n3 % ctuData3.length].y,
                direction: ctuData3[n3 % ctuData3.length].direction,
                code: "123",
                battery: "50",
                speed: 4,
                status:
                  "一段超长的状态一段超长的状态一段超长的状态一段超长的状态",
              },
            ],
          });
          n3++;
          break;
        case "AA":
          resolve({
            code: 200,
            msg: "成功",
            success: true,
            data: [
              {
                id: "3",
                x: ctuData2[n2 % ctuData2.length].x,
                y: ctuData2[n2 % ctuData2.length].y,
                direction: ctuData2[n2 % ctuData2.length].direction,
                code: "123",
                battery: "50",
                speed: 4,
                status: "IDLE",
              },
            ],
          });
          n2++;
          break;
        case "EE":
          resolve({
            code: 200,
            msg: "成功",
            success: true,
            data: [
              {
                id: "3",
                x: ctuData1[n1 % ctuData1.length].x,
                y: ctuData1[n1 % ctuData1.length].y,
                direction: ctuData1[n1 % ctuData1.length].direction,
                code: "123",
                battery: "50",
                speed: 4,
                status: "IDLE",
              },
            ],
          });
          n1++;
          break;
      }
    }, 500);
  });
};

export const getLineChartData = (p: Params): Promise<any> => {
  if (!mock) {
    return baseGet("/api/wmssjzdev/kanban/workBenchThroughputSkuStatics", p);
  }
  return Promise.resolve({
    requestId: "76d74f917af1462fa5d6a7eb7f408b00",
    flag: true,
    code: "200",
    msg: "成功",
    type: "LineChart",
    data: [
      {
        id: "1",
        name: "sun",
        value: "89",
      },
      {
        id: "2",
        name: "Mon",
        value: "63",
      },
      {
        id: "3",
        name: "Tue",
        value: "176",
      },
      {
        id: "4",
        name: "web",
        value: "108",
      },
      {
        id: "5",
        name: "Thu",
        value: "246",
      },
      {
        id: "6",
        name: "Fri",
        value: "225",
      },
      {
        id: "7",
        name: "Sat",
        value: "135",
      },
    ],
  });
};

export const getBarChartData = (p: Params): Promise<any> => {
  if (!mock) {
    return baseGet("/api/wmssjzdev/kanban/tunnelCapacityProportionStatics", p);
  }
  return Promise.resolve({
    requestId: "67e13c5dba49419e96846ce2d1bOe284",
    flag: true,
    code: 200,
    type: "BarChart",
    data: [
      { id: "1", name: "A", value: "102.0" },
      { id: "2", name: "B", value: "109.0" },
      { id: "3", name: "C", value: "116.0" },
      { id: "4", name: "D", value: "110.0" },
      { id: "5", name: "E", value: "98.0" },
      { id: "6", name: "F", value: "98.0" },
      { id: "7", name: "G", value: "90.0" },
      { id: "8", name: "H", value: "82.0" },
    ],
  });
};

export const getPieChartData = (p: Params): Promise<any> => {
  if (!mock) {
    return baseGet("/api/wmssjzdev/kanban/jobTypeThroughputSkuStatics", p);
  }
  return Promise.resolve({
    requestId: "4d3a9ce5dod748ffaa818abb45f1bc3d",
    code: "200",
    msg: "成功",
    data: [
      {
        id: "1",
        name: "疲劳单",
        value: "68",
      },
      {
        id: "2",
        name: "手动出库",
        value: "2621",
      },
      {
        id: "3",
        name: "小样单",
        value: "317",
      },
      {
        id: "4",
        name: "拉力单",
        value: "86",
      },
      {
        id: "5",
        name: "批量出库",
        value: "1771",
      },
    ],
    flag: true,
    type: "PieChart",
  });
};

export const getTableChartData = (p: Params): Promise<any> => {
  if (!mock) {
    return baseGet("/api/wmssjzdev/kanban/completedSkuStatics", p);
  }
  return Promise.resolve({
    requestId: "67e13c5dba49419e96846ce2d1bOe284",
    flag: true,
    code: 200,
    type: "TableChart",
    data: [
      {
        jobType: "小样单",
        updateBy: "陈含希",
        skuNum: "94",
        taskNum: "689",
        times: "00:00-08:00",
      },
      {
        jobType: "拉力",
        updateBy: "王秋然",
        skuNum: "55",
        taskNum: "266",
        times: "00:00-08:00",
      },
      {
        jobType: "疲劳",
        updateBy: "麻富超",
        skuNum: "37",
        taskNum: "37",
        times: "00:00-08:00",
      },
      {
        jobType: "批量出库",
        updateBy: "高智帆",
        skuNum: "52",
        taskNum: "51",
        times: "00:00-08:00",
      },
      {
        jobType: "手动出库",
        updateBy: "张宇凡",
        skuNum: "64",
        taskNum: "112",
        times: "08:00-16:00",
      },
      {
        jobType: "手动出库",
        updateBy: "刘耀宗",
        skuNum: "57",
        taskNum: "173",
        times: "08:00-06:00",
      },
    ],
    headers: [
      { name: "作业类型", value: "jobType" },
      { name: "操作人", value: "updateBy" },
      { name: "SKU", value: "skuNum" },
      { name: "任务数", value: "taskNum" },
      { name: "时间段", value: "times" },
    ],
  });
};
