import { apiRequest } from "./client";

export interface RegionDto {
  id: number;
  name: string;
  code: string;
}

export async function getRegions(): Promise<RegionDto[]> {
  return apiRequest<RegionDto[]>("/regions");
}

