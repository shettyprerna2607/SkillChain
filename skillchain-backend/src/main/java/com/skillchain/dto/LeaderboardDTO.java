package com.skillchain.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LeaderboardDTO {
    private String username;
    private String fullName;
    private int points;
    private long badgeCount;
    private int rank;
}
