import React, { useState } from "react";
import "./noticemodify.css"; 
import {
  ArrowLeft,
  MoreHorizontal,
  Send,
  Home,
  FileText,
  Heart,
  Users
} from 'lucide-react';

export default function NoticeModify() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const studyId = 1;
    const url = `http://3.39.81.234:8080/api/studies/${studyId}/announcements`;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

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

      if (!response.ok) throw new Error(`공지 생성 실패: ${response.status}`);

      const result = await response.json();
      console.log("📢 공지 생성 성공:", result);
      alert("공지 생성 완료!");
    } catch (error) {
      console.error("❌ 오류 발생:", error);
      alert("공지 생성 실패!");
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <button className="headerButton">←</button>
      </div>

      {/* 공지 이름 */}
      <label className="label">• 공지 이름</label>
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

      {/* 첨부 파일 */}
      <label className="label">• 첨부 파일란</label>
      <div className="fileInputContainer">
        <input
          type="file"
          onChange={handleFileChange}
          className="fileInput"
        />
        <span className="addIcon">+</span>
      </div>

      {/* 생성 버튼 */}
      <div className="submitButtonContainer">
        <button onClick={handleSubmit} className="submitButton">
          수정
        </button>
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

