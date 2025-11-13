import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, MoreHorizontal, Home, Users, Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./resourcesDetail.css";

// AccessToken 만료 시 refresh 토큰으로 재발급 요청
async function getRefreshToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("리프레시 토큰 없음");

    const res = await fetch("http://3.39.81.234:8080/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("토큰 재발급 실패");
    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem("token", data.accessToken);
      return data.accessToken;
    }
  } catch (err) {
    console.error("getRefreshToken 실패:", err);
    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
}

// API 요청 공통 함수 (토큰 자동 갱신 포함)
async function postUserData(url, options = {}) {
  let token = localStorage.getItem("token");

  const defaultOptions = {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };

  let res = await fetch(url, defaultOptions);

  // 토큰 만료 시 재발급 후 재요청
  if (res.status === 401) {
    token = await getRefreshToken();
    if (!token) return null;

    const retryOptions = {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    };
    res = await fetch(url, retryOptions);
  }

  return res;
}

export default function ResourceDetail() {
  const navigate = useNavigate();
  const { studyId, resourceId } = useParams();

  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);

  // 자료 상세 GET
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
        const res = await postUserData(
          `http://3.39.81.234:8080/api/studies/${studyId}/resources/${resourceId}`,
          { method: "GET" }
        );

        if (!res.ok) throw new Error(res.status);
        const data = await res.json();

        // 존재 여부 확인 후 상태 세팅
        if (data.title) setTitle(data.title);
        if (data.content) setContent(data.content);
        if (data.author) setAuthor(data.author);
        if (data.profileUrl) setProfileUrl(data.profileUrl);
        if (data.createdAt) setCreatedAt(data.createdAt);
        if (Array.isArray(data.files)) setFiles(data.files);

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

  // 자료 수정 (PUT)
  const handleSaveClick = async () => {
    getRefreshToken();
    postUserData();

    if (!token) return alert("로그인이 필요합니다.");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    // 파일 첨부 시 추가
    if (file) formData.append("file", file);

    // 서버 요구사항에 따라 fileIds 필드 포함
    const fileIds = files.map((f) => f.fileId);
    formData.append("fileIds", JSON.stringify(fileIds));

    try {
      const res = await postUserData(
        `http://3.39.81.234:8080/api/studies/${studyId}/resources/${resourceId}`,
        {
          method: "PUT",
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

  // 자료 삭제 (DELETE)
  const handleDelete = async () => {
    getRefreshToken();
    postUserData();

    if (!token) return alert("로그인이 필요합니다.");
    try {
      const res = await postUserData(
        `http://3.39.81.234:8080/api/studies/${studyId}/resources/${resourceId}`,
        { method: "DELETE" }
      );

      if (res.status === 204) {
        setModalVisible(false);
        alert("자료 삭제 완료!");
        navigate(-1);
      } else {
        throw new Error(res.status);
      }
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
                    src={profileUrl || "/img/user/Group115.png"}
                    alt="작성자 프로필"
                    className="profile-img"
                  />
                </div>
                <div className="author-text">
                  <p className="author-name">{author || "작성자"}</p>
                  <p className="author-date">
                    {createdAt
                      ? new Date(createdAt).toLocaleString("ko-KR")
                      : ""}
                  </p>
                </div>
              </div>
              <div className="divider" />
              <p className="body-text">{content}</p>

              {/* 파일 목록 */}
              {files.length > 0 && (
                <div className="file-list">
                  <h4>첨부파일</h4>
                  <ul>
                    {files.map((f) => (
                      <li key={f.fileId}>
                        <a href={f.fileUrl} target="_blank" rel="noreferrer">
                          {f.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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