import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, MoreHorizontal, Home, Users, Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./resourcesDetail.css";

// -------------------------
// 토큰 갱신
// -------------------------
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
    if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
  } catch (err) {
    console.error("getRefreshToken 실패:", err);
    alert("세션 만료, 다시 로그인해주세요.");
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  }
}

// -------------------------
// fetch with token
// -------------------------
async function fetchWithToken(url, options = {}) {
  let token = localStorage.getItem("accessToken");

  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    token = await getRefreshToken();
    if (!token) return null;
    res = await fetch(url, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    });
  }

  return res;
}

// -------------------------
// ResourceDetail 컴포넌트
// -------------------------
export default function ResourceDetail() {
  const navigate = useNavigate();
  const { studyId, resourceId } = useParams();

  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [files, setFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [deleteFileIds, setDeleteFileIds] = useState([]);

  // -------------------------
  // 자료 상세 GET
  // -------------------------
  const fetchResource = async () => {
    setLoading(true);
    try {
      const res = await fetchWithToken(
        `http://3.39.81.234:8080/api/studies/${studyId}/resources/${resourceId}`
      );
      if (!res || !res.ok) throw new Error("자료 조회 실패");

      const data = await res.json();
      setTitle(data.title || "");
      setContent(data.content || "");
      setAuthor(data.author || "작성자 미상");
      setProfileUrl(data.profileUrl || "/img/user/Group115.png");
      setCreatedAt(data.createdAt || "");
      setFiles(Array.isArray(data.files) ? data.files : []);
      setNewFiles([]);
      setDeleteFileIds([]);
    } catch (err) {
      console.error(err);
      alert("자료를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [studyId, resourceId]);

  // -------------------------
  // 자료 삭제
  // -------------------------
  const handleDelete = async () => {
    try {
      const res = await fetchWithToken(
        `http://3.39.81.234:8080/api/studies/${studyId}/resources/${resourceId}`,
        { method: "DELETE" }
      );
      if (!res || res.status !== 204) throw new Error("삭제 실패");

      alert("자료 삭제 완료!");
      navigate(`/resources/${studyId}`);
    } catch (err) {
      console.error("자료 삭제 실패:", err);
      alert("자료 삭제 실패!");
    }
  };

  // -------------------------
  // 수정 저장
  // -------------------------
const handleSaveClick = async () => {
  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);

    // 새 파일 추가
    newFiles.forEach((file) => formData.append("files", file));

    // 삭제할 파일 ID
    deleteFileIds.forEach((id) => formData.append("deleteFileIds", id));

    // PUT 요청
    const res = await fetchWithToken(
      `http://3.39.81.234:8080/api/studies/${studyId}/resources/${resourceId}`,
      {
        method: "PUT",
        body: formData,
        headers: {}, // multipart/form-data는 headers 절대 직접 지정하면 안 됨
      }
    );

    if (!res || !res.ok) throw new Error("자료 수정 실패");

    // 최신 데이터 다시 가져오기 (캐시 방지)
    const updatedRes = await fetchWithToken(
      `http://3.39.81.234:8080/api/studies/${studyId}/resources/${resourceId}?t=${Date.now()}`
    );

    if (!updatedRes || !updatedRes.ok) throw new Error("최신 자료 조회 실패");
    const updatedData = await updatedRes.json();

    // UI 최신 반영
    setFiles(Array.isArray(updatedData.files) ? updatedData.files : []);
    setTitle(updatedData.title || "");
    setContent(updatedData.content || "");

    // 상태 초기화
    setNewFiles([]);
    setDeleteFileIds([]);
    setIsEditing(false);

    alert("자료 수정 완료!");
  } catch (err) {
    console.error(err);
    alert("자료 수정 실패!");
  }
};



  // -------------------------
  // 파일 삭제 버튼 클릭
  // -------------------------
  const handleFileDelete = (fileId) => {
    setDeleteFileIds((prev) => [...prev, fileId]);
    setFiles((prev) => prev.filter((f) => f.fileId !== fileId)); // UI에서 즉시 제거
  };

  // -------------------------
  // 새 파일 선택
  // -------------------------
  const handleNewFilesChange = (e) => {
    setNewFiles([...newFiles, ...Array.from(e.target.files)]);
  };

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="resource-detail-container">
      {/* 헤더 */}
      <div className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h2 className="title">상세보기</h2>
        {!isEditing && (
          <div style={{ position: "relative" }}>
            <MoreHorizontal
              size={22}
              onClick={() => setMenuVisible(!menuVisible)}
              style={{ cursor: "pointer" }}
            />
            {menuVisible && (
              <div className="more-menu">
                <div className="menu-item" onClick={() => setIsEditing(true)}>
                  수정
                </div>
                <div className="dropdown-divider"></div>
                <div className="menu-item" onClick={() => setModalVisible(true)}>
                  삭제
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 본문 */}
      <div className="content">
        <h3 className="subtitle">{title}</h3>
        <div className="author-info">
          <img src={profileUrl} alt="작성자" className="profile-img" />
          <div>
            <p className="author-name">{author}</p>
            <p className="author-date">
              {createdAt ? new Date(createdAt).toLocaleString("ko-KR") : ""}
            </p>
          </div>
        </div>
        <div className="divider" />

        {/* 수정 모드 */}
        {isEditing && (
          <div className="edit-section">
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
            <input type="file" multiple onChange={handleNewFilesChange} />

            {/* 기존 파일 */}
            <div className="file-list">
              <h4>기존 첨부파일</h4>
              {files.length === 0 && <p>없음</p>}
              <ul>
                {files.map((f) => (
                  <li key={f.fileId}>
                    <a href={f.fileUrl} target="_blank" rel="noreferrer">
                      {f.fileName}
                    </a>
                    <button onClick={() => handleFileDelete(f.fileId)}>삭제</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 새 파일 */}
            {newFiles.length > 0 && (
              <div className="file-list">
                <h4>추가 파일</h4>
                <ul>
                  {newFiles.map((f, idx) => (
                    <li key={idx}>{f.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className="save-btn" onClick={handleSaveClick}>
              저장
            </button>
          </div>
        )}

        {/* 일반 모드 */}
        {!isEditing && (
          <>
            <p className="body-text">{content}</p>
            <div className="divider" />
            <div className="file-list">
              <h4>첨부파일</h4>
              {files.length === 0 ? (
                <p>없음</p>
              ) : (
                <ul>
                  {files.map((f) => (
                    <li key={f.fileId}>
                      <a href={f.fileUrl} target="_blank" rel="noreferrer">
                        {f.fileName}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
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
