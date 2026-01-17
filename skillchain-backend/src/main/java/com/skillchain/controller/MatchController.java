package com.skillchain.controller;

import com.skillchain.entity.User;
import com.skillchain.repository.UserRepository;
import com.skillchain.repository.UserSkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private UserRepository userRepository;

    record MatchResponse(Long id, String username, String fullName, String bio, String location, String skillName,
            String proficiencyLevel, boolean isMutuallyBeneficial) {
    }

    @GetMapping
    public List<MatchResponse> getMatches(Authentication authentication) {
        String currentUsername = authentication.getName();
        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);

        if (currentUser == null)
            return List.of();

        // 1. Get skills I want to LEARN
        List<com.skillchain.entity.UserSkill> myRequests = userSkillRepository.findByUserIdAndType(currentUser.getId(),
                com.skillchain.entity.SkillType.LEARN);

        // 2. Get skills I can TEACH
        List<String> myOffers = userSkillRepository
                .findByUserIdAndType(currentUser.getId(), com.skillchain.entity.SkillType.TEACH)
                .stream().map(us -> us.getSkill().getName()).toList();

        List<MatchResponse> matches = new ArrayList<>();

        for (com.skillchain.entity.UserSkill request : myRequests) {
            String skillName = request.getSkill().getName();

            // 3. Find users who teach this skill
            List<com.skillchain.entity.UserSkill> teachers = userSkillRepository.findBySkillNameAndType(skillName,
                    com.skillchain.entity.SkillType.TEACH);

            for (com.skillchain.entity.UserSkill teacherSkill : teachers) {
                User teacher = teacherSkill.getUser();
                if (teacher.getId().equals(currentUser.getId()))
                    continue;

                // 4. Check for reciprocity: Does this teacher want to learn what I offer?
                boolean isMutuallyBeneficial = userSkillRepository
                        .findByUserIdAndType(teacher.getId(), com.skillchain.entity.SkillType.LEARN)
                        .stream().anyMatch(us -> myOffers.contains(us.getSkill().getName()));

                matches.add(new MatchResponse(
                        teacher.getId(),
                        teacher.getUsername(),
                        teacher.getFullName(),
                        teacher.getBio(),
                        teacher.getLocation(),
                        skillName,
                        teacherSkill.getProficiencyLevel() != null ? teacherSkill.getProficiencyLevel().toString()
                                : "Not specified",
                        isMutuallyBeneficial));
            }
        }

        // Sort: Mutually Beneficial first
        matches.sort((a, b) -> Boolean.compare(b.isMutuallyBeneficial(), a.isMutuallyBeneficial()));

        return matches;
    }
}