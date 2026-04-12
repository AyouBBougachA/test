package com.cmms.inventory.service;

import com.cmms.inventory.dto.CreateSparePartRequest;
import com.cmms.inventory.dto.SparePartResponse;
import com.cmms.inventory.entity.SparePart;
import com.cmms.inventory.repository.SparePartRepository;
import com.cmms.claims.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final SparePartRepository sparePartRepository;

    @Transactional(readOnly = true)
    public List<SparePartResponse> list(String category, String q, boolean lowStockOnly) {
        Specification<SparePart> spec = Specification.where(null);
        
        if (category != null) {
            spec = spec.and((root, cq, cb) -> cb.equal(root.get("category"), category));
        }
        
        if (q != null && !q.isBlank()) {
            String like = "%" + q.trim().toLowerCase() + "%";
            spec = spec.and((root, cq, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), like),
                cb.like(cb.lower(root.get("sku")), like)
            ));
        }
        
        if (lowStockOnly) {
            spec = spec.and((root, cq, cb) -> cb.lessThanOrEqualTo(root.get("quantityInStock"), root.get("minStockLevel")));
        }

        return sparePartRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "name"))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SparePartResponse create(CreateSparePartRequest request) {
        SparePart part = SparePart.builder()
                .name(request.getName())
                .sku(request.getSku())
                .category(request.getCategory())
                .quantityInStock(request.getQuantityInStock())
                .minStockLevel(request.getMinStockLevel())
                .unitCost(request.getUnitCost())
                .location(request.getLocation())
                .supplier(request.getSupplier())
                .isArchived(false)
                .build();
        
        return toResponse(sparePartRepository.save(part));
    }

    @Transactional
    public SparePartResponse updateStock(Integer id, Integer quantity) {
        SparePart part = sparePartRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spare part not found"));
        
        part.setQuantityInStock(quantity);
        return toResponse(sparePartRepository.save(part));
    }

    private SparePartResponse toResponse(SparePart part) {
        return SparePartResponse.builder()
                .partId(part.getPartId())
                .name(part.getName())
                .sku(part.getSku())
                .category(part.getCategory())
                .quantityInStock(part.getQuantityInStock())
                .minStockLevel(part.getMinStockLevel())
                .unitCost(part.getUnitCost())
                .location(part.getLocation())
                .supplier(part.getSupplier())
                .createdAt(part.getCreatedAt())
                .updatedAt(part.getUpdatedAt())
                .build();
    }
}
