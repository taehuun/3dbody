import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useEffect } from "react";
import PageTitle from "./../../components/common/PageTitle";
import ToggleTap from "./../../components/common/ToggleTap";
import CalendarWeek from "./../../components/diary/CalendarWeek";
import Graph from "../../components/diary/graph/Graph";
import { toggleDiaryState } from "../../recoil/common/ToggleState";
import { baseUrlState } from "../../recoil/common/BaseUrlState";
import { userFoodState } from "../../recoil/diary/UserFoodState";
import { selectedDateState } from "../../recoil/diary/SelectedDateState";
import FoodData from "../../components/diary/food/FoodData";
import { userState } from "../../recoil/common/UserState";

const DiaryTrainingPage = () => {
  const baseUrl = useRecoilValue(baseUrlState);
  const user = useRecoilValue(userState);
  const selectedDate = useRecoilValue(selectedDateState);
  const isSelected = useRecoilValue(toggleDiaryState);
  const setUserFood = useSetRecoilState(userFoodState);

  const getUserFood = async () => {
    // 식단 데이터 가져오기
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

  useEffect(() => {
    getUserFood();
  }, [selectedDate]);

  return (
    <div className="bg-[#C9DECF]/30 pb-2">
      {/* sticky 부분과 겹치는 내용(foodDetailData 스크롤 했을 경우) 안보이게 하기 위해 배경 설정함 */}
      <div className="sticky top-0 bg-white">
        <PageTitle pageTitle={"다이어리"} />
        <ToggleTap
          leftTitle={"캘린더"}
          rightTitle={"그래프"}
          state={toggleDiaryState}
        />
        {isSelected === "left" ? <CalendarWeek /> : <Graph />}
        <hr className={`mt-4 ${isSelected === "right" ? "hidden" : ""}`} />
      </div>
      <div className={`${isSelected === "right" ? "hidden" : ""}`}>
        <FoodData />
      </div>
    </div>
  );
};

export default DiaryTrainingPage;
