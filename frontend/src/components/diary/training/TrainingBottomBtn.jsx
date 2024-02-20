import axios from "axios";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedDateState } from "../../../recoil/diary/SelectedDateState";
import Button from "../../common/Button";
import { baseUrlState } from "../../../recoil/common/BaseUrlState";
import { userState } from "../../../recoil/common/UserState";
import { userTrainingState } from "../../../recoil/diary/UserTrainingState";

const TrainingBottomBtn = () => {
  const baseUrl = useRecoilValue(baseUrlState);
  const user = useRecoilValue(userState);
  const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState);
  const userTraining = useRecoilValue(userTrainingState);
  const [isStart, setIsStart] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // 경과 시간 (밀리초 단위)
  const [min, setMin] = useState(0); // 분
  const [sec, setSec] = useState(0); // 초
  const [isFinish, setIsFinish] = useState(
    localStorage.getItem(`date_${selectedDate.join("-")}_finish`) ? true : false
  );

  // 오늘 체크
  const isToday = () => {
    const today = new Date();
    return (
      today.getFullYear() === selectedDate[0] &&
      today.getMonth() === selectedDate[1] - 1 &&
      today.getDate() === selectedDate[2]
    );
  };

  // 내일 체크
  const isFuture = () => {
    const today = new Date();
    today.setHours(today.getHours() + 9);

    return (
      today.toJSON() <
      new Date(
        selectedDate[0],
        selectedDate[1] - 1,
        selectedDate[2],
        9
      ).toJSON()
    );
  };

  const onClickStartHandler = () => {
    setIsStart((prevState) => !prevState);
  };

  const onClickEndHandler = () => {
    // 경과 시간을 분 단위로 계산
    const elapsedMinutes = Math.floor(elapsedTime / 60000);

    // 로컬 스토리지에 현재 선택된 날짜를 키로하여 경과한 분을 저장
    localStorage.setItem(
      `date_${selectedDate.join("-")}`,
      elapsedMinutes === 0 ? 50 : elapsedMinutes
    );
    localStorage.setItem(`date_${selectedDate.join("-")}_finish`, true);
    setSelectedDate([selectedDate[0], selectedDate[1], selectedDate[2]]);
    setIsStart(!isStart);
    setIsFinish(!isFinish);
  };

  const onClickEditHandler = () => {
    console.log("localstorage - finish 삭제");
    localStorage.removeItem(`date_${selectedDate.join("-")}_finish`);
    setSelectedDate([selectedDate[0], selectedDate[1], selectedDate[2]]);
    setIsFinish(false);
  };

  // 오늘 운동 기록 루틴으로 저장
  const onClickSaveRoutineHandler = async () => {
    await axios
      .post(`${baseUrl}api/management/routine/addroutine`, {
        userId: user.info.userId,
        title: `${selectedDate[0]}년 ${selectedDate[1]}월 ${selectedDate[2]}일`,
      })
      .then((res) => {
        axios
          .get(`${baseUrl}api/management/routine/${user.info.userId}`)
          .then((res) => {
            const routineId = res.data[res.data.length - 1].routineId;
            axios
              .post(
                `${baseUrl}api/management/routine/add?routine_id=${routineId}`,
                userTraining
              )
              .then((res) => {
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    let timer;
    if (isStart) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1000); // 1초씩 증가
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isStart]);

  // 경과 시간을 분과 초로 변환하여 업데이트
  useEffect(() => {
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    setMin(minutes);
    if (seconds < 10) {
      // 두 자리 표현
      setSec(seconds.toString().padStart(2, "0"));
    } else {
      setSec(seconds);
    }
  }, [elapsedTime]);

  return (
    <>
      {/* 과거일 때 */}
      {!isToday() && !isFuture() && (
        <div className="flex gap-4 m-4">
          <div className="p-2 text-center border border-teal-700 rounded-md basis-1/2">
            <Button onClick={onClickEditHandler} buttonName="운동 편집" />
          </div>
          <div className="p-2 text-center text-white bg-teal-700 rounded-md basis-1/2">
            <Button
              btnCss="text-sm"
              buttonName={`${selectedDate[1]}월 ${selectedDate[2]}일의 운동 완료`}
              onClick={onClickEndHandler}
            />
          </div>
        </div>
      )}

      {/* 오늘일 때 */}
      {isToday() && (
        <div className="flex gap-4 m-4">
          <div className="p-2 text-center border border-teal-700 rounded-md basis-1/2">
            {isFinish === false && isStart === false && (
              <div className="flex justify-center text-sm divide-x-2">
                <Link to={`/diary/training/choice/basic`}>
                  <Button btnCss="px-1" buttonName="운동추가" />
                </Link>
                <Link to={`/diary/training/load/basic`}>
                  <Button btnCss="px-1" buttonName="불러오기" />
                </Link>
              </div>
            )}
            {isFinish === false && isStart === true && (
              <Button buttonName={`${min} : ${sec}`} />
            )}
            {isFinish === true && (
              <Button onClick={onClickEditHandler} buttonName="운동 편집" />
            )}
          </div>
          <div className="p-2 text-center text-white bg-teal-700 rounded-md basis-1/2">
            {isFinish === false && isStart === false && (
              <Button onClick={onClickStartHandler} buttonName="운동 시작" />
            )}
            {isFinish === false && isStart === true && (
              // <Link to={`/diary`}>
              // </Link>
              <Button onClick={onClickEndHandler} buttonName="운동 완료" />
            )}
            {isFinish === true && (
              <Link to={`/diary/training/myroutine`}>
                <Button
                  buttonName="루틴 저장"
                  onClick={onClickSaveRoutineHandler}
                />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 내일일 때 */}
      {isFuture() && (
        <div className="flex gap-4 m-4">
          <div className="p-2 text-center border border-teal-700 rounded-md basis-1/2">
            <Link to={`/diary/training/choice/basic`}>
              <Button buttonName="운동추가" />
            </Link>
          </div>
          <div className="p-2 text-center text-white bg-teal-700 rounded-md basis-1/2">
            <Link to={`/diary/training/load/basic`}>
              <Button buttonName="불러오기" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default TrainingBottomBtn;
