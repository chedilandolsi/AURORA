package com.aurora.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_simulations", indexes = {
        @Index(name = "idx_ai_simulations_user_month", columnList = "user_id, year_month")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "wall_image_url", nullable = false, columnDefinition = "TEXT")
    private String wallImageUrl;

    @Column(name = "result_image_url", nullable = false, columnDefinition = "TEXT")
    private String resultImageUrl;

    @Column(name = "year_month", nullable = false, length = 7)
    private String yearMonth;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
