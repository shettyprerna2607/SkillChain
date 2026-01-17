package com.skillchain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_skills")
@Getter
@Setter
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    private SkillType type; // TEACH or LEARN

    @Enumerated(EnumType.STRING)
    private ProficiencyLevel proficiencyLevel; // only for TEACH

    private LocalDateTime createdAt = LocalDateTime.now();
}