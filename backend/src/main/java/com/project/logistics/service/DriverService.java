package com.project.logistics.service;

import com.project.logistics.dto.DriverRequest;
import com.project.logistics.dto.DriverResponse;
import com.project.logistics.entity.AvailabilityStatus;
import java.util.List;

public interface DriverService {

    List<DriverResponse> getAllDrivers(String search, AvailabilityStatus availabilityStatus);

    DriverResponse getDriverById(Long id);

    DriverResponse createDriver(DriverRequest request);

    DriverResponse updateDriver(Long id, DriverRequest request);

    DriverResponse updateAvailability(Long id, AvailabilityStatus availabilityStatus);

    void deleteDriver(Long id);
}

