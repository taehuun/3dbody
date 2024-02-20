import axios from 'axios';
import { useRecoilValue, useSetRecoilState } from "recoil";
import { isRestState } from "../../../recoil/diary/IsRestState";
import { baseUrlState } from '../../../recoil/common/BaseUrlState';
import { userState } from '../../../recoil/common/UserState';
import { selectedDateState } from '../../../recoil/diary/SelectedDateState';

const Rest = () => {
  const baseUrl = useRecoilValue(baseUrlState);
  const user = useRecoilValue(userState);
  const selectedDate = useRecoilValue(selectedDateState);
  const setIsRest = useSetRecoilState(isRestState);

  const onClickHandler = () => {
    const deleteIsRest = async () => {
      await axios
        .delete(
          `${baseUrl}api/management/training/rest?user_id=${user.info.userId}&year=${selectedDate[0]}&month=${selectedDate[1]}&day=${selectedDate[2]}`
        )
        .then((res) => {
          console.log("휴식 해제 성공");
          setIsRest(false);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    deleteIsRest();
  };

  return (
    <div className="flex flex-col items-center gap-2 pt-16">
      <img src="/diary/rest.jpg" alt="img" className='w-1/2 border rounded-full animate-bounce'/>
      <p>오늘은 운동 쉬는 날!</p>
      <p onClick={onClickHandler} className="text-gray-500 underline ">
        휴식 취소
      </p>
    </div>
  );
};

export default Rest;
