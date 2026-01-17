package com.skillchain.repository;

import com.skillchain.entity.CallSignaling;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SignalingRepository extends JpaRepository<CallSignaling, Long> {
    List<CallSignaling> findBySessionIdAndSenderUsernameNotOrderByCreatedAtAsc(Long sessionId, String senderUsername);

    void deleteBySessionId(Long sessionId);
}
