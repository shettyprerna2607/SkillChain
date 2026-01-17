package com.skillchain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_chain_stakes")
@Getter
@Setter
public class UserChainStake {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "skill_chain_id", nullable = false)
    private SkillChain skillChain;

    private int amount;
    private LocalDateTime stakedAt = LocalDateTime.now();
    private LocalDateTime deadline;

    private boolean completed = false;
    private boolean failed = false;
    private boolean redeemed = false;
}
