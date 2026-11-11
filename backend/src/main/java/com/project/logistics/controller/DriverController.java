package com.project.logistics.controller;

import com.project.logistics.dto.DriverRequest;
import com.project.logistics.dto.DriverResponse;
import com.project.logistics.dto.MessageResponse;
import com.project.logistics.entity.AvailabilityStatus;
import com.project.logistics.service.DriverService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping
    public ResponseEntity<List<DriverResponse>> getAllDrivers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AvailabilityStatus availabilityStatus) {
        return ResponseEntity.ok(driverService.getAllDrivers(search, availabilityStatus));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DriverResponse> getDriverById(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @PostMapping
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody DriverRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(driverService.createDriver(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverResponse> updateDriver(@PathVariable Long id,
                                                       @Valid @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.updateDriver(id, request));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<DriverResponse> updateAvailability(
            @PathVariable Long id,
            @RequestBody Map<String, AvailabilityStatus> body) {
        AvailabilityStatus status = body != null ? body.get("availabilityStatus") : null;
        return ResponseEntity.ok(driverService.updateAvailability(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok(new MessageResponse("Driver deleted successfully."));
    }
}

