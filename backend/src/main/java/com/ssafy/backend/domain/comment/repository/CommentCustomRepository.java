package com.ssafy.backend.domain.comment.repository;

import com.ssafy.backend.domain.comment.entity.Comment;

import java.util.List;
import java.util.Optional;

public interface CommentCustomRepository {

    // 챌린지 댓글 목록
    List<Comment> findByChallengeId(Long challengeId);

    Optional<Comment> findCommentByIdWithParent(Long commentId);

    // 챌린지 댓글 삭제
    void deleteAllByChallengeId(Long challengeId);
}
