package com.ssafy.backend.global.error.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ExceptionType {

    DUPLICATED_USER(HttpStatus.BAD_REQUEST, "이미 존재하는 회원입니다."),
    DUPLICATED_EMAIL(HttpStatus.BAD_REQUEST, "이미 존재하는 이메일입니다."),
    DUPLICATED_NICKNAME(HttpStatus.BAD_REQUEST, "이미 존재하는 닉네임입니다."),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "잘못된 비밀번호 입니다."),
    INVALID_PIN(HttpStatus.BAD_REQUEST, "잘못된 PIN 입니다."),
    INVALID_EMAIL(HttpStatus.BAD_REQUEST, "email을 다시 확인해 주세요"),
    INVALID_USER(HttpStatus.BAD_REQUEST, "존재하지 않는 사용자입니다."),
    INVALID_VALUE(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다."),
    WITHDRAW_USER(HttpStatus.BAD_REQUEST, "회원탈퇴한 사용자입니다."),

    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "사용할 수 없는 토큰입니다."),

    CERTIFICATION_EXCEPTION(HttpStatus.UNAUTHORIZED, "자격 증명이 되어 있지 않습니다."),

    FORBIDDEN_EXCEPTION(HttpStatus.FORBIDDEN, "권한이 없습니다."),
    AUTHENTICATION_EXCEPTION(HttpStatus.UNAUTHORIZED, "인증되지 않은 요청입니다."),
    MAIL_SEND_FAILED_EXCEPTION(HttpStatus.INTERNAL_SERVER_ERROR, "FAILED_TO_SEND_MAIL"),

    INVALID_INBODY(HttpStatus.BAD_REQUEST, "존재하지 않는 인바디 정보입니다."),

    INVALID_FILE(HttpStatus.BAD_REQUEST, "존재하지 않는 파일입니다."),
    DUPLICATED_FILE(HttpStatus.BAD_REQUEST, "이미 존재하는 파일입니다."),
    NOT_FOUND_ASSET_ID(HttpStatus.BAD_REQUEST, "ASSET_ID를 입력해주세요."),
    NOT_FOUND_AVATAR_URL(HttpStatus.BAD_REQUEST, "AVATAR_URL을 입력해주세요."),
    FAIL_CREATE_FILE(HttpStatus.BAD_REQUEST, "파일 생성을 실패하였습니다."),
    FAIL_WRITE_FILE(HttpStatus.BAD_REQUEST, "파일 작성을 실패하였습니다."),
    FAIL_RESPONSE(HttpStatus.BAD_REQUEST, "RESPONSE가 없습니다.");

    private final HttpStatus httpStatus;
    private final String errorMessage;

}
