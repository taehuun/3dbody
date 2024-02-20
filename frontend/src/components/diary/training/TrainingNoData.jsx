import { useEffect } from "react";
import axios from "axios";
import { useRecoilState, useRecoilValue } from "recoil";

import { selectedDateState } from "../../../recoil/diary/SelectedDateState";
import { isRestState } from "../../../recoil/diary/IsRestState";
import { baseUrlState } from "../../../recoil/common/BaseUrlState";
import Rest from "./Rest";
import Plan from "./Plan";
import { userState } from "../../../recoil/common/UserState";

const TrainingNoData = () => {
  const baseUrl = useRecoilValue(baseUrlState);
  const user = useRecoilValue(userState);
  const selectedDate = useRecoilValue(selectedDateState);
  const [isRest, setIsRest] = useRecoilState(isRestState);

  // 해당 날짜 휴식 여부 가져오기
  const getIsRest = async () => {
    await axios
      .get(
        `${baseUrl}api/management/training/rest?user_id=${user.info.userId}&year=${selectedDate[0]}&month=${selectedDate[1]}&day=${selectedDate[2]}`
      )
      .then((res) => {
        setIsRest(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getIsRest();
  }, [selectedDate]);

  return (
    <div className='pb-80'>
      {isRest ? <Rest /> : <Plan />}
    </div>
  );
};

export default TrainingNoData;
