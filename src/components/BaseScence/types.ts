import { FloorData } from "@/components/BaseScence/Command/types/floor";
import { DeviceData } from "@/components/BaseScence/Command/device/types";

export interface GroupFloorData {
  groupId: string;
  geometryConfig: FloorData;
}

export interface GroupDeviceData {
    groupId: string;
    geometries: DeviceData[];
  }