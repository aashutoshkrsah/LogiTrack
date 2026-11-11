package com.project.logistics.service.impl;

import com.project.logistics.dto.CustomerResponse;
import com.project.logistics.dto.DriverResponse;
import com.project.logistics.dto.HubResponse;
import com.project.logistics.dto.ShipmentResponse;
import com.project.logistics.dto.TrackingEventResponse;
import com.project.logistics.entity.Customer;
import com.project.logistics.entity.Driver;
import com.project.logistics.entity.Hub;
import com.project.logistics.entity.Shipment;
import com.project.logistics.entity.ShipmentStatus;
import com.project.logistics.entity.TrackingEvent;
import java.time.LocalDate;

final class DtoMapper {

    private DtoMapper() {
    }

    static CustomerResponse toCustomerResponse(Customer customer, long shipmentCount) {
        CustomerResponse response = new CustomerResponse();
        response.setCustomerId(customer.getCustomerId());
        response.setCustomerCode(customer.getCustomerCode());
        response.setName(customer.getName());
        response.setPhone(customer.getPhone());
        response.setEmail(customer.getEmail());
        response.setCustomerType(customer.getCustomerType());
        response.setShipmentCount(shipmentCount);
        return response;
    }

    static DriverResponse toDriverResponse(Driver driver, long shipmentCount) {
        DriverResponse response = new DriverResponse();
        response.setDriverId(driver.getDriverId());
        response.setDriverCode(driver.getDriverCode());
        response.setFullName(driver.getFullName());
        response.setPhone(driver.getPhone());
        response.setLicenceNumber(driver.getLicenceNumber());
        response.setAvailabilityStatus(driver.getAvailabilityStatus());
        response.setShipmentCount(shipmentCount);
        return response;
    }

    static HubResponse toHubResponse(Hub hub, long originShipmentCount) {
        HubResponse response = new HubResponse();
        response.setHubId(hub.getHubId());
        response.setHubCode(hub.getHubCode());
        response.setHubName(hub.getHubName());
        response.setCity(hub.getCity());
        response.setAddress(hub.getAddress());
        response.setContactNumber(hub.getContactNumber());
        response.setOriginShipmentCount(originShipmentCount);
        return response;
    }

    static ShipmentResponse toShipmentResponse(Shipment shipment, long trackingEventCount) {
        ShipmentResponse response = new ShipmentResponse();
        response.setShipmentId(shipment.getShipmentId());
        response.setTrackingNumber(shipment.getTrackingNumber());

        if (shipment.getCustomer() != null) {
            response.setCustomerId(shipment.getCustomer().getCustomerId());
            response.setCustomerCode(shipment.getCustomer().getCustomerCode());
            response.setCustomerName(shipment.getCustomer().getName());
        }

        if (shipment.getDriver() != null) {
            response.setDriverId(shipment.getDriver().getDriverId());
            response.setDriverCode(shipment.getDriver().getDriverCode());
            response.setDriverName(shipment.getDriver().getFullName());
        }

        if (shipment.getOriginHub() != null) {
            response.setOriginHubId(shipment.getOriginHub().getHubId());
            response.setOriginHubCode(shipment.getOriginHub().getHubCode());
            response.setOriginHubName(shipment.getOriginHub().getHubName());
            response.setOriginCity(shipment.getOriginHub().getCity());
        }

        response.setDestinationAddress(shipment.getDestinationAddress());
        response.setDestinationCity(shipment.getDestinationCity());
        response.setCreatedDate(shipment.getCreatedDate());
        response.setExpectedDeliveryDate(shipment.getExpectedDeliveryDate());
        response.setShipmentStatus(shipment.getShipmentStatus());
        response.setWeight(shipment.getWeight());
        response.setDelayed(isShipmentDelayed(shipment));
        response.setTrackingEventCount(trackingEventCount);
        return response;
    }

    static boolean isShipmentDelayed(Shipment shipment) {
        return shipment.getExpectedDeliveryDate() != null
                && shipment.getExpectedDeliveryDate().isBefore(LocalDate.now())
                && shipment.getShipmentStatus() != ShipmentStatus.DELIVERED
                && shipment.getShipmentStatus() != ShipmentStatus.CANCELLED;
    }

    static TrackingEventResponse toTrackingEventResponse(TrackingEvent event) {
        TrackingEventResponse response = new TrackingEventResponse();
        response.setEventId(event.getEventId());
        if (event.getShipment() != null) {
            response.setShipmentId(event.getShipment().getShipmentId());
            response.setTrackingNumber(event.getShipment().getTrackingNumber());
        }
        response.setEventDateTime(event.getEventDateTime());
        response.setEventStatus(event.getEventStatus());
        if (event.getHub() != null) {
            response.setHubId(event.getHub().getHubId());
            response.setHubCode(event.getHub().getHubCode());
            response.setHubName(event.getHub().getHubName());
            response.setHubCity(event.getHub().getCity());
        }
        response.setRemarks(event.getRemarks());
        response.setUpdatedBy(event.getUpdatedBy());
        return response;
    }
}

