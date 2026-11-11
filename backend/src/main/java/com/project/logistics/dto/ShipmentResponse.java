package com.project.logistics.dto;

import com.project.logistics.entity.ShipmentStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ShipmentResponse {

    private Long shipmentId;
    private String trackingNumber;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private Long driverId;
    private String driverCode;
    private String driverName;
    private Long originHubId;
    private String originHubCode;
    private String originHubName;
    private String originCity;
    private String destinationAddress;
    private String destinationCity;
    private LocalDate createdDate;
    private LocalDate expectedDeliveryDate;
    private ShipmentStatus shipmentStatus;
    private BigDecimal weight;
    private boolean delayed;
    private long trackingEventCount;

    public ShipmentResponse() {
    }

    public Long getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(Long shipmentId) {
        this.shipmentId = shipmentId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
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

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public Long getOriginHubId() {
        return originHubId;
    }

    public void setOriginHubId(Long originHubId) {
        this.originHubId = originHubId;
    }

    public String getOriginHubCode() {
        return originHubCode;
    }

    public void setOriginHubCode(String originHubCode) {
        this.originHubCode = originHubCode;
    }

    public String getOriginHubName() {
        return originHubName;
    }

    public void setOriginHubName(String originHubName) {
        this.originHubName = originHubName;
    }

    public String getOriginCity() {
        return originCity;
    }

    public void setOriginCity(String originCity) {
        this.originCity = originCity;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }

    public String getDestinationCity() {
        return destinationCity;
    }

    public void setDestinationCity(String destinationCity) {
        this.destinationCity = destinationCity;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDate getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }

    public ShipmentStatus getShipmentStatus() {
        return shipmentStatus;
    }

    public void setShipmentStatus(ShipmentStatus shipmentStatus) {
        this.shipmentStatus = shipmentStatus;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public boolean isDelayed() {
        return delayed;
    }

    public void setDelayed(boolean delayed) {
        this.delayed = delayed;
    }

    public long getTrackingEventCount() {
        return trackingEventCount;
    }

    public void setTrackingEventCount(long trackingEventCount) {
        this.trackingEventCount = trackingEventCount;
    }
}

