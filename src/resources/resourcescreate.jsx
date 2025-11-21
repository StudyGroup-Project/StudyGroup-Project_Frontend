import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Home, FileText, Heart, Users, Trash2 } from "lucide-react";
import axios from "axios";
import "./resourcescreate.css";

export default function ResourcesCreate() {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const baseUrl = `http://3.39.81.234:8080/api/studies/${studyId}/resources`;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // access token 재발급
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

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) getRefreshToken();
    setLoading(false);
  }, []);

  // 파일 선택
  const handleFileChange = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  // 파일 개별 삭제
  const handleFileRemove = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 제출
  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    files.forEach((f) => formData.append("files", f));

    try {
      let token = localStorage.getItem("accessToken");
      if (!token) token = await getRefreshToken();
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      let res = await fetch(baseUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error(`자료 생성 실패: ${res.status}`);

      alert("자료 생성 완료!");
      navigate(`/resources/${studyId}`);
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

      {/* 파일 선택 input */}
      <div className="fileInputContainer">
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="fileInput"
        />
      </div>

      {/* 파일 리스트 → input 아래로 분리 */}
      {files.length > 0 && (
        <ul className="fileList">
          {files.map((file, idx) => (
            <li key={idx} className="fileItem">
              <span>{file.name}</span>

              <Trash2
                size={16}
                style={{ cursor: "pointer", marginLeft: "8px" }}
                onClick={() => handleFileRemove(idx)}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="submitButtonContainer">
        <button className="submitButton" onClick={handleSubmit}>
          생성
        </button>
      </div>

      {/* 하단 탭바 */}
      <div className="tab-bar">
        <div className="tab-item" onClick={() => navigate("/home")}>
          <Home size={24} />
          <span>홈</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/mygroup")}>
          <FileText size={24} />
          <span>내 그룹</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/bookmarked")}>
          <Heart size={24} />
          <span>찜 목록</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/myprofile")}>
          <Users size={24} />
          <span>내 정보</span>
        </div>
      </div>
    </div>
  );
}
