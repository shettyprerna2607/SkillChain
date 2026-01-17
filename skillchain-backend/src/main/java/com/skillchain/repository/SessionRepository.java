package com.skillchain.repository;

import com.skillchain.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {

    @Query("SELECT s FROM Session s WHERE s.teacher.username = :username OR s.learner.username = :username ORDER BY s.scheduledAt DESC")
    List<Session> findAllByUsername(@Param("username") String username);
}
