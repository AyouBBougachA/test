package com.cmms.equipment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentResponse {
    private Integer equipmentId;
    private String name;
    private String serialNumber;
    private String status;
    private String location;
    private Integer departmentId;
    private Integer categoryId;
    private Integer modelId;
    private String manufacturer;
    private String modelReference;
    private String classification;
    private String criticality;
    private String meterUnit;
    private BigDecimal startMeterValue;
    private List<BigDecimal> thresholds;
    private LocalDate purchaseDate;
    private LocalDate commissioningDate;
    private String supplierName;
    private String contractNumber;
    private LocalDate warrantyEndDate;
    private LocalDateTime createdAt;
}
