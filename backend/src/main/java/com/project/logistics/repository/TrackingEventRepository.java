package com.project.logistics.repository;

import com.project.logistics.entity.ShipmentStatus;
import com.project.logistics.entity.TrackingEvent;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TrackingEventRepository extends JpaRepository<TrackingEvent, Long> {

    boolean existsByShipmentShipmentId(Long shipmentId);

    boolean existsByHubHubId(Long hubId);

    long countByShipmentShipmentId(Long shipmentId);

    @Query("""
        SELECT e FROM TrackingEvent e
        JOIN FETCH e.shipment s
        LEFT JOIN FETCH e.hub h
        WHERE e.eventId = :id
    """)
    Optional<TrackingEvent> findWithDetailsById(@Param("id") Long id);

    @Query("""
        SELECT e FROM TrackingEvent e
        JOIN FETCH e.shipment s
        LEFT JOIN FETCH e.hub h
        WHERE s.shipmentId = :shipmentId
        ORDER BY e.eventDateTime ASC, e.eventId ASC
    """)
    List<TrackingEvent> findTimelineByShipmentId(@Param("shipmentId") Long shipmentId);

    List<TrackingEvent> findByShipmentShipmentIdOrderByEventDateTimeDescEventIdDesc(Long shipmentId);

    Optional<TrackingEvent> findTopByShipmentShipmentIdOrderByEventDateTimeDescEventIdDesc(Long shipmentId);

    @Query("""
        SELECT e FROM TrackingEvent e
        JOIN FETCH e.shipment s
        LEFT JOIN FETCH e.hub h
        WHERE (:shipmentId IS NULL OR s.shipmentId = :shipmentId)
          AND (:trackingNumber IS NULL OR :trackingNumber = ''
               OR LOWER(s.trackingNumber) LIKE LOWER(CONCAT('%', :trackingNumber, '%')))
          AND (:status IS NULL OR e.eventStatus = :status)
        ORDER BY e.eventDateTime DESC, e.eventId DESC
    """)
    List<TrackingEvent> searchTrackingEvents(@Param("shipmentId") Long shipmentId,
                                             @Param("trackingNumber") String trackingNumber,
                                             @Param("status") ShipmentStatus status);

    @Query("""
        SELECT e FROM TrackingEvent e
        JOIN FETCH e.shipment s
        LEFT JOIN FETCH e.hub h
        ORDER BY e.eventDateTime DESC, e.eventId DESC
    """)
    List<TrackingEvent> findRecentEvents(Pageable pageable);
}

