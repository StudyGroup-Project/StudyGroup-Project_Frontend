import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, MoreHorizontal, Home, Users, Heart, PlusCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./resourcesDetail.css";
import "./resourcesCreate.css"; // resourcesCreate CSS import

export default function ResourceDetail() {
  const navigate = useNavigate();
  const { studyId, resourceId } = useParams();

  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  // ✅ 페이지 로드 시 로그인 체크
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (!storedToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    setLoading(false);
  }, []);

  const handleMoreClick = () => setMenuVisible(!menuVisible);
  const handleEditClick = () => {
    setMenuVisible(false);
    setIsEditing(true);
  };
  const handleDeleteClick = () => {
    setMenuVisible(false);
    setTimeout(() => setModalVisible(true), 50);
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSaveClick = async () => {
    if (!token) return alert("로그인이 필요합니다.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (file) formData.append("file", file);

    try {
      const res = await fetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/resources/${resourceId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!res.ok) throw new Error(res.status);
      alert("자료 수정 완료!");
      setIsEditing(false);
    } catch (err) {
      console.error("자료 수정 실패:", err);
      alert("자료 수정 실패!");
    }
  };

  const handleDelete = async () => {
    if (!token) return alert("로그인이 필요합니다.");
    try {
      const res = await fetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/resources/${resourceId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error(res.status);
      setModalVisible(false);
      alert("자료 삭제 완료!");
      navigate(-1);
    } catch (err) {
      console.error("자료 삭제 실패:", err);
      alert("자료 삭제 실패!");
    }
  };

  // 로딩 표시 제거
  if (loading) return null;
  if (!token) return null;

  return (
    <div className="resource-detail-container">
      {!isEditing ? (
        <>
          {/* 상단 헤더 */}
          <div className="header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={22} />
            </button>
            <h2 className="title">{isEditing ? "글 수정" : "상세보기"}</h2>

            <div style={{ position: "relative" }}>
              <MoreHorizontal
                size={22}
                color="#666"
                onClick={handleMoreClick}
                style={{ cursor: "pointer" }}
              />
              {menuVisible && (
                <div className="more-menu">
                  <div className="menu-item" onClick={handleEditClick}>
                    수정
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="menu-item" onClick={handleDeleteClick}>
                    삭제
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 본문 */}
          <div className="content">
            <h3 className="subtitle">{title}</h3>
            <div className="author-info">
              <div className="user-icon">
                <img
                  src="/img/user/Group115.png"
                  alt="작성자 프로필"
                  className="profile-img"
                />
              </div>
              <div className="author-text">
                <p className="author-name">작성자</p>
                <p className="author-date">8월 28일 오후 4:23</p>
              </div>
            </div>
            <div className="divider" />
            <p className="body-text">{content}</p>
          </div>

          {/* 하단 네비 */}
          <div className="bottom-nav">
            <div className="nav-item" onClick={() => navigate("/home")}>
              <Home size={22} />
              <span>홈</span>
            </div>
            <div className="nav-item" onClick={() => navigate("/group")}>
              <Users size={22} />
              <span>내 그룹</span>
            </div>
            <div className="nav-item" onClick={() => navigate("/favorites")}>
              <Heart size={22} />
              <span>찜 목록</span>
            </div>
            <div className="nav-item" onClick={() => navigate("/profile")}>
              <Users size={22} />
              <span>내 정보</span>
            </div>
          </div>
        </>
      ) : (
        // 🟣 수정 모드 resourcesCreate CSS 적용
        <div className="container">
          <header className="header">
            <button className="headerButton" onClick={() => setIsEditing(false)}>
              <ArrowLeft size={20} />
            </button>
            
          </header>

          <label className="label">자료명</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="inputField"
          />

          <label className="label">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="textareaField"
          />

          <label className="label">첨부 파일</label>
          <div className="fileInputContainer">
            <input type="file" onChange={handleFileChange} className="fileInput" />
            <PlusCircle size={20} />
          </div>

          <div className="submitButtonContainer">
            <button className="submitButton" onClick={handleSaveClick}>
              저장
            </button>
          </div>

          {/* 하단 탭바 */}
          <div className="tabbar">
            <div className="tabItem" onClick={() => navigate("/home")}>
              <Home size={24} />
              <span>홈</span>
            </div>
            <div className="tabItem" onClick={() => navigate("/group")}>
              <Users size={24} />
              <span>내 그룹</span>
            </div>
            <div className="tabItem" onClick={() => navigate("/favorites")}>
              <Heart size={24} />
              <span>찜 목록</span>
            </div>
            <div className="tabItem" onClick={() => navigate("/profile")}>
              <Users size={24} />
              <span>내 정보</span>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 모달 */}
      {modalVisible &&
        createPortal(
          <div className="modal-overlay">
            <div className="modal">
              <p>⚠️ 삭제하시겠습니까?</p>
              <div className="modal-buttons">
                <button onClick={() => setModalVisible(false)}>취소</button>
                <button onClick={handleDelete}>삭제</button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}


