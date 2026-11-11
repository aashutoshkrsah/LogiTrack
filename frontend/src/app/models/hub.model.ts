export interface HubRequest {
  hubCode: string;
  hubName: string;
  city: string;
  address: string;
  contactNumber: string;
}

export interface HubResponse {
  hubId: number;
  hubCode: string;
  hubName: string;
  city: string;
  address: string;
  contactNumber: string;
  originShipmentCount: number;
}

