package com.aurora.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "traffic_visits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrafficVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "visitor_ip_hash", length = 64)
    private String visitorIpHash;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "page_url", length = 255)
    private String pageUrl;

    @Column(name = "referrer", length = 255)
    private String referrer;

    @Column(name = "user_id")
    private UUID userId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
