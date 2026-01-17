package com.skillchain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "skill_chains")
@Getter
@Setter
public class SkillChain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    private String category;

    @OneToMany(mappedBy = "skillChain", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceOrder ASC")
    private List<SkillChainNode> nodes = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();
    private String icon; // Icon name/emoji
}
