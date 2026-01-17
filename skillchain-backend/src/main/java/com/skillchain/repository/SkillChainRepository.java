package com.skillchain.repository;

import com.skillchain.entity.SkillChain;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SkillChainRepository extends JpaRepository<SkillChain, Long> {

    @EntityGraph(attributePaths = { "nodes", "nodes.skill" })
    List<SkillChain> findAll();

    @EntityGraph(attributePaths = { "nodes", "nodes.skill" })
    Optional<SkillChain> findById(Long id);

    List<SkillChain> findByCategory(String category);
}
