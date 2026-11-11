package com.project.logistics.repository;

import com.project.logistics.entity.Customer;
import com.project.logistics.entity.CustomerType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByCustomerCodeIgnoreCase(String customerCode);

    boolean existsByCustomerCodeIgnoreCase(String customerCode);

    boolean existsByCustomerCodeIgnoreCaseAndCustomerIdNot(String customerCode, Long customerId);

    @Query("""
        SELECT c FROM Customer c
        WHERE (:customerType IS NULL OR c.customerType = :customerType)
          AND (:search IS NULL OR :search = ''
               OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY c.customerId DESC
    """)
    List<Customer> searchCustomers(@Param("search") String search,
                                   @Param("customerType") CustomerType customerType);
}

