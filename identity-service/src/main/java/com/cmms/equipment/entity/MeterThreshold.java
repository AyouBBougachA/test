package com.cmms.equipment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "meter_thresholds")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeterThreshold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "meter_id", nullable = false)
    private Integer meterId;

    @Column(name = "threshold_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal thresholdValue;
}
