package com.project.logistics.service.impl;

import com.project.logistics.dto.CustomerRequest;
import com.project.logistics.dto.CustomerResponse;
import com.project.logistics.entity.Customer;
import com.project.logistics.entity.CustomerType;
import com.project.logistics.exception.BusinessRuleException;
import com.project.logistics.exception.DuplicateResourceException;
import com.project.logistics.exception.ResourceNotFoundException;
import com.project.logistics.repository.CustomerRepository;
import com.project.logistics.repository.ShipmentRepository;
import com.project.logistics.service.CustomerService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final ShipmentRepository shipmentRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository,
                               ShipmentRepository shipmentRepository) {
        this.customerRepository = customerRepository;
        this.shipmentRepository = shipmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers(String search, CustomerType customerType) {
        String normalizedSearch = search == null ? null : search.trim();
        return customerRepository.searchCustomers(normalizedSearch, customerType)
                .stream()
                .map(c -> DtoMapper.toCustomerResponse(
                        c, shipmentRepository.countByCustomerCustomerId(c.getCustomerId())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = findCustomerOrThrow(id);
        long shipmentCount = shipmentRepository.countByCustomerCustomerId(customer.getCustomerId());
        return DtoMapper.toCustomerResponse(customer, shipmentCount);
    }

    @Override
    public CustomerResponse createCustomer(CustomerRequest request) {
        String code = request.getCustomerCode().trim().toUpperCase();
        if (customerRepository.existsByCustomerCodeIgnoreCase(code)) {
            throw new DuplicateResourceException("Customer code already exists: " + code);
        }

        Customer customer = new Customer();
        applyRequest(customer, request, code);
        Customer saved = customerRepository.save(customer);
        return DtoMapper.toCustomerResponse(saved, 0L);
    }

    @Override
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = findCustomerOrThrow(id);
        String code = request.getCustomerCode().trim().toUpperCase();
        if (customerRepository.existsByCustomerCodeIgnoreCaseAndCustomerIdNot(code, id)) {
            throw new DuplicateResourceException("Customer code already exists: " + code);
        }

        applyRequest(customer, request, code);
        Customer updated = customerRepository.save(customer);
        long shipmentCount = shipmentRepository.countByCustomerCustomerId(updated.getCustomerId());
        return DtoMapper.toCustomerResponse(updated, shipmentCount);
    }

    @Override
    public void deleteCustomer(Long id) {
        Customer customer = findCustomerOrThrow(id);
        if (shipmentRepository.existsByCustomerCustomerId(id)) {
            throw new BusinessRuleException(
                    "Cannot delete customer '" + customer.getName() + "' because associated shipments exist.",
                    HttpStatus.CONFLICT
            );
        }
        customerRepository.delete(customer);
    }

    private Customer findCustomerOrThrow(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
    }

    private void applyRequest(Customer customer, CustomerRequest request, String normalizedCode) {
        customer.setCustomerCode(normalizedCode);
        customer.setName(request.getName().trim());
        customer.setPhone(request.getPhone().trim());
        customer.setEmail(request.getEmail().trim());
        customer.setCustomerType(request.getCustomerType());
    }
}

