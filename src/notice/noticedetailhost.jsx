import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Send, Home, FileText, Heart, Users } from 'lucide-react';
import './noticedetailhost.css';

export default function NoticeDetailHost() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [noticeData, setNoticeData] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  // location.state에서 studyId와 announcementId 전달
  const { studyId, announcementId } = location.state || {};

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
      localStorage.setItem("token", data.accessToken);

      return data.accessToken;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async function authFetch(url, options = {}) {
    let token = localStorage.getItem("token");
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
      로그인 체크
  ---------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인 후 이용해주세요.");
      navigate("/login");
    }
  }, []);

  /* ---------------------------
      공지 상세 가져오기
  ---------------------------- */
  const fetchNoticeDetail = async () => {
    if (!studyId || !announcementId) return;

    try {
      const res = await authFetch(`http://3.39.81.234:8080/api/studies/${studyId}/announcements/${announcementId}`, {
        method: "GET",
      });

      if (!res.ok) throw new Error(`공지 상세 불러오기 실패: ${res.status}`);

      const data = await res.json();
      setNoticeData(data);
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
      alert("공지 상세 불러오기 실패!");
    }
  };

  useEffect(() => {
    fetchNoticeDetail();
  }, [studyId, announcementId]);

  /* ---------------------------
      댓글 작성
  ---------------------------- */
  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/announcements/${announcementId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: commentInput }),
        }
      );
      if (res.status !== 201) throw new Error(`댓글 작성 실패: ${res.status}`);
      setCommentInput("");
      fetchNoticeDetail(); // 댓글 리스트 갱신
    } catch (err) {
      console.error(err);
      alert("댓글 작성 실패!");
    }
  };

  /* ---------------------------
      공지 삭제
  ---------------------------- */
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/announcements/${announcementId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error(`공지 삭제 실패: ${res.status}`);
      alert("공지 삭제 완료!");
      navigate(-1); // 목록으로 돌아가기
    } catch (err) {
      console.error(err);
      alert("공지 삭제 실패!");
    }
  };

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!noticeData) return <div style={{ textAlign: 'center', marginTop: 50 }}>로딩중...</div>;

  return (
    <div className='container'>
      {/* 상단 헤더 */}
      <div className='header'>
        <ArrowLeft size={24} className='icon' onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} />
        <h1 className='headerTitle'>상세보기</h1>

        {/* ... 아이콘 + 메뉴 */}
        <div className='menuWrapper' ref={menuRef}>
          <MoreHorizontal
            size={24}
            className='icon'
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ cursor: 'pointer' }}
          />
          {menuOpen && (
            <div className='dropdownMenu'>
              <button
                className='menuItem'
                onClick={() => navigate('/noticemodify', {
                  state: {
                    studyId,
                    announcementId,
                    currentTitle: noticeData.title,
                    currentContent: noticeData.content,
                    currentFiles: noticeData.files,
                  }
                })}
              >
                수정
              </button>
              <div className='dropdown-divider'></div>
              <button className='menuItem' onClick={handleDelete}>삭제</button>
            </div>
          )}
        </div>
      </div>

      {/* 공지 내용 */}
      <div className='noticeContent'>
        <h2 className='noticeTitle'>{noticeData.title}</h2>
        <div className='noticeMeta'>
          <div className='tabItem'>
            <img src={noticeData.userProfileImageUrl} className='tabIcon' />
          </div>
          <div className='noticeContainer'>
            <span className='noticeAuthor'>{noticeData.userName}</span>
            <span className='noticeDate'>{new Date(noticeData.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        <hr className='noticeDivider' />

        <p className='noticeText'>{noticeData.content}</p>

        {noticeData.files && noticeData.files.length > 0 && (
          <ul>
            {noticeData.files.map(file => (
              <li key={file.fileId}>
                <a href={file.fileUrl} target="_blank" rel="noreferrer">{file.fileName}</a>
              </li>
            ))}
          </ul>
        )}

        <hr className='noticeDivider' />
      </div>

      {/* 댓글 리스트 */}
      <div className='commentList'>
        {comments.map(c => (
          <div key={c.commentId} className='commentItem'>
            <div className='tabItem'>
              <img src={c.userProfileImageUrl} className='tabIcon' />
            </div>
            <div className='commentBody'>
              <div className='commentMeta'>
                <span className='commentName'>{c.userName}</span>
                <span className='commentDate'>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p className='commentText'>{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 댓글 입력창 */}
      <div className='commentInputBox'>
        <input
          type="text"
          className='commentInput'
          placeholder="댓글을 입력하세요..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
        />
        <Send size={20} className='sendIcon' onClick={handleCommentSubmit} />
      </div>

      {/* 하단 탭바 */}
      <div className='tabbar'>
        <div className='tabItem'><Home size={24} /><span>홈</span></div>
        <div className='tabItem'><FileText size={24} /><span>내 그룹</span></div>
        <div className='tabItem'><Heart size={24} /><span>찜 목록</span></div>
        <div className='tabItem'><Users size={24} /><span>내 정보</span></div>
      </div>
    </div>
  );
}



