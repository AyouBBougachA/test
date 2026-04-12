package com.cmms.ai.service;

import com.cmms.ai.dto.PredictionResponse;
import com.cmms.equipment.entity.Equipment;
import com.cmms.equipment.repository.EquipmentRepository;
import com.cmms.maintenance.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiService {

    private final EquipmentRepository equipmentRepository;
    private final WorkOrderRepository workOrderRepository;

    @Transactional(readOnly = true)
    public List<PredictionResponse> getPredictions() {
        return equipmentRepository.findAll().stream()
                .map(this::calculateRisk)
                .collect(Collectors.toList());
    }

    private PredictionResponse calculateRisk(Equipment equipment) {
        double score = 10.0; // Base score
        List<String> factors = new ArrayList<>();

        // 1. Age Factor
        if (equipment.getCommissioningDate() != null) {
            long years = ChronoUnit.YEARS.between(equipment.getCommissioningDate(), LocalDate.now());
            double ageImpact = Math.min(years * 5, 30);
            score += ageImpact;
            if (years > 5) factors.add("Equipment age (" + years + " years)");
        }

        // 2. Failure Frequency (Work Orders in last 6 months)
        long failureCount = workOrderRepository.findByEquipmentId(equipment.getEquipmentId()).stream()
                .filter(wo -> wo.getWoType() == com.cmms.maintenance.entity.WorkOrder.WorkOrderType.CORRECTIVE)
                .count();
        double failureImpact = Math.min(failureCount * 10, 40);
        score += failureImpact;
        if (failureCount > 2) factors.add("High frequency of corrective maintenance (" + failureCount + " recent orders)");

        // 3. Criticality Factor
        if (equipment.getCriticality() != null) {
            double criticalityImpact = switch (equipment.getCriticality()) {
                case CRITICAL -> 30.0;
                case HIGH -> 15.0;
                case MEDIUM -> 5.0;
                case LOW -> 0.0;
            };
            score += criticalityImpact;
            if (equipment.getCriticality() == com.cmms.equipment.entity.EquipmentCriticality.CRITICAL) {
                factors.add("Critical equipment status");
            }
        }

        score = Math.min(score, 100.0);

        String level = "LOW";
        String recommendation = "Continue regular maintenance schedule";
        
        if (score > 80) {
            level = "CRITICAL";
            recommendation = "Immediate technical inspection recommended";
        } else if (score > 60) {
            level = "HIGH";
            recommendation = "Schedule preventive maintenance within 2 weeks";
        } else if (score > 40) {
            level = "MEDIUM";
            recommendation = "Monitor performance closely";
        }

        return PredictionResponse.builder()
                .equipmentId(equipment.getEquipmentId())
                .equipmentName(equipment.getName())
                .riskScore(score)
                .riskLevel(level)
                .recommendation(recommendation)
                .factors(factors)
                .build();
    }
}
