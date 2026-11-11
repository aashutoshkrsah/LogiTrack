package com.project.logistics.dto;

public class HubResponse {

    private Long hubId;
    private String hubCode;
    private String hubName;
    private String city;
    private String address;
    private String contactNumber;
    private long originShipmentCount;

    public HubResponse() {
    }

    public Long getHubId() {
        return hubId;
    }

    public void setHubId(Long hubId) {
        this.hubId = hubId;
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

    public long getOriginShipmentCount() {
        return originShipmentCount;
    }

    public void setOriginShipmentCount(long originShipmentCount) {
        this.originShipmentCount = originShipmentCount;
    }
}

