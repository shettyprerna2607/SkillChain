package com.skillchain.repository;

import com.skillchain.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByUserIdOrderByAwardedAtDesc(Long userId);
}
