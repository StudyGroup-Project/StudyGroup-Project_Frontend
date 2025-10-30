import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, MoreHorizontal, Home, Users, Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./resourcesDetail.css";

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

  // ✅ 페이지 로드 시 로그인 체크 + 자료 상세 데이터 가져오기
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (!storedToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchResource = async () => {
      try {
        const res = await fetch(
          `http://3.39.81.234:8080/api/studies/${studyId}/resources/${resourceId}`,
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();

        // 서버에서 가져온 자료 데이터 세팅
        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        console.error("자료 조회 실패:", err);
        alert("자료를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [navigate, studyId, resourceId]);

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

  // ✅ 자료 수정
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

  // ✅ 자료 삭제
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

  if (loading) return <p>로딩 중...</p>;
  if (!token) return null;

  return (
    <div className="resource-detail-container">
      {/* 상단 헤더 */}
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h2 className="title">{isEditing ? "글 수정" : "상세보기"}</h2>

        <div style={{ position: "relative" }}>
          {!isEditing && (
            <MoreHorizontal
              size={22}
              color="#666"
              onClick={handleMoreClick}
              style={{ cursor: "pointer" }}
            />
          )}
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
        <div className="section">
          {isEditing ? (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="edit-title"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="edit-content"
              />
              <input type="file" onChange={handleFileChange} />
              <button className="save-btn" onClick={handleSaveClick}>
                저장
              </button>
            </>
          ) : (
            <>
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
              <div className="divider" />
            </>
          )}
        </div>
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



