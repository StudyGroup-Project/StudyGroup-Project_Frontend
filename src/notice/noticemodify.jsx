import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./noticemodify.css";
import {
  ArrowLeft,
  Send,
  Home,
  FileText,
  Heart,
  Users
} from 'lucide-react';

export default function NoticeModify() {
  const navigate = useNavigate();
  const location = useLocation();

  // location.state에서 studyId, announcementId, 기존 데이터 가져오기
  const { studyId: initialStudyId, noticeId, currentTitle, currentContent, currentFiles } = location.state || {};

  const [title, setTitle] = useState(currentTitle || "");
  const [content, setContent] = useState(currentContent || "");
  const [files, setFiles] = useState([]); // 새로 첨부할 파일
  const [deleteFileIds, setDeleteFileIds] = useState([]); // 삭제할 파일 ID
  const [studyId, setStudyId] = useState(initialStudyId || null);

  /* ---------------------------
      Access Token 자동 갱신
  ---------------------------- */
  async function getRefreshToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return null;

      const res = await fetch("http://3.39.81.234:8080/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("refresh 실패");

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
    const newOptions = {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    };

    let res = await fetch(url, newOptions);

    if (res.status === 401) {
      const newToken = await getRefreshToken();
      if (!newToken) return res;

      newOptions.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, newOptions);
    }
    return res;
  }

  /* ---------------------------
      파일 변경 처리
  ---------------------------- */
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleDeleteFile = (fileId) => {
    setDeleteFileIds([...deleteFileIds, fileId]);
  };

  /* ---------------------------
      공지 수정 제출
  ---------------------------- */
  const handleSubmit = async () => {
    if (!studyId || !noticeId ) {
      return alert("스터디 또는 공지 정보가 없습니다.");
    }
    if (!title || !content) {
      return alert("제목과 내용을 입력해주세요.");
    }

    const url = `http://3.39.81.234:8080/api/studies/${studyId}/announcements/${noticeId}`;
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    // 새로 첨부할 파일
    files.forEach(file => formData.append("files", file));

    // 삭제할 파일 ID
    if (deleteFileIds.length > 0) {
      deleteFileIds.forEach(id => formData.append("deleteFileIds", id));
    }

    try {
      const res = await authFetch(url, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error(`공지 수정 실패: ${res.status}`);

      alert("공지 수정 완료!");
      // 수정 후 상세페이지로 이동
      navigate(`/noticedetailhost/${studyId}/${noticeId}`, { state: { studyId, noticeId } });
    } catch (err) {
      console.error(err);
      alert("공지 수정 실패!");
    }
  };

  /* ---------------------------
      로그인 체크
  ---------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      navigate("/login");
    }
  }, []);

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <button className="headerButton" onClick={() => navigate(-1)}>←</button>
      </div>

      {/* 공지 제목 */}
      <label className="label">• 공지 제목</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="inputField"
      />

      {/* 공지 내용 */}
      <label className="label">• 공지 내용</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="textareaField"
      />

      {/* 새 첨부 파일 */}
      <label className="label">• 첨부 파일 추가</label>
      <input type="file" multiple onChange={handleFileChange} />

      {/* 기존 파일 삭제 */}
      {currentFiles?.length > 0 && (
        <div>
          <label className="label">• 기존 첨부 파일</label>
          <ul>
            {currentFiles.map(file => (
              <li key={file.fileId}>
                {file.fileName} <button onClick={() => handleDeleteFile(file.fileId)}>삭제</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 수정 버튼 */}
      <div className="submitButtonContainer">
        <button onClick={handleSubmit} className="submitButton">
          수정
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


