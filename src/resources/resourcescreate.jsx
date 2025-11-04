import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, FileText, Heart, Users } from "lucide-react";
import axios from "axios";
import "./resourcescreate.css";

export default function ResourcesCreate() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]); // ✅ 여러 파일 업로드 지원
  const [loading, setLoading] = useState(true);

  const studyId = 1;
  const baseUrl = `http://3.39.81.234:8080/api/studies/${studyId}/resources`;

  //  access token 갱신 함수
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

  //  인증 요청 공통 함수
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
    files.forEach((f) => formData.append("files", f)); //  files로 append

    try {
      const res = await authorizedFetch(baseUrl, {
        method: "POST",
        body: formData,
      });

      if (!res || !res.ok) {
        throw new Error(`자료 생성 실패: ${res?.status}`);
      }

      if (res.status === 201) {
        alert("자료 생성 완료!");
        navigate("/resources");
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
    <div className="resources-container">
      <header className="resources-header">
        <button className="header-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="header-title">자료실</h1>
      </header>

      <label>자료명</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>내용</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <label>첨부 파일</label>
      <input type="file" multiple onChange={handleFileChange} /> {/* 여러 파일 가능 */}

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleSubmit}>생성</button>
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


