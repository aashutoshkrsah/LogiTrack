package com.project.logistics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class HubRequest {

    @NotBlank(message = "Hub code is required")
    @Size(min = 3, max = 30, message = "Hub code must be between 3 and 30 characters")
    private String hubCode;

    @NotBlank(message = "Hub name is required")
    @Size(min = 2, max = 120, message = "Hub name must be between 2 and 120 characters")
    private String hubName;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 80, message = "City must be between 2 and 80 characters")
    private String city;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 255, message = "Address must be between 5 and 255 characters")
    private String address;

    @NotBlank(message = "Contact number is required")
    @Pattern(
        regexp = "^(?=(?:.*\\d){7,15})[+]?[0-9\\s\\-()]{7,20}$",
        message = "Contact number must contain 7 to 15 digits and valid formatting characters"
    )
    private String contactNumber;

    public HubRequest() {
    }

    public String getHubCode() {
        return hubCode;
    }

    public void setHubCode(String hubCode) {
        this.hubCode = hubCode;
    }

    public String getHubName() {
        return hubName;
    }

    public void setHubName(String hubName) {
        this.hubName = hubName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
}

