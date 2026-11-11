package com.project.logistics.service;

import com.project.logistics.dto.DriverRequest;
import com.project.logistics.dto.DriverResponse;
import com.project.logistics.entity.AvailabilityStatus;
import com.project.logistics.dto.PageResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;

public interface DriverService {

    List<DriverResponse> getAllDrivers(String search, AvailabilityStatus availabilityStatus);

    PageResponse<DriverResponse> getDriversPaged(String search, AvailabilityStatus availabilityStatus, Pageable pageable);

    DriverResponse getDriverById(Long id);

    DriverResponse createDriver(DriverRequest request);

    DriverResponse updateDriver(Long id, DriverRequest request);

    DriverResponse updateAvailability(Long id, AvailabilityStatus availabilityStatus);

    void deleteDriver(Long id);
}

