import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { ArrowLeft, MoreHorizontal, Send, Home, FileText, Heart, Users } from "lucide-react";
import "./noticedetailhost.css";

export default function NoticeDetailHost() {
  const navigate = useNavigate();
  const { studyId, noticeId } = useParams();
  const menuRef = useRef(null);

  const [noticeData, setNoticeData] = useState(null);
  const [comments, setComments] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [deleteFileIds, setDeleteFileIds] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  // ----------------- 토큰 & fetch -----------------
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
    } catch (err) { console.error(err); return null; }
  }

  async function authFetch(url, options = {}) {
    let token = localStorage.getItem("accessToken");
    let newOptions = { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` } };
    let res = await fetch(url, newOptions);
    if (res.status === 401) {
      const newToken = await getRefreshToken();
      if (!newToken) return res;
      newOptions.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, newOptions);
    }
    return res;
  }

  // ----------------- 공지 상세 -----------------
  const fetchNoticeDetail = async () => {
    try {
      const res = await authFetch(`http://3.39.81.234:8080/api/studies/${studyId}/announcements/${noticeId}`);
      if (!res.ok) throw new Error("공지 상세 실패");
      const data = await res.json();
      setNoticeData(data);
      setComments(data.comments || []);
      setTitle(data.title);
      setContent(data.content);
      setNewFiles([]);
      setDeleteFileIds([]);
    } catch (err) { console.error(err); alert("공지 로딩 실패!"); }
  };

  useEffect(() => { fetchNoticeDetail(); }, [studyId, noticeId]);

  // ----------------- 수정 & 삭제 -----------------
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) { alert("제목과 내용을 입력해주세요."); return; }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    newFiles.forEach(f => formData.append("files", f));
    deleteFileIds.forEach(id => formData.append("deleteFileIds", id));

    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/announcements/${noticeId}`,
        { method: "PUT", body: formData }
      );
      if (!res.ok) throw new Error("수정 실패");
      alert("수정 완료!");
      setIsEditing(false);
      fetchNoticeDetail();
    } catch (err) { console.error(err); alert("공지 수정 실패!"); }
  };

  const handleDelete = async () => {
    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/announcements/${noticeId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("삭제 실패");
      alert("삭제 완료!");
      navigate(`/noticehost/${studyId}`);
    } catch (err) { console.error(err); alert("공지 삭제 실패!"); }
  };

  // ----------------- 파일 -----------------
  const handleNewFilesChange = e => setNewFiles(prev => [...prev, ...Array.from(e.target.files)]);
  const handleFileDelete = id => {
    setDeleteFileIds(prev => [...prev, id]);
    setNoticeData(prev => ({ ...prev, files: prev.files.filter(f => f.fileId !== id) }));
  };

  // ----------------- 댓글 -----------------
  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/announcements/${noticeId}/comments`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: commentInput }) }
      );
      if (res.status !== 201) throw new Error("댓글 작성 실패");
      setCommentInput("");
      fetchNoticeDetail();
    } catch (err) { console.error(err); alert("댓글 작성 실패!"); }
  };

  // ----------------- 메뉴 클릭 외부 -----------------
  useEffect(() => {
    const handleClick = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!noticeData) return <p>로딩중...</p>;

  return (
    <div className="resource-detail-container">
      {/* 헤더 */}
      <div className="header">
        <ArrowLeft size={24} onClick={() => navigate(`/noticehost/${studyId}`)} />
        <span className="title">{isEditing ? "공지 수정" : "상세보기"}</span>
        {!isEditing &&
          <div className="menuWrapper" ref={menuRef} style={{ position: "relative" }}>
            <MoreHorizontal size={24} onClick={() => setMenuOpen(!menuOpen)} style={{ cursor: "pointer" }} />
            {menuOpen && (
              <div className="more-menu">
                <div className="menu-item" onClick={() => setIsEditing(true)}>수정</div>
                <div className="dropdown-divider"></div>
                <div className="menu-item" onClick={() => setModalVisible(true)}>삭제</div>
              </div>
            )}
          </div>
        }
      </div>

      {/* 본문 */}
      <div className="content">
        <h3 className="subtitle">{title}</h3>
        <div className="author-info">
          <img src={noticeData.userProfileImageUrl || "/img/user/Group115.png"} className="profile-img" />
          <div>
            <p className="author-name">{noticeData.userName}</p>
            <p className="author-date">{new Date(noticeData.updatedAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="divider" />

        {/* 수정 모드 */}
        {isEditing && (
          <div className="edit-section">
            <input type="text" className="edit-title" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="edit-content" value={content} onChange={e => setContent(e.target.value)} />
            <input type="file" multiple onChange={handleNewFilesChange} />

            {/* 기존 파일 */}
            {noticeData.files.length > 0 && (
              <div className="file-list">
                <h4>기존 첨부파일</h4>
                <ul>
                  {noticeData.files.map(f => (
                    <li key={f.fileId}>
                      <a href={f.fileUrl} target="_blank" rel="noreferrer">{f.fileName}</a>
                      <button onClick={() => handleFileDelete(f.fileId)}>삭제</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 새 파일 */}
            {newFiles.length > 0 && (
              <div className="file-list">
                <h4>추가 파일</h4>
                <ul>
                  {newFiles.map((f, idx) => <li key={idx}>{f.name}</li>)}
                </ul>
              </div>
            )}

            <button className="save-btn" onClick={handleSave}>저장</button>
          </div>
        )}

        {/* 일반 모드 */}
        {!isEditing && (
          <>
            <p className="body-text">{content}</p>
            <div className="divider" />
            <div className="file-list">
              <h4>첨부파일</h4>
              {noticeData.files.length === 0 ? <p>없음</p> : (
                <ul>
                  {noticeData.files.map(f => (
                    <li key={f.fileId}>
                      <a href={f.fileUrl} target="_blank" rel="noreferrer">{f.fileName}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 댓글: 공지 디자인 */}
            <div className="commentList">
              {comments.map(c => (
                <div key={c.commentId} className="commentItem">
                  <img src={c.userProfileImageUrl || "/img/user/Group115.png"} className="commentProfileImg" />
                  <div className="commentBody">
                    <div className="commentMeta">
                      <span className="commentName">{c.userName}</span>
                      <span className="commentDate">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="commentText">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 댓글 입력 */}
            <div className="commentInputBox">
              <input type="text" className="commentInput" value={commentInput} onChange={e => setCommentInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCommentSubmit()} placeholder="댓글 입력..." />
              <Send size={20} className="sendIcon" onClick={handleCommentSubmit} />
            </div>
          </>
        )}
      </div>

      {/* 하단 탭 */}
      <div className="bottom-nav">
        <div className="nav-item" onClick={() => navigate("/home")}><Home size={22} /><span>홈</span></div>
        <div className="nav-item" onClick={() => navigate("/mygroup")}><Users size={22} /><span>내 그룹</span></div>
        <div className="nav-item" onClick={() => navigate("/bookmarked")}><Heart size={22} /><span>찜 목록</span></div>
        <div className="nav-item" onClick={() => navigate("/myprofile")}><Users size={22} /><span>내 정보</span></div>
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
          </div>, document.body
        )
      }
    </div>
  );
}
