package com.project.logistics.repository;

import com.project.logistics.entity.Shipment;
import com.project.logistics.entity.ShipmentStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    boolean existsByTrackingNumberIgnoreCase(String trackingNumber);

    boolean existsByTrackingNumberIgnoreCaseAndShipmentIdNot(String trackingNumber, Long shipmentId);

    boolean existsByCustomerCustomerId(Long customerId);

    boolean existsByDriverDriverId(Long driverId);

    boolean existsByOriginHubHubId(Long hubId);

    long countByCustomerCustomerId(Long customerId);

    long countByDriverDriverId(Long driverId);

    long countByOriginHubHubId(Long hubId);

    long countByShipmentStatus(ShipmentStatus status);

    @Query("""
        SELECT s FROM Shipment s
        JOIN FETCH s.customer
        JOIN FETCH s.originHub
        LEFT JOIN FETCH s.driver
        WHERE s.shipmentId = :id
    """)
    Optional<Shipment> findWithDetailsById(@Param("id") Long id);

    @Query("""
        SELECT s FROM Shipment s
        JOIN FETCH s.customer
        JOIN FETCH s.originHub
        LEFT JOIN FETCH s.driver
        WHERE LOWER(s.trackingNumber) = LOWER(:trackingNumber)
    """)
    Optional<Shipment> findWithDetailsByTrackingNumber(@Param("trackingNumber") String trackingNumber);

    @Query("""
        SELECT s FROM Shipment s
        JOIN FETCH s.customer c
        JOIN FETCH s.originHub h
        LEFT JOIN FETCH s.driver d
        WHERE (:trackingNumber IS NULL OR :trackingNumber = ''
               OR LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :trackingNumber, '%'))
               OR LOWER(s.destinationCity) LIKE LOWER(CONCAT('%', :trackingNumber, '%'))
               OR LOWER(c.name) LIKE LOWER(CONCAT('%', :trackingNumber, '%')))
          AND (:status IS NULL OR s.shipmentStatus = :status)
          AND (:fromDate IS NULL OR s.createdDate >= :fromDate)
          AND (:toDate IS NULL OR s.createdDate <= :toDate)
          AND (:customerId IS NULL OR c.customerId = :customerId)
          AND (:driverId IS NULL OR (d IS NOT NULL AND d.driverId = :driverId))
          AND (:originHubId IS NULL OR h.hubId = :originHubId)
          AND (:delayedOnly = FALSE OR (s.expectedDeliveryDate < :today
               AND s.shipmentStatus <> com.project.logistics.entity.ShipmentStatus.DELIVERED
               AND s.shipmentStatus <> com.project.logistics.entity.ShipmentStatus.CANCELLED))
        ORDER BY s.shipmentId DESC
    """)
    List<Shipment> searchShipments(@Param("trackingNumber") String trackingNumber,
                                   @Param("status") ShipmentStatus status,
                                   @Param("fromDate") LocalDate fromDate,
                                   @Param("toDate") LocalDate toDate,
                                   @Param("customerId") Long customerId,
                                   @Param("driverId") Long driverId,
                                   @Param("originHubId") Long originHubId,
                                   @Param("delayedOnly") boolean delayedOnly,
                                   @Param("today") LocalDate today);

    @Query("""
        SELECT s FROM Shipment s
        JOIN FETCH s.customer c
        JOIN FETCH s.originHub h
        LEFT JOIN FETCH s.driver d
        WHERE (:trackingNumber IS NULL OR :trackingNumber = ''
               OR LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :trackingNumber, '%'))
               OR LOWER(s.destinationCity) LIKE LOWER(CONCAT('%', :trackingNumber, '%'))
               OR LOWER(c.name) LIKE LOWER(CONCAT('%', :trackingNumber, '%')))
          AND (:status IS NULL OR s.shipmentStatus = :status)
          AND (:fromDate IS NULL OR s.createdDate >= :fromDate)
          AND (:toDate IS NULL OR s.createdDate <= :toDate)
          AND (:customerId IS NULL OR c.customerId = :customerId)
          AND (:driverId IS NULL OR (d IS NOT NULL AND d.driverId = :driverId))
          AND (:originHubId IS NULL OR h.hubId = :originHubId)
          AND (:delayedOnly = FALSE OR (s.expectedDeliveryDate < :today
               AND s.shipmentStatus <> com.project.logistics.entity.ShipmentStatus.DELIVERED
               AND s.shipmentStatus <> com.project.logistics.entity.ShipmentStatus.CANCELLED))
    """)
    Page<Shipment> searchShipmentsPaged(@Param("trackingNumber") String trackingNumber,
                                        @Param("status") ShipmentStatus status,
                                        @Param("fromDate") LocalDate fromDate,
                                        @Param("toDate") LocalDate toDate,
                                        @Param("customerId") Long customerId,
                                        @Param("driverId") Long driverId,
                                        @Param("originHubId") Long originHubId,
                                        @Param("delayedOnly") boolean delayedOnly,
                                        @Param("today") LocalDate today,
                                        Pageable pageable);

    List<Shipment> findByCreatedDateBetween(LocalDate from, LocalDate to);

    @Query("SELECT h.hubCode, h.hubName, h.city, COUNT(s) FROM Shipment s JOIN s.originHub h GROUP BY h.hubCode, h.hubName, h.city ORDER BY COUNT(s) DESC")
    List<Object[]> hubThroughput();

    @Query("SELECT d.driverCode, d.fullName, COUNT(s) FROM Shipment s JOIN s.driver d WHERE s.shipmentStatus = com.project.logistics.entity.ShipmentStatus.DELIVERED GROUP BY d.driverCode, d.fullName ORDER BY COUNT(s) DESC")
    List<Object[]> deliveredCountByDriver();

    @Query("""
        SELECT s FROM Shipment s
        JOIN FETCH s.customer
        JOIN FETCH s.originHub
        LEFT JOIN FETCH s.driver
        WHERE s.expectedDeliveryDate < :today
          AND s.shipmentStatus <> com.project.logistics.entity.ShipmentStatus.DELIVERED
          AND s.shipmentStatus <> com.project.logistics.entity.ShipmentStatus.CANCELLED
        ORDER BY s.expectedDeliveryDate ASC
    """)
    List<Shipment> findDelayedShipments(@Param("today") LocalDate today);

    @Query("""
        SELECT COUNT(s) FROM Shipment s
        WHERE s.expectedDeliveryDate < :today
          AND s.shipmentStatus <> com.project.logistics.entity.ShipmentStatus.DELIVERED
          AND s.shipmentStatus <> com.project.logistics.entity.ShipmentStatus.CANCELLED
    """)
    long countDelayedShipments(@Param("today") LocalDate today);
}

