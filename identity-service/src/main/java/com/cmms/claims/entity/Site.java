package com.cmms.claims.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Site {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "site_id")
    private Integer siteId;

    @Column(name = "site_name", nullable = false, unique = true, length = 255)
    private String siteName;

    @Column(name = "site_code", unique = true, length = 50)
    private String siteCode;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
