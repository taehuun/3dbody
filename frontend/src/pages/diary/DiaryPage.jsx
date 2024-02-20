import axios from "axios";
import { Link } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { useEffect } from "react";
import PageTitle from "./../../components/common/PageTitle";
import CalendarMonth from "./../../components/diary/CalendarMonth";
import Button from "./../../components/common/Button";
import ToggleTap from "./../../components/common/ToggleTap";
import Graph from "./../../components/diary/graph/Graph";
import { selectedDateState } from "../../recoil/diary/SelectedDateState";
import { toggleDiaryState } from "../../recoil/common/ToggleState";
import { userTrainingState } from "../../recoil/diary/UserTrainingState";
import { userFoodState } from "../../recoil/diary/UserFoodState";
import { baseUrlState } from "../../recoil/common/BaseUrlState";
import TrainingSummary from "../../components/diary/TrainingSummary";
import FoodSummary from "../../components/diary/FoodSummary";
import { userState } from "../../recoil/common/UserState";

const DiaryPage = () => {
  const baseUrl = useRecoilValue(baseUrlState);
  const user = useRecoilValue(userState);
  const selectedDate = useRecoilValue(selectedDateState);
  const isSelected = useRecoilValue(toggleDiaryState);
  const [userTraining, setUserTraining] = useRecoilState(userTrainingState);
  const [userFood, setUserFood] = useRecoilState(userFoodState);

  // 운동 데이터 표시하기
  const trainingData = () => {
    return (
      <Link to={`/diary/training/${selectedDate[0]}/${selectedDate[1]}/${selectedDate[2]}`}>
        {userTraining.length ? (
          <TrainingSummary />
        ) : (
          <Button btnCss="p-2 w-full text-white text-lg border bg-teal-700 rounded-lg" buttonName="운동 계획하기" />
        )}
      </Link>
    );
  };

  // 운동 데이터 가져오기
  const getUserTraining = async () => {
    await axios
      .get(
        `${baseUrl}api/management/training?user_id=${user.info.userId}&year=${selectedDate[0]}&month=${selectedDate[1]}&day=${selectedDate[2]}`
      )
      .then((res) => {
        setUserTraining(res.data.user_training_list);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 식단 데이터 표시하기
  const foodData = () => {
    return (
      <Link to={`/diary/food/${selectedDate[0]}/${selectedDate[1]}/${selectedDate[2]}`}>
        {userFood.length ? (
          <FoodSummary />
        ) : (
          <Button btnCss="p-2 w-full text-white text-lg border bg-teal-700 rounded-lg" buttonName="식단 관리하기" />
        )}
      </Link>
    );
  };

  // 식단 데이터 가져오기
  const getUserFood = async () => {
    await axios
      .get(
        `${baseUrl}api/management/food/list/${user.info.userId}?year=${selectedDate[0]}&month=${selectedDate[1]}&day=${selectedDate[2]}`
      )
      .then((res) => {
        setUserFood(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // 해당 날짜 운동, 식단 정보 불러오기
  useEffect(() => {
    getUserTraining();
    getUserFood();
  }, [selectedDate]);

  return (
    <div>
      <PageTitle pageTitle={"다이어리"} />

      <ToggleTap leftTitle={"캘린더"} rightTitle={"그래프"} state={toggleDiaryState} />
      
      {isSelected === "left" ? <CalendarMonth /> : <Graph />}
      <hr className={`my-4 ${isSelected === "right" ? "hidden" : ""}`} />

      <div className={`absolute -z-10 flex flex-col gap-4 mb-16 inset-x-4 ${isSelected === "right" ? "hidden" : ""}`}>
        {trainingData()}
        {foodData()}
      </div>
    </div>
  );
};

export default DiaryPage;
