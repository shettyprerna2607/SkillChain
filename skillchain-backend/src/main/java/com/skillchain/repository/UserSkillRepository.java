package com.skillchain.repository;

import com.skillchain.entity.UserSkill;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserSkillRepository extends JpaRepository<UserSkill, Long> {

    @Query("SELECT us FROM UserSkill us JOIN FETCH us.skill WHERE us.user.id = :userId")
    List<UserSkill> findByUserId(@Param("userId") Long userId);

    @Query("SELECT us FROM UserSkill us JOIN FETCH us.skill WHERE us.user.id = :userId AND us.type = :type")
    List<UserSkill> findByUserIdAndType(@Param("userId") Long userId,
            @Param("type") com.skillchain.entity.SkillType type);

    @Query("SELECT us FROM UserSkill us JOIN FETCH us.skill WHERE us.skill.name = :skillName AND us.type = :type")
    List<UserSkill> findBySkillNameAndType(@Param("skillName") String skillName,
            @Param("type") com.skillchain.entity.SkillType type);
}