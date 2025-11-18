import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./noticecreate.css";
import { Home, FileText, Heart, Users, ArrowLeft } from "lucide-react";

export default function NoticeCreate() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);

  /* ---------------------------
      Refresh Token 자동 갱신
  ---------------------------- */
  async function getRefreshToken() {
    try {
      const res = await fetch("http://3.39.81.234:8080/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return null;

      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async function authFetch(url, options = {}) {
    let token = localStorage.getItem("accessToken");

    let res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      const freshToken = await getRefreshToken();
      if (!freshToken) return res;

      res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${freshToken}`,
        },
      });
    }
    return res;
  }

  /* ---------------------------
      파일 추가
  ---------------------------- */
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  /* ---------------------------
      공지 생성 제출
  ---------------------------- */
  const handleSubmit = async () => {
    if (!studyId) return alert("스터디 ID가 없습니다.");
    if (!title || !content) return alert("제목과 내용을 입력해주세요.");

    const url = `http://3.39.81.234:8080/api/studies/${studyId}/announcements`;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    files.forEach((file) => formData.append("files", file));

    try {
      const res = await authFetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("공지 생성 실패: " + res.status);

      alert("공지 생성 완료!");

      navigate(`/noticehost/${studyId}`); // 생성 후 공지 목록으로
    } catch (err) {
      console.error(err);
      alert("공지 생성 실패!");
    }
  };

  /* ---------------------------
      로그인 체크
  ---------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    }
  }, []);

  return (
    <div className="container">
      <div className="header">
        <ArrowLeft size={24} className="icon" onClick={() => navigate(`/noticehost/${studyId}`)} />
          </div>
          

      <label className="label">• 공지 제목</label>
      <input
        className="inputField"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="label">• 공지 내용</label>
      <textarea
        className="textareaField"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <label className="label">• 첨부 파일</label>
      <input type="file" multiple onChange={handleFileChange} />

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
