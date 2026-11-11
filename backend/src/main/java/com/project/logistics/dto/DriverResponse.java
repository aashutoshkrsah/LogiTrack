package com.project.logistics.dto;

import com.project.logistics.entity.AvailabilityStatus;

public class DriverResponse {

    private Long driverId;
    private String driverCode;
    private String fullName;
    private String phone;
    private String licenceNumber;
    private AvailabilityStatus availabilityStatus;
    private long shipmentCount;

    public DriverResponse() {
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public String getDriverCode() {
        return driverCode;
    }

    public void setDriverCode(String driverCode) {
        this.driverCode = driverCode;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLicenceNumber() {
        return licenceNumber;
    }

    public void setLicenceNumber(String licenceNumber) {
        this.licenceNumber = licenceNumber;
    }

    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public long getShipmentCount() {
        return shipmentCount;
    }

    public void setShipmentCount(long shipmentCount) {
        this.shipmentCount = shipmentCount;
    }
}

