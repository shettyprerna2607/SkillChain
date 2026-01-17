package com.skillchain.repository;

import com.skillchain.entity.UserChainStake;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserChainStakeRepository extends JpaRepository<UserChainStake, Long> {

    @EntityGraph(attributePaths = { "skillChain", "skillChain.nodes", "skillChain.nodes.skill" })
    List<UserChainStake> findByUserId(Long userId);

    Optional<UserChainStake> findByUserIdAndSkillChainIdAndCompletedFalseAndFailedFalse(Long userId, Long skillChainId);
}
