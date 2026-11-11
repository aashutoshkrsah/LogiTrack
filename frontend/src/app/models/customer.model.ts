export type CustomerType = 'INDIVIDUAL' | 'CORPORATE' | 'ECOMMERCE' | 'RETAIL';

export interface CustomerRequest {
  customerCode: string;
  name: string;
  phone: string;
  email: string;
  customerType: CustomerType;
}

export interface CustomerResponse {
  customerId: number;
  customerCode: string;
  name: string;
  phone: string;
  email: string;
  customerType: CustomerType;
  shipmentCount: number;
}

