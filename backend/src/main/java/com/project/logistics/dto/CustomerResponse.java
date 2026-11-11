package com.project.logistics.dto;

import com.project.logistics.entity.CustomerType;

public class CustomerResponse {

    private Long customerId;
    private String customerCode;
    private String name;
    private String phone;
    private String email;
    private CustomerType customerType;
    private long shipmentCount;

    public CustomerResponse() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerCode() {
        return customerCode;
    }

    public void setCustomerCode(String customerCode) {
        this.customerCode = customerCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public CustomerType getCustomerType() {
        return customerType;
    }

    public void setCustomerType(CustomerType customerType) {
        this.customerType = customerType;
    }

    public long getShipmentCount() {
        return shipmentCount;
    }

    public void setShipmentCount(long shipmentCount) {
        this.shipmentCount = shipmentCount;
    }
}

