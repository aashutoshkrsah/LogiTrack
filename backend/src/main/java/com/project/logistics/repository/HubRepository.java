package com.project.logistics.repository;

import com.project.logistics.entity.Hub;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface HubRepository extends JpaRepository<Hub, Long> {

    Optional<Hub> findByHubCodeIgnoreCase(String hubCode);

    boolean existsByHubCodeIgnoreCase(String hubCode);

    boolean existsByHubCodeIgnoreCaseAndHubIdNot(String hubCode, Long hubId);

    @Query("""
        SELECT h FROM Hub h
        WHERE (:city IS NULL OR :city = '' OR LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%')))
          AND (:search IS NULL OR :search = ''
               OR LOWER(h.hubCode) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(h.hubName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(h.city) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(h.address) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY h.hubId DESC
    """)
    List<Hub> searchHubs(@Param("search") String search,
                         @Param("city") String city);

    @Query("""
        SELECT h FROM Hub h
        WHERE (:city IS NULL OR :city = '' OR LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%')))
          AND (:search IS NULL OR :search = ''
               OR LOWER(h.hubCode) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(h.hubName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(h.city) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(h.address) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Hub> searchHubsPaged(@Param("search") String search,
                              @Param("city") String city,
                              Pageable pageable);
}

