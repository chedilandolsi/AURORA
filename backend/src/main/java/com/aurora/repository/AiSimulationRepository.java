package com.aurora.repository;

import com.aurora.model.entity.AiSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiSimulationRepository extends JpaRepository<AiSimulation, UUID> {

    long countByUserIdAndYearMonth(UUID userId, String yearMonth);

    List<AiSimulation> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
