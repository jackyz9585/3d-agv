export interface Params {
  [param: string]: any;
}

export interface CTUAGVData {
  id: string;
  x: number;
  y: number;
  direction: number;
  code?: string;
  errorMsg?: string;
  ip?: string;
  stop?: string;
  exclude?: string;
  battery?: string;
  speed?: number;
  status?: string;
  deliveryTime?: string;
  statusColor?: string;
}

export interface CTUAGVResponse {
  code: number;
  msg: string;
  success: boolean;
  data: CTUAGVData[];
}
