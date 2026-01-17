package com.skillchain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Getter
@Setter
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String badgeName; // e.g., "Top Teacher", "Quick Learner", "Community Helper"
    private String category; // TEACHER, LEARNER, COMMUNITY
    private String icon; // 🏆, 🎓, ✨, 🌟

    private LocalDateTime awardedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "awarded_by_id")
    private User awardedBy; // System (null) or a specific user
}
