package com.cmms.maintenance.service;

import com.cmms.equipment.entity.Meter;
import com.cmms.equipment.entity.MeterThreshold;
import com.cmms.equipment.repository.MeterThresholdRepository;
import com.cmms.maintenance.entity.MaintenancePlan;
import com.cmms.maintenance.repository.MaintenancePlanRepository;
import com.cmms.notifications.entity.Notification;
import com.cmms.notifications.repository.NotificationRepository;
import com.cmms.identity.entity.User;
import com.cmms.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeterTriggerService {

    private final MaintenancePlanRepository planRepository;
    private final MeterThresholdRepository thresholdRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void evaluateMeterReadings(Meter meter) {
        BigDecimal currentValue = meter.getValue();
        if (currentValue == null) return;

        // 1. Evaluate Maintenance Plans (PREVENTIVE)
        List<MaintenancePlan> plans = planRepository.findByMeterIdAndIsActiveTrue(meter.getMeterId());
        for (MaintenancePlan plan : plans) {
            BigDecimal nextTrigger = plan.getNextMeterReading();
            if (nextTrigger == null) {
                // Initialize next trigger if null
                nextTrigger = currentValue.add(BigDecimal.valueOf(plan.getFrequencyValue()));
                plan.setNextMeterReading(nextTrigger);
                planRepository.save(plan);
                continue;
            }

            // Handle multiple intervals if reading jumped
            while (currentValue.compareTo(nextTrigger) >= 0) {
                log.info("Meter Plan Triggered: Plan {} for Meter {}. Current: {}, Threshold: {}", 
                    plan.getPlanId(), meter.getMeterId(), currentValue, nextTrigger);
                
                sendRecommendation(plan, meter, nextTrigger);
                
                nextTrigger = nextTrigger.add(BigDecimal.valueOf(plan.getFrequencyValue()));
                plan.setNextMeterReading(nextTrigger);
            }
            planRepository.save(plan);
        }

        // 2. Evaluate Thresholds (WARNING / CRITICAL)
        List<MeterThreshold> thresholds = thresholdRepository.findByMeterId(meter.getMeterId());
        for (MeterThreshold threshold : thresholds) {
            BigDecimal thresholdVal = threshold.getThresholdValue();
            
            // Critical RECOMMENDATION (100%)
            if (currentValue.compareTo(thresholdVal) >= 0) {
                sendThresholdAlert(meter, threshold, "RECOMMENDATION", thresholdVal);
            } 
            // Warning Alert (80%)
            else if (currentValue.compareTo(thresholdVal.multiply(BigDecimal.valueOf(0.8))) >= 0) {
                sendThresholdAlert(meter, threshold, "WARNING", thresholdVal);
            }
        }
    }

    private void sendRecommendation(MaintenancePlan plan, Meter meter, BigDecimal triggerValue) {
        String msg = String.format("Maintenance Recommended for Plan '%s' (Equipment ID: %d). Meter '%s' reached %s %s.",
            plan.getTitle(), plan.getEquipmentId(), meter.getName(), triggerValue.toString(), meter.getUnit());
        
        notifyManagers("RECOMMENDATION", msg, meter.getMeterId());
    }

    private void sendThresholdAlert(Meter meter, MeterThreshold status, String type, BigDecimal thresholdValue) {
        String msg = String.format("%s: Meter '%s' (Equipment ID: %d) has reached %s %s (Threshold: %s %s).",
            type, meter.getName(), meter.getEquipmentId(), meter.getValue(), meter.getUnit(), thresholdValue, meter.getUnit());
        
        notifyManagers(type, msg, meter.getMeterId());
    }

    private void notifyManagers(String type, String message, Integer referenceId) {
        // Find all Maintenance Managers and Admins
        List<User> managers = userRepository.findAll().stream()
            .filter(u -> u.getRole() != null && 
                (u.getRole().getRoleName().equals("ADMIN") || u.getRole().getRoleName().equals("MAINTENANCE_MANAGER")))
            .toList();

        for (User manager : managers) {
            Notification note = Notification.builder()
                .userId(manager.getUserId())
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .build();
            notificationRepository.save(note);
        }
    }
}
