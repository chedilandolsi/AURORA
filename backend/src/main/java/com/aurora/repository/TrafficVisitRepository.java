package com.aurora.repository;

import com.aurora.model.entity.TrafficVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface TrafficVisitRepository extends JpaRepository<TrafficVisit, UUID> {

    @Query("SELECT COUNT(t) FROM TrafficVisit t WHERE t.createdAt >= :startDate")
    long countVisitsSince(@Param("startDate") Instant startDate);

    @Query("SELECT COUNT(DISTINCT t.visitorIpHash) FROM TrafficVisit t WHERE t.createdAt >= :startDate")
    long countUniqueVisitorsSince(@Param("startDate") Instant startDate);
}
