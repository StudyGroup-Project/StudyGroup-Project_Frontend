import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Home, FileText, Heart, Users } from "lucide-react";
import axios from "axios";
import "./resourcescreate.css";

export default function ResourcesCreate() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]); // 여러 파일 업로드 지원
  const [loading, setLoading] = useState(true);

  const { studyId } = useParams();
  const baseUrl = `http://3.39.81.234:8080/api/studies/${studyId}/resources`;


  // access token 재발급 함수
  const getRefreshToken = async () => {
    try {
      const cookies = document.cookie
        .split("; ")
        .reduce((acc, cur) => {
          const [key, value] = cur.split("=");
          acc[key] = value;
          return acc;
        }, {});

      const res = await axios.post(
        "http://3.39.81.234:8080/api/auth/token",
        { refreshToken: cookies.refreshToken },
        { withCredentials: true }
      );

      localStorage.setItem("accessToken", res.data.accessToken);
      return res.data.accessToken;
    } catch (err) {
      console.error("토큰 갱신 실패:", err);
      alert("로그인이 필요합니다.");
      return null;
    }
  };


  // 인증 요청 공통 함수
  const authorizedFetch = async (url, options = {}) => {
    let token = localStorage.getItem("accessToken");
    if (!token) token = await getRefreshToken();
    if (!token) return null;

    let res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    // 만료된 토큰이면 새로 발급받고 재시도
    if (res.status === 401) {
      token = await getRefreshToken();
      if (!token) return null;

      res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });


      navigate("/login"); // 토큰 없으면 로그인 페이지 이동


    }

    return res;
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      getRefreshToken();
    }
    setLoading(false);
  }, []);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    files.forEach((f) => formData.append("files", f)); // 'files' 키로 파일 추가

    try {
      // 1. 토큰을 직접 가져옵니다.
      let token = localStorage.getItem("accessToken");
      if (!token) {
        token = await getRefreshToken(); // 없으면 재발급 시도
      }
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      // 2. authorizedFetch 대신 fetch를 직접 사용합니다.
      //    (resourcesDetail.jsx의 handleSaveClick 방식과 동일)
      let res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // 🚨 'Content-Type' 헤더를 절대 추가하지 마세요.
          //    브라우저가 FormData를 위해 자동으로 설정합니다.
        },
        body: formData,
      });

      // 3. 토큰 만료(401) 시 수동으로 재시도
      if (res.status === 401) {
        token = await getRefreshToken(); // 새 토큰 발급
        if (!token) return; // 재발급 실패

        // 새 토큰으로 재시도
        res = await fetch(baseUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      // 4. 최종 결과 확인
      if (!res || !res.ok) {
        throw new Error(`자료 생성 실패: ${res?.status}`);
      }

      if (res.status === 201) {
        alert("자료 생성 완료!");
        // 🚨 navigate("/resources") 대신 studyId가 포함된 경로로 가야 합니다.
        navigate(`/resources/${studyId}`);
      } else {
        alert("자료 생성에 성공했지만 응답 코드가 예상과 다릅니다.");
      }
    } catch (error) {
      console.error("❌ 오류 발생:", error);
      alert("자료 생성 실패!");
    }
  };

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="container"> 
      <header className="header"> 
        <button className="headerButton" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
       
      </header>

      <label className="label">자료명</label> 
      <input
        type="text"
        className="inputField"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="label">내용</label> 
      <textarea
        className="textareaField" 
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <label className="label">첨부 파일</label> 
      <div className="fileInputContainer"> 
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="fileInput" 
        />
      </div>

      <div className="submitButtonContainer"> 
        <button className="submitButton" onClick={handleSubmit}> 
          생성
        </button>
      </div>

      <div className="tabbar">
        <div className="tabItem">
          <Home size={24} />
          <span>홈</span>
        </div>
        <div className="tabItem">
          <FileText size={24} />
          <span>내 그룹</span>
        </div>
        <div className="tabItem">
          <Heart size={24} />
          <span>찜 목록</span>
        </div>
        <div className="tabItem">
          <Users size={24} />
          <span>내 정보</span>
        </div>
      </div>
    </div>
  );
}