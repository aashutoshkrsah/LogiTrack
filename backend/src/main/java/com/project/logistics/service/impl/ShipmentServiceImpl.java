package com.project.logistics.service.impl;

import com.project.logistics.dto.ShipmentRequest;
import com.project.logistics.dto.ShipmentResponse;
import com.project.logistics.dto.ShipmentTimelineResponse;
import com.project.logistics.dto.TrackingEventResponse;
import com.project.logistics.entity.AvailabilityStatus;
import com.project.logistics.entity.Customer;
import com.project.logistics.entity.Driver;
import com.project.logistics.entity.Hub;
import com.project.logistics.entity.Shipment;
import com.project.logistics.entity.ShipmentStatus;
import com.project.logistics.entity.TrackingEvent;
import com.project.logistics.exception.BusinessRuleException;
import com.project.logistics.exception.DuplicateResourceException;
import com.project.logistics.exception.ResourceNotFoundException;
import com.project.logistics.repository.CustomerRepository;
import com.project.logistics.repository.DriverRepository;
import com.project.logistics.repository.HubRepository;
import com.project.logistics.repository.ShipmentRepository;
import com.project.logistics.repository.TrackingEventRepository;
import com.project.logistics.service.ShipmentService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final CustomerRepository customerRepository;
    private final DriverRepository driverRepository;
    private final HubRepository hubRepository;
    private final TrackingEventRepository trackingEventRepository;

    public ShipmentServiceImpl(ShipmentRepository shipmentRepository,
                               CustomerRepository customerRepository,
                               DriverRepository driverRepository,
                               HubRepository hubRepository,
                               TrackingEventRepository trackingEventRepository) {
        this.shipmentRepository = shipmentRepository;
        this.customerRepository = customerRepository;
        this.driverRepository = driverRepository;
        this.hubRepository = hubRepository;
        this.trackingEventRepository = trackingEventRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAllShipments(String trackingNumber,
                                                  ShipmentStatus status,
                                                  LocalDate fromDate,
                                                  LocalDate toDate,
                                                  Long customerId,
                                                  Long driverId,
                                                  Long originHubId,
                                                  boolean delayedOnly) {
        if (fromDate != null && toDate != null && toDate.isBefore(fromDate)) {
            throw new BusinessRuleException("Filter 'toDate' cannot be before 'fromDate'.", HttpStatus.BAD_REQUEST);
        }
        String normalizedTracking = trackingNumber == null ? null : trackingNumber.trim();
        return shipmentRepository.searchShipments(
                        normalizedTracking, status, fromDate, toDate,
                        customerId, driverId, originHubId, delayedOnly, LocalDate.now())
                .stream()
                .map(s -> DtoMapper.toShipmentResponse(
                        s, trackingEventRepository.countByShipmentShipmentId(s.getShipmentId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentById(Long id) {
        Shipment shipment = findShipmentWithDetailsOrThrow(id);
        long eventCount = trackingEventRepository.countByShipmentShipmentId(shipment.getShipmentId());
        return DtoMapper.toShipmentResponse(shipment, eventCount);
    }

    @Override
    public ShipmentResponse createShipment(ShipmentRequest request) {
        String tracking = request.getTrackingNumber().trim().toUpperCase();
        if (shipmentRepository.existsByTrackingNumberIgnoreCase(tracking)) {
            throw new DuplicateResourceException("Tracking number already exists: " + tracking);
        }

        validateDates(request.getCreatedDate(), request.getExpectedDeliveryDate());

        Customer customer = resolveCustomer(request.getCustomerId());
        Hub originHub = resolveOriginHub(request.getOriginHubId());
        Driver driver = resolveDriver(request.getDriverId(), null);

        Shipment shipment = new Shipment();
        shipment.setTrackingNumber(tracking);
        shipment.setCustomer(customer);
        shipment.setDriver(driver);
        shipment.setOriginHub(originHub);
        shipment.setDestinationAddress(request.getDestinationAddress().trim());
        shipment.setDestinationCity(request.getDestinationCity().trim());
        shipment.setCreatedDate(request.getCreatedDate());
        shipment.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        shipment.setShipmentStatus(
                request.getShipmentStatus() != null ? request.getShipmentStatus() : ShipmentStatus.PENDING);
        shipment.setWeight(request.getWeight());

        Shipment saved = shipmentRepository.save(shipment);
        return DtoMapper.toShipmentResponse(saved, 0L);
    }

    @Override
    public ShipmentResponse updateShipment(Long id, ShipmentRequest request) {
        Shipment shipment = findShipmentWithDetailsOrThrow(id);
        String tracking = request.getTrackingNumber().trim().toUpperCase();
        if (shipmentRepository.existsByTrackingNumberIgnoreCaseAndShipmentIdNot(tracking, id)) {
            throw new DuplicateResourceException("Tracking number already exists: " + tracking);
        }

        validateDates(request.getCreatedDate(), request.getExpectedDeliveryDate());

        Customer customer = resolveCustomer(request.getCustomerId());
        Hub originHub = resolveOriginHub(request.getOriginHubId());
        Long currentDriverId = shipment.getDriver() != null ? shipment.getDriver().getDriverId() : null;
        Driver driver = resolveDriver(request.getDriverId(), currentDriverId);

        long eventCount = trackingEventRepository.countByShipmentShipmentId(id);
        ShipmentStatus requestedStatus = request.getShipmentStatus() != null
                ? request.getShipmentStatus()
                : shipment.getShipmentStatus();

        if (eventCount > 0 && requestedStatus != shipment.getShipmentStatus()) {
            if (requestedStatus == ShipmentStatus.CANCELLED
                    && shipment.getShipmentStatus() != ShipmentStatus.DELIVERED) {
                shipment.setShipmentStatus(ShipmentStatus.CANCELLED);
            } else {
                TrackingEvent latestEvent = trackingEventRepository
                        .findTopByShipmentShipmentIdOrderByEventDateTimeDescEventIdDesc(id)
                        .orElse(null);
                String syncedName = latestEvent != null
                        ? latestEvent.getEventStatus().name()
                        : shipment.getShipmentStatus().name();
                throw new BusinessRuleException(
                        "Shipment status is synchronized with its latest tracking event (" + syncedName
                                + "). Record a new tracking event to advance the shipment milestone.",
                        HttpStatus.CONFLICT
                );
            }
        } else if (eventCount == 0) {
            shipment.setShipmentStatus(requestedStatus);
        }

        shipment.setTrackingNumber(tracking);
        shipment.setCustomer(customer);
        shipment.setDriver(driver);
        shipment.setOriginHub(originHub);
        shipment.setDestinationAddress(request.getDestinationAddress().trim());
        shipment.setDestinationCity(request.getDestinationCity().trim());
        shipment.setCreatedDate(request.getCreatedDate());
        shipment.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        shipment.setWeight(request.getWeight());

        Shipment updated = shipmentRepository.save(shipment);
        return DtoMapper.toShipmentResponse(updated, eventCount);
    }

    @Override
    public void deleteShipment(Long id) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));
        if (trackingEventRepository.existsByShipmentShipmentId(id)) {
            throw new BusinessRuleException(
                    "Cannot delete shipment '" + shipment.getTrackingNumber()
                            + "' because tracking history exists.",
                    HttpStatus.CONFLICT
            );
        }
        shipmentRepository.delete(shipment);
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentTimelineResponse getTimelineByTrackingNumber(String trackingNumber) {
        String normalized = trackingNumber == null ? "" : trackingNumber.trim();
        Shipment shipment = shipmentRepository.findWithDetailsByTrackingNumber(normalized)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Shipment not found with tracking number: " + normalized));

        List<TrackingEventResponse> events = trackingEventRepository
                .findTimelineByShipmentId(shipment.getShipmentId())
                .stream()
                .map(DtoMapper::toTrackingEventResponse)
                .toList();

        ShipmentResponse shipmentDto = DtoMapper.toShipmentResponse(shipment, events.size());
        return new ShipmentTimelineResponse(shipmentDto, events);
    }

    private Shipment findShipmentWithDetailsOrThrow(Long id) {
        return shipmentRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + id));
    }

    private void validateDates(LocalDate createdDate, LocalDate expectedDeliveryDate) {
        if (expectedDeliveryDate.isBefore(createdDate)) {
            throw new BusinessRuleException(
                    "Expected delivery date cannot be earlier than the shipment created date.",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    private Customer resolveCustomer(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Referenced customer not found with ID: " + customerId));
    }

    private Hub resolveOriginHub(Long hubId) {
        return hubRepository.findById(hubId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Referenced origin hub not found with ID: " + hubId));
    }

    private Driver resolveDriver(Long driverId, Long existingDriverId) {
        if (driverId == null) {
            return null;
        }
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Referenced driver not found with ID: " + driverId));
        if (driver.getAvailabilityStatus() == AvailabilityStatus.INACTIVE
                && !driver.getDriverId().equals(existingDriverId)) {
            throw new BusinessRuleException(
                    "Cannot assign driver '" + driver.getFullName() + "' because their status is INACTIVE.",
                    HttpStatus.BAD_REQUEST
            );
        }
        return driver;
    }
}

