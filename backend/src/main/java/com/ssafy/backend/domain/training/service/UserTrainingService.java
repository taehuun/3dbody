package com.ssafy.backend.domain.training.service;

import com.ssafy.backend.domain.training.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface UserTrainingService {

    // 운동 조회(특정 날짜&회원)
    UserTrainingDataResponseDto getTrainings(Long userId, int year, int month, int day);

    // 운동 추가
    void saveTrainings(Long userId, int year, int month, int day, List<Long> trainings);

    // 운동 추가(세트, 무게, 회수 포함)
    void addTrainings(List<UserTrainingDto> userTrainingDtoList, LocalDate date);

    // 운동 완료 여부 수정(세트별로)
    void toggle(Long userTrainingId);

    // kg, count 데이터 수정
    void updateSet(SetUpdateRequestDto requestDto);

    // 세트 추가
    void addSet(SetCreateRequestDto requestDto);

    // 세트 삭제
    void removeSet(SetDeleteRequestDto requestDto);

    // 운동 삭제
    void deleteUserTraining(UserTrainingDeleteRequestDto requestDto);

    // 운동 조회
    List<UserTrainingDataResponseDto> getAllTraining(Long userId);
}
