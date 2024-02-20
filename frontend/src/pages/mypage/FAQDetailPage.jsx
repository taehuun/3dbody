import axios from "axios";
import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { baseUrlState } from "../../recoil/common/BaseUrlState";
import BackButton from "./../../components/common/BackButton";
import { useParams } from "react-router-dom";
import { useState } from "react";
import PageTitle from "../../components/common/PageTitle";

const FAQDetailPage = () => {
  const { postId } = useParams();
  const baseUrl = useRecoilValue(baseUrlState);
  const [FAQ, setFAQ] = useState({});
  const getFAQ = () => {
    axios({
      method: "get",
      url: `${baseUrl}api/faq/posts/${postId}`,
    }).then((res) => {
      setFAQ(res.data);
    });
  };
  useEffect(() => {
    getFAQ();
  }, []);
  return (
    <div>
      <div className="absolute">
        <BackButton />
      </div>
      <PageTitle pageTitle="FAQ 상세" />
      <div>{FAQ.content}</div>
    </div>
  );
};

export default FAQDetailPage;
