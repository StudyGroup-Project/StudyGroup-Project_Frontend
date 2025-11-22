// NoticeModifyHost.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, FileText, Heart, Users, ArrowLeft } from 'lucide-react';
import './noticedetailhost.css';

export default function NoticeModifyHost() {
  const navigate = useNavigate();
  const { studyId, noticeId } = useParams();

  const [noticeData, setNoticeData] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [deleteFileIds, setDeleteFileIds] = useState([]);

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
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/announcements/${noticeId}`
      );
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

  const handleNewFilesChange = e => setNewFiles(prev => [...prev, ...Array.from(e.target.files)]);
  const handleFileDelete = id => setDeleteFileIds(prev => [...prev, id]);

  if (!noticeData) return <p>로딩중...</p>;

  return (
    <div className="resource-detail-container">
      <div className="header">
        <button className="back-btn" onClick={() => navigate(`/noticedetailhost/${studyId}/${noticeId}`)}>
          <ArrowLeft size={22} />
        </button>
        <h2 className="title">공지 수정</h2>
      </div>

      {/* 수정 본문 */}
      <div className="noticeContent edit-section">
        <input type="text" className="edit-title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="edit-content" value={content} onChange={e => setContent(e.target.value)} />
        <label className="file-upload-btn">파일 추가<input type="file" multiple onChange={handleNewFilesChange} /></label>

        {noticeData.files.length > 0 &&
          <div className="file-list">
            <h4>기존 첨부파일</h4>
            <ul>
              {noticeData.files.map(f => (
                <li key={f.fileId}>
                  <a href={f.fileUrl} target="_blank" rel="noreferrer">{f.fileName}</a>
                  <button className="delete-btn" onClick={() => handleFileDelete(f.fileId)}>삭제</button>
                </li>
              ))}
            </ul>
          </div>
        }

        {newFiles.length > 0 &&
          <div className="file-list">
            <h4>추가 파일</h4>
            <ul>{newFiles.map((f, idx) => <li key={idx}>{f.name}</li>)}</ul>
          </div>
        }

        <button className="save-btn" onClick={handleSave}>저장</button>
      </div>
    </div>
  );
}
