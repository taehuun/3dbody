package com.ssafy.backend.domain.challenge.service;

import com.ssafy.backend.domain.challenge.dto.ChallengeDetailResponseDto;
import com.ssafy.backend.domain.challenge.dto.ChallengeListResponseDto;
import com.ssafy.backend.domain.challenge.dto.ChallengeRequestDto;
import com.ssafy.backend.domain.challenge.entity.Challenge;
import com.ssafy.backend.domain.challenge.entity.UserChallenge;
import com.ssafy.backend.domain.challenge.repository.ChallengeRepository;
import com.ssafy.backend.domain.challenge.repository.UserChallengeRepository;
import com.ssafy.backend.domain.comment.repository.CommentRepository;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChallengeServiceImpl implements ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;
    private final UserChallengeRepository userChallengeRepository;
    private final CommentRepository commentRepository;

    // 참여가능 챌린지 목록
    @Override
    public List<ChallengeListResponseDto> getProceedingChallengeList() {
        LocalDateTime now = LocalDateTime.now();
        return challengeRepository.findAllByEndDateIsAfter(now);
    }

    // 참여중 챌린지 목록
    @Override
    public List<ChallengeListResponseDto> getJoiningChallengeList(Long userId) {
        return challengeRepository.findChallengeWithUserChallenge(userId);
    }

    // 종료된 챌린지 목록
    @Override
    public List<ChallengeListResponseDto> getFinishedChallengeList() {
        LocalDateTime now = LocalDateTime.now();
        return challengeRepository.findAllByEndDateIsBefore(now);
    }

    // 챌린지 상세 조회
    @Override
    @Transactional
    public ChallengeDetailResponseDto getChallengeDetail(Long challengeId) throws IllegalArgumentException {
        Challenge challenge = challengeRepository.findById(challengeId).orElseThrow(() -> new IllegalArgumentException("존재하지 않는 챌린지입니다."));
        challengeRepository.flush();
        return ChallengeDetailResponseDto.toDto(challenge);
    }

    // 챌린지 정보 등록
    @Override
    @Transactional
    public Challenge registerChallenge(ChallengeRequestDto requestDto) {
        User user = userRepository.getReferenceById(requestDto.getUserId());
        Challenge challenge = Challenge.builder()
                .user(user)
                .title(requestDto.getTitle())
                .summary(requestDto.getSummary())
                .content(requestDto.getContent())
                .thumbnail(requestDto.getThumbnail())
                .image(requestDto.getImage())
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .build();
        return challengeRepository.saveAndFlush(challenge);
    }

    // 챌린지 정보 수정
    @Override
    @Transactional
    public Challenge updateChallenge(Long challengeId, ChallengeRequestDto requestDto) {
        User user = userRepository.getReferenceById(requestDto.getUserId());
        Challenge challenge = Challenge.builder()
                .challengeId(challengeId)
                .user(user)
                .title(requestDto.getTitle())
                .summary(requestDto.getSummary())
                .content(requestDto.getContent())
                .thumbnail(requestDto.getThumbnail())
                .image(requestDto.getImage())
                .startDate(requestDto.getStartDate())
                .endDate(requestDto.getEndDate())
                .build();
        return challengeRepository.saveAndFlush(challenge);
    }

    // 챌린지 정보 삭제
    @Override
    @Transactional
    public void deleteChallenge(Long challengeId) {
        commentRepository.deleteAllByChallengeId(challengeId);
        userChallengeRepository.deleteAllByChallenge_ChallengeId(challengeId);
        challengeRepository.deleteById(challengeId);
    }

    // 챌린지 참여 조회
    @Override
    public boolean checkChallenge(Long challengeId, Long userId) {
        return userChallengeRepository.existsByChallenge_ChallengeIdAndUser_UserId(challengeId, userId);
    }

    // 챌린지 참여 신청
    @Override
    @Transactional
    public void applyChallenge(Long challengeId, Long userId) {
        UserChallenge userChallenge = UserChallenge
                .builder()
                .user(User.builder().userId(userId).build())
                .challenge(Challenge.builder().challengeId(challengeId).build())
                .build();

        userChallengeRepository.saveAndFlush(userChallenge); // 참가 정보 DB에 저장
        challengeRepository.addEntry(challengeId); // 참가자수  1 증가
    }

    // 챌린지 참여 취소
    @Override
    @Transactional
    public void leaveChallenge(Long challengeId, Long userId) {
        boolean check = userChallengeRepository.existsByChallenge_ChallengeIdAndUser_UserId(challengeId, userId);

        if (check) {
            challengeRepository.subEntry(challengeId);
            userChallengeRepository.deleteByChallenge_ChallengeIdAndUser_UserId(challengeId, userId);
        }
    }

    // 챌린지 조회수 1증가
    @Override
    @Transactional
    public void addHit(Long challengeId) {
        challengeRepository.updateHitWithChallengeId(challengeId);
    }

}
