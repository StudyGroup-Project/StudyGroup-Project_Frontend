import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 추가
import {
  ArrowLeft,
  Home,
  FileText,
  Heart,
  Users
} from "lucide-react";
import "./resourcescreate.css";

export default function ResourcesCreate() { // 파일명 맞춤
  const navigate = useNavigate(); // 추가

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 페이지 로드 시 로그인 체크
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (!storedToken) {
      alert("로그인이 필요합니다.");
    }

    setLoading(false);
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    const studyId = 1; // 실제 스터디 ID로 변경
    const url = `http://3.39.81.234:8080/api/studies/${studyId}/resources`;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`자료 생성 실패: ${response.status}`);
      }

      const result = await response.json();
      console.log("📢 자료 생성 성공:", result);
      alert("자료 생성 완료!");

      navigate("/resources"); // ✅ 생성 후 자료 목록 페이지로 이동
    } catch (error) {
      console.error("❌ 오류 발생:", error);
      alert("자료 생성 실패!");
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (!token) return null;

  return (
    <div className="resources-container">
      {/* 상단 헤더 */}
      <header className="resources-header">
        <button className="header-back" onClick={() => navigate(-1)}> {/* 뒤로가기 */}
          <ArrowLeft size={20} />
        </button>
        <h1 className="header-title">자료실</h1>
      </header>

      {/* 자료 제목 */}
      <label>자료명</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* 자료 내용 */}
      <label>내용</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* 첨부 파일 */}
      <label>첨부 파일</label>
      <input type="file" onChange={handleFileChange} />

      {/* 생성 버튼 */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={handleSubmit}>생성</button>
      </div>

      {/* 하단 탭바 */}
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

