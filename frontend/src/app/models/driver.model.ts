export type AvailabilityStatus = 'AVAILABLE' | 'ON_DUTY' | 'ON_LEAVE' | 'INACTIVE';

export interface DriverRequest {
  driverCode: string;
  fullName: string;
  phone: string;
  licenceNumber: string;
  availabilityStatus: AvailabilityStatus;
}

export interface DriverResponse {
  driverId: number;
  driverCode: string;
  fullName: string;
  phone: string;
  licenceNumber: string;
  availabilityStatus: AvailabilityStatus;
  shipmentCount: number;
}

