// 每层楼对应的动态物体原点点位、及ui底图的视图边距
//      x
//      |
//      |
// y----|
export const config = {
  //四楼
  DD: {
    //ui图与实际厂区比例  实际（米）*scale = 视图
    scale: 9.42,
    //实际 ctu原点距离厂区原点偏移量  （米
    agvOriginPoint: {
      x: 0.5,
      y: -2.43,
    },
  },
  //三楼
  BB: {
    //ui图与实际厂区比例  实际（米）*scale = 视图
    scale: 9.42,
    //实际 ctu原点距离厂区原点偏移量  （米
    agvOriginPoint: {
      x: -11.77,
      y: -14.26,
    },
  },
  //二楼
  AA: {
    //ui图与实际厂区比例  实际（米）*scale = 视图
    scale: 6.65,
    //实际 ctu原点距离厂区原点偏移量  （米
    agvOriginPoint: {
      x: -27.11,
      y: -18.23,
    },
  },
  //一楼
  EE: {
    //ui图与实际厂区比例  实际（米）*scale = 视图
    scale: 9.31,
    //实际 ctu原点距离厂区原点偏移量  （米
    agvOriginPoint: {
      x: -42.58,
      y: -32.59,
    },
  },
};

// 坐标系数 毫米转为米
export const coefficient = 0.001;
