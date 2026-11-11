package com.project.logistics.util;

import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/** Builds a safe Pageable from query params; unknown sort fields fall back to the default. */
public final class PaginationUtil {

    private PaginationUtil() {
    }

    public static Pageable build(Integer page, Integer size, String sort,
                                 Set<String> allowedSortFields, String defaultSortField) {
        int p = page == null || page < 0 ? 0 : page;
        int s = size == null || size < 1 ? 10 : Math.min(size, 100);
        Sort sortObj = Sort.by(Sort.Direction.DESC, defaultSortField);
        if (sort != null && !sort.isBlank()) {
            String[] parts = sort.split(",");
            String field = parts[0].trim();
            if (allowedSortFields.contains(field)) {
                Sort.Direction dir = parts.length > 1 && parts[1].trim().equalsIgnoreCase("asc")
                        ? Sort.Direction.ASC : Sort.Direction.DESC;
                sortObj = Sort.by(dir, field);
            }
        }
        return PageRequest.of(p, s, sortObj);
    }
}
