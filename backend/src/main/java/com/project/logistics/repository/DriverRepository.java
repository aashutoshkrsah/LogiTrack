package com.project.logistics.repository;

import com.project.logistics.entity.AvailabilityStatus;
import com.project.logistics.entity.Driver;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByDriverCodeIgnoreCase(String driverCode);

    boolean existsByDriverCodeIgnoreCase(String driverCode);

    boolean existsByDriverCodeIgnoreCaseAndDriverIdNot(String driverCode, Long driverId);

    long countByAvailabilityStatus(AvailabilityStatus availabilityStatus);

    @Query("""
        SELECT d FROM Driver d
        WHERE (:availabilityStatus IS NULL OR d.availabilityStatus = :availabilityStatus)
          AND (:search IS NULL OR :search = ''
               OR LOWER(d.driverCode) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(d.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(d.phone) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(d.licenceNumber) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY d.driverId DESC
    """)
    List<Driver> searchDrivers(@Param("search") String search,
                               @Param("availabilityStatus") AvailabilityStatus availabilityStatus);

    @Query("""
        SELECT d FROM Driver d
        WHERE (:availabilityStatus IS NULL OR d.availabilityStatus = :availabilityStatus)
          AND (:search IS NULL OR :search = ''
               OR LOWER(d.driverCode) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(d.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(d.phone) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(d.licenceNumber) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Driver> searchDriversPaged(@Param("search") String search,
                                    @Param("availabilityStatus") AvailabilityStatus availabilityStatus,
                                    Pageable pageable);
}

