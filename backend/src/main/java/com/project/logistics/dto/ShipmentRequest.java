package com.project.logistics.dto;

import com.project.logistics.entity.ShipmentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ShipmentRequest {

    @NotBlank(message = "Tracking number is required")
    @Size(min = 4, max = 40, message = "Tracking number must be between 4 and 40 characters")
    private String trackingNumber;

    @NotNull(message = "Customer selection is required")
    private Long customerId;

    private Long driverId;

    @NotNull(message = "Origin hub selection is required")
    private Long originHubId;

    @NotBlank(message = "Destination address is required")
    @Size(min = 5, max = 255, message = "Destination address must be between 5 and 255 characters")
    private String destinationAddress;

    @NotBlank(message = "Destination city is required")
    @Size(min = 2, max = 80, message = "Destination city must be between 2 and 80 characters")
    private String destinationCity;

    @NotNull(message = "Created date is required")
    private LocalDate createdDate;

    @NotNull(message = "Expected delivery date is required")
    private LocalDate expectedDeliveryDate;

    private ShipmentStatus shipmentStatus;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.01", inclusive = true, message = "Weight must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Weight must have up to 8 digits and 2 decimal places")
    private BigDecimal weight;

    public ShipmentRequest() {
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

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public Long getOriginHubId() {
        return originHubId;
    }

    public void setOriginHubId(Long originHubId) {
        this.originHubId = originHubId;
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
}

