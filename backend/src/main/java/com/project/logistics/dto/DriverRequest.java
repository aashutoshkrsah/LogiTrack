package com.project.logistics.dto;

import com.project.logistics.entity.AvailabilityStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class DriverRequest {

    @NotBlank(message = "Driver code is required")
    @Size(min = 3, max = 30, message = "Driver code must be between 3 and 30 characters")
    private String driverCode;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^(?=(?:.*\\d){7,15})[+]?[0-9\\s\\-()]{7,20}$",
        message = "Phone number must contain 7 to 15 digits and valid formatting characters"
    )
    private String phone;

    @NotBlank(message = "Licence number is required")
    @Size(min = 4, max = 50, message = "Licence number must be between 4 and 50 characters")
    private String licenceNumber;

    @NotNull(message = "Availability status is required")
    private AvailabilityStatus availabilityStatus;

    public DriverRequest() {
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
}

