package com.ssafy.backend.domain.inbody.service.impl;

import com.ssafy.backend.domain.inbody.dto.InbodyRequestDto;
import com.ssafy.backend.domain.inbody.dto.InbodyResponseDto;
import com.ssafy.backend.domain.inbody.entity.Inbody;
import com.ssafy.backend.domain.inbody.entity.InbodyImage;
import com.ssafy.backend.domain.inbody.repository.InbodyImageRepository;
import com.ssafy.backend.domain.inbody.repository.InbodyRepository;
import com.ssafy.backend.domain.inbody.service.InbodyService;
import com.ssafy.backend.domain.user.entity.User;
import com.ssafy.backend.domain.user.repository.UserRepository;
import com.ssafy.backend.global.error.exception.InbodyException;
import com.ssafy.backend.global.error.exception.UserException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.ssafy.backend.global.error.exception.ExceptionType.INVALID_INBODY;
import static com.ssafy.backend.global.error.exception.ExceptionType.INVALID_USER;

@Service
@RequiredArgsConstructor
public class InbodyServiceImpl implements InbodyService {

    private final UserRepository userRepository;
    private final InbodyRepository inbodyRepository;
    private final InbodyImageRepository inbodyImageRepository;

    @Override
    @Transactional
    public void registInbody(Long userId, InbodyRequestDto inbodyRequestDto) {
        User user = userRepository.findById(userId).orElseThrow(() -> new UserException(INVALID_USER));

        Inbody inpuInbody = inbodyRequestDto.toEntity(user);
        if (inpuInbody.getDate() == null) {
            inpuInbody.updateDate(LocalDateTime.now());
        }

        Inbody inbody = inbodyRepository.save(inpuInbody);

        inbodyRequestDto.getImages().forEach(image -> {
            InbodyImage inbodyImage = InbodyImage.builder()
                    .inbody(inbody)
                    .url(image.getUrl())
                    .build();
            inbody.addInbodyImage(inbodyImage);
            inbodyImageRepository.save(inbodyImage);
        });
    }

    @Override
    @Transactional
    public void updateInbody(Long userId, Long inbodyId, InbodyRequestDto inbodyRequestDto) {
        Inbody inbody = inbodyRepository.findById(inbodyId).orElseThrow(() -> new InbodyException(INVALID_INBODY));

        inbody.updateHeight(inbodyRequestDto.getHeight());
        inbody.updateWeight(inbodyRequestDto.getWeight());
        inbody.updateBmr(inbodyRequestDto.getBmr());
        inbody.updateMuscle(inbodyRequestDto.getMuscle());
        inbody.updateFatMass(inbodyRequestDto.getFatMass());
        inbody.updateFatPer(inbodyRequestDto.getFatPer());
        inbody.updateTbw(inbodyRequestDto.getTbw());
        inbody.updateWhr(inbodyRequestDto.getWhr());
        inbody.updateBmi(inbodyRequestDto.getBmi());
        inbody.updateScore(inbodyRequestDto.getScore());
        inbody.updateDate(inbodyRequestDto.getDate());

        if (!inbodyRequestDto.getImages().isEmpty()) {
            inbody.getInbodyImages().forEach(inbodyImage -> {
                long cnt = inbodyRequestDto.getImages().stream()
                        .filter(i -> inbodyImage.getUrl().equals(i.getUrl()))
                        .count();

                if (cnt == 0) {
                    inbody.deleteInbodyImage(inbodyImage);
                    inbodyImageRepository.delete(inbodyImage);
                }
            });

            inbodyRequestDto.getImages().forEach(image -> {
                long cnt = inbody.getInbodyImages().stream()
                        .filter(i -> !image.getUrl().equals(i.getUrl()))
                        .count();

                if (cnt > 0) {
                    InbodyImage inbodyImage = InbodyImage.builder()
                            .inbody(inbody)
                            .url(image.getUrl())
                            .build();

                    inbody.addInbodyImage(inbodyImage);
                    inbodyImageRepository.save(inbodyImage);
                }
            });
        }
    }

    @Override
    public InbodyResponseDto getInbodyItem(Long inbodyId) {
        Inbody inbody = inbodyRepository.findById(inbodyId).orElseThrow(() -> new InbodyException(INVALID_INBODY));
        return InbodyResponseDto.of(inbody);
    }

    @Override
    public List<InbodyResponseDto> getInbodyList(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new UserException(INVALID_USER));
        return inbodyRepository.findAllByUser(user)
                .stream().map(InbodyResponseDto::of)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteInbody(Long userId, Long inbodyId) {
        inbodyRepository.deleteById(inbodyId);

        // TODO 이미지 삭제 시 S3에서도 삭제하기
    }
}
