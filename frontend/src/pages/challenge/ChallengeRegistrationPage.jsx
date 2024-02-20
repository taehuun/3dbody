import { useState } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { userState } from "../../recoil/common/UserState";
import { baseUrlState } from "../../recoil/common/BaseUrlState";
import uuid from "react-uuid";
import * as AWS from "@aws-sdk/client-s3";
import BackButton from "./../../components/common/BackButton";
import PageTitle from "./../../components/common/PageTitle";

const ChallengeRegistrationPage = () => {
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeSummary, setChallengeSummary] = useState("");
  const [challengeContent, setChallengeContent] = useState("");
  const date = new Date().toISOString().slice(0, 10);
  const [challengeStartDate, setChallengeStartDate] = useState(`${date}T00:00`);
  const [challengeEndDate, setChallengeEndDate] = useState(`${date}T00:00`);
  const baseUrl = useRecoilValue(baseUrlState);
  const user = useRecoilValue(userState);
  const region = "ap-northeast-2"; // S3 지역 이름
  const bucket = "3dbody-image"; // S3 버킷 이름
  let extension = ""; // 확장자 구별
  const [thumbnail, setThumbnail] = useState({}); // 썸네일 파일
  const [thumbnailName, setThumbnailName] = useState(""); // 썸네일 이름
  const [image, setImage] = useState({}); // 이미지 파일
  const [imageName, setImageName] = useState(""); // 이미지 이름

  const awsUpdate = new AWS.S3Client({
    region: region,
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
  });

  const onChallengeThumnailHandler = (event) => {
    setThumbnail(event.currentTarget.files[0]);
    setThumbnailName(`${uuid()}_${event.currentTarget.files[0].name}`); //uuid => 난수 설정
  };
  const onChallengeImageHandler = (event) => {
    setImage(event.currentTarget.files[0]);
    setImageName(`${uuid()}_${event.currentTarget.files[0].name}`); //uuid => 난수 설정
  };
  const onChallengeTitleHandler = (event) => {
    setChallengeTitle(event.currentTarget.value);
  };
  const onChallengeSummaryHandler = (event) => {
    setChallengeSummary(event.currentTarget.value);
  };
  const onChallengeContentHandler = (event) => {
    setChallengeContent(event.currentTarget.value);
  };
  const onChallengeStartDateHandler = (event) => {
    setChallengeStartDate(event.currentTarget.value);
  };
  const onChallengeEndDateHandler = (event) => {
    if (event.currentTarget.value < challengeStartDate) {
      alert("종료일이 시작일보다 빠릅니다.");
    } else {
      setChallengeEndDate(event.currentTarget.value);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    await axios
      .post(`${baseUrl}api/challenge`, {
        thumbnail: `https://do9nz79ez57wg.cloudfront.net/${thumbnailName}`,
        image: `https://do9nz79ez57wg.cloudfront.net/${imageName}`,
        title: challengeTitle,
        summary: challengeSummary,
        content: challengeContent,
        start_date: challengeStartDate,
        end_date: challengeEndDate,
        user_id: user.info.userId,
      })
      .then(() => {
        window.location.replace("/challenge");
      });
  };

  // S3 에 넣기
  const onChallengeThumnailSubmitHandler = async (event) => {
    event.preventDefault();
    if (thumbnailName.includes("jpg") || thumbnailName.includes("jpeg")) {
      extension = "image/jpeg";
    } else if (thumbnailName.includes("png")) {
      extension = "image/png";
    } else if (thumbnailName.includes("gif")) {
      extension = "image/gif";
    }
    const params = {
      Bucket: bucket,
      Key: thumbnailName,
      Body: thumbnail,
      ContentType: extension,
    };

    awsUpdate.send(new AWS.PutObjectCommand(params)).then(() => {
      // console.log("성공");
      alert("등록되었습니다.");
    });
  };

  // S3 에 넣기
  const onChallengeImageSubmitHandler = async (event) => {
    event.preventDefault();
    if (imageName.includes("jpg") || imageName.includes("jpeg")) {
      extension = "image/jpeg";
    } else if (imageName.includes("png")) {
      extension = "image/png";
    } else if (imageName.includes("gif")) {
      extension = "image/gif";
    }
    const params = {
      Bucket: bucket,
      Key: imageName,
      Body: image,
      ContentType: extension,
    };

    awsUpdate.send(new AWS.PutObjectCommand(params)).then(() => {
      // console.log("성공");
      alert("등록되었습니다.");
    });
  };

  return (
    <div>
      <div className="absolute flex justify-between w-full">
        <BackButton />
      </div>
      <PageTitle pageTitle="챌린지 등록" />
      <div className="bg-gray-100">
        <div className="pt-4">
          <form
            onSubmit={onChallengeThumnailSubmitHandler}
            className="flex items-center mx-4 mt-2 text-center"
          >
            <label className="relative w-full p-2 overflow-hidden text-left bg-white border rounded-md">
              {thumbnail.name ? (
                <span className="text-black">{thumbnail.name}</span>
              ) : (
                <span className="text-gray-400">썸네일을 선택해주세요.</span>
              )}
              <input
                type="file"
                className="hidden"
                onChange={onChallengeThumnailHandler}
              />
            </label>
            <button
              type="submit"
              className="h-10 text-white bg-teal-700 border rounded-lg w-14"
            >
              등록
            </button>
          </form>
          <form
            onSubmit={onChallengeImageSubmitHandler}
            className="flex items-center mx-4 mt-1 text-center"
          >
            <label className="relative w-full p-2 overflow-hidden text-left bg-white border rounded-md">
              {image.name ? (
                <span className="text-black">{image.name}</span>
              ) : (
                <span className="text-gray-400">포스터를 선택해주세요.</span>
              )}
              <input
                type="file"
                className="hidden"
                onChange={onChallengeImageHandler}
              />
            </label>
            <button
              type="submit"
              className="h-10 text-white bg-teal-700 border rounded-lg w-14"
            >
              등록
            </button>
          </form>
        </div>
        <form onSubmit={onSubmitHandler}>
          <div className="pt-4 mx-4">
            {/* <label>제목</label> */}
            <input
              type="text"
              value={challengeTitle}
              onChange={onChallengeTitleHandler}
              className="p-2 border-2 rounded-md"
              placeholder="제목"
            />
          </div>
          <div className="mx-4 my-2">
            {/* <label>한줄 설명</label> */}
            <input
              type="text"
              value={challengeSummary}
              onChange={onChallengeSummaryHandler}
              className="p-2 border-2 rounded-md"
              placeholder="한줄 설명"
            />
          </div>
          <div className="mx-4">
            {/* <label>상세 설명</label> */}
            <textarea
              // cols="51"
              // rows="5"
              value={challengeContent}
              onChange={onChallengeContentHandler}
              className="w-full h-40 p-2 border-2 rounded-md"
              placeholder="내용을 입력하세요."
            ></textarea>
          </div>
          <br />
          <div className="mx-4 my-2">
            <label>시작일</label>
            <input
              type="datetime-local"
              value={challengeStartDate}
              onChange={onChallengeStartDateHandler}
              className="p-2 border-2 rounded-md"
            />
          </div>
          <div className="mx-4 my-2">
            <label>종료일</label>
            <input
              type="datetime-local"
              value={challengeEndDate}
              onChange={onChallengeEndDateHandler}
              className="p-2 border-2 rounded-md"
            />
          </div>
          <div className="flex justify-center">
            <button className="w-10/12 p-2 mt-3 mb-4 text-center text-white bg-teal-700 border-2 border-teal-700 rounded-full">
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeRegistrationPage;
