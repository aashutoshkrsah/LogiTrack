package com.project.logistics.service.impl;

import com.project.logistics.dto.DriverRequest;
import com.project.logistics.dto.DriverResponse;
import com.project.logistics.entity.AvailabilityStatus;
import com.project.logistics.entity.Driver;
import com.project.logistics.exception.BusinessRuleException;
import com.project.logistics.exception.DuplicateResourceException;
import com.project.logistics.exception.ResourceNotFoundException;
import com.project.logistics.repository.DriverRepository;
import com.project.logistics.repository.ShipmentRepository;
import com.project.logistics.service.DriverService;
import com.project.logistics.dto.PageResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;
    private final ShipmentRepository shipmentRepository;

    public DriverServiceImpl(DriverRepository driverRepository,
                             ShipmentRepository shipmentRepository) {
        this.driverRepository = driverRepository;
        this.shipmentRepository = shipmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverResponse> getAllDrivers(String search, AvailabilityStatus availabilityStatus) {
        String normalizedSearch = search == null ? null : search.trim();
        return driverRepository.searchDrivers(normalizedSearch, availabilityStatus)
                .stream()
                .map(d -> DtoMapper.toDriverResponse(
                        d, shipmentRepository.countByDriverDriverId(d.getDriverId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DriverResponse> getDriversPaged(String search, AvailabilityStatus availabilityStatus, Pageable pageable) {
        String normalizedSearch = search == null ? null : search.trim();
        org.springframework.data.domain.Page<com.project.logistics.entity.Driver> page =
                driverRepository.searchDriversPaged(normalizedSearch, availabilityStatus, pageable);
        java.util.List<DriverResponse> content = page.getContent().stream()
                .map(d -> DtoMapper.toDriverResponse(
                        d, shipmentRepository.countByDriverDriverId(d.getDriverId())))
                .toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public DriverResponse getDriverById(Long id) {
        Driver driver = findDriverOrThrow(id);
        long shipmentCount = shipmentRepository.countByDriverDriverId(driver.getDriverId());
        return DtoMapper.toDriverResponse(driver, shipmentCount);
    }

    @Override
    public DriverResponse createDriver(DriverRequest request) {
        String code = request.getDriverCode().trim().toUpperCase();
        if (driverRepository.existsByDriverCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Driver code already exists: " + code);
        }

        Driver driver = new Driver();
        applyRequest(driver, request, code);
        Driver saved = driverRepository.save(driver);
        return DtoMapper.toDriverResponse(saved, 0L);
    }

    @Override
    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver driver = findDriverOrThrow(id);
        String code = request.getDriverCode().trim().toUpperCase();
        if (driverRepository.existsByDriverCodeIgnoreCaseAndDriverIdNot(code, id)) {
            throw new DuplicateResourceException("Driver code already exists: " + code);
        }

        applyRequest(driver, request, code);
        Driver updated = driverRepository.save(driver);
        long shipmentCount = shipmentRepository.countByDriverDriverId(updated.getDriverId());
        return DtoMapper.toDriverResponse(updated, shipmentCount);
    }

    @Override
    public DriverResponse updateAvailability(Long id, AvailabilityStatus availabilityStatus) {
        if (availabilityStatus == null) {
            throw new BusinessRuleException("Availability status is required.", HttpStatus.BAD_REQUEST);
        }
        Driver driver = findDriverOrThrow(id);
        driver.setAvailabilityStatus(availabilityStatus);
        Driver updated = driverRepository.save(driver);
        long shipmentCount = shipmentRepository.countByDriverDriverId(updated.getDriverId());
        return DtoMapper.toDriverResponse(updated, shipmentCount);
    }

    @Override
    public void deleteDriver(Long id) {
        Driver driver = findDriverOrThrow(id);
        if (shipmentRepository.existsByDriverDriverId(id)) {
            throw new BusinessRuleException(
                    "Cannot delete driver '" + driver.getFullName() + "' because shipments are assigned. Update availability status to INACTIVE instead.",
                    HttpStatus.CONFLICT
            );
        }
        driverRepository.delete(driver);
    }

    private Driver findDriverOrThrow(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));
    }

    private void applyRequest(Driver driver, DriverRequest request, String normalizedCode) {
        driver.setDriverCode(normalizedCode);
        driver.setFullName(request.getFullName().trim());
        driver.setPhone(request.getPhone().trim());
        driver.setLicenceNumber(request.getLicenceNumber().trim().toUpperCase());
        driver.setAvailabilityStatus(request.getAvailabilityStatus());
    }
}

