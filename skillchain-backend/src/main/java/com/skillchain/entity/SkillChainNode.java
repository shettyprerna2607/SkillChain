package com.skillchain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "skill_chain_nodes")
@Getter
@Setter
public class SkillChainNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "skill_chain_id", nullable = false)
    @JsonIgnore
    private SkillChain skillChain;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(nullable = false)
    private Integer sequenceOrder;

    private String description; // specific context for this skill in this chain
}
