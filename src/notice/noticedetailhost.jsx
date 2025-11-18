import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MoreHorizontal, Send, Home, FileText, Heart, Users } from 'lucide-react';
import './noticedetailhost.css';

export default function NoticeDetailHost() {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [noticeData, setNoticeData] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("MEMBER"); // 기본 MEMBER

  const { studyId, noticeId } = useParams();

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
      로그인 체크 + 역할 확인
  ---------------------------- */
  useEffect(() => {
    async function fetchRole() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인 후 이용해주세요.");
        navigate("/login");
        return;
      }

      try {
        const roleRes = await authFetch(
          `http://3.39.81.234:8080/api/studies/${studyId}/members`,
          { method: "GET" }
        );
        if (!roleRes.ok) throw new Error("멤버 정보 불러오기 실패");
        const membersData = await roleRes.json();
        const currentUserId = parseInt(localStorage.getItem("userId"));
        const me = membersData.members.find(m => m.userId === currentUserId);
        setCurrentUserRole(me?.role || "MEMBER");
      } catch (err) {
        console.error(err);
      }
    }

    fetchRole();
  }, [studyId, navigate]);

  /* ---------------------------
      공지 상세 가져오기
  ---------------------------- */
  const fetchNoticeDetail = async () => {
    if (!studyId || !noticeId) return;

    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/announcements/${noticeId}`,
        { method: "GET" }
      );

      if (!res.ok) throw new Error("공지 상세 불러오기 실패");

      const data = await res.json();
      setNoticeData(data);
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
      alert("공지 불러오기 실패!");
    }
  };

  useEffect(() => {
    fetchNoticeDetail();
  }, [studyId, noticeId]);

  /* ---------------------------
      댓글 작성
  ---------------------------- */
  const handleCommentSubmit = async () => {
    if (!commentInput.trim()) return;
    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/announcements/${noticeId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: commentInput }),
        }
      );

      if (res.status !== 201) throw new Error("댓글 작성 실패");

      setCommentInput("");
      fetchNoticeDetail();
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
        `http://3.39.81.234:8080/api/studies/${studyId}/announcements/${noticeId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("삭제 실패");

      alert("삭제 완료!");
      navigate(`/noticehost/${studyId}`);
    } catch (err) {
      console.error(err);
      alert("삭제 실패!");
    }
  };

  /* ---------------------------
      메뉴 바깥 클릭 시 닫기
  ---------------------------- */
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!noticeData) return <div className="loading">로딩중...</div>;

  return (
    <div className="notice-detail-container">
      {/* 상단 헤더 */}
      <div className="header">
        <ArrowLeft size={24} className="icon" onClick={() => navigate(`/noticehost/${studyId}`)} />
        <h1 className="title">상세보기</h1>

      
          <div className="menuWrapper" ref={menuRef}>
            <MoreHorizontal
              size={24}
              className="icon"
              style={{ zIndex: 9999, position: "relative" }}
              onClick={() => setMenuOpen(!menuOpen)}
            />

            {menuOpen && (
              <div className="dropdownMenu">
                <button
                  className="menuItem"
                  onClick={() =>
                    navigate(`/noticemodify/${studyId}/${noticeId}`, {
                      state: {
                        studyId,
                        noticeId,
                        currentTitle: noticeData.title,
                        currentContent: noticeData.content,
                        currentFiles: noticeData.files,
                      },
                    })
                  }
                >
                  수정
                </button>

                <button className="menuItem" onClick={handleDelete}>삭제</button>
              </div>
            )}
          </div>
        
      </div>
    
      <div className="content">

        {/* 제목 */}
        <h2 className="noticeTitle">{noticeData.title}</h2>

        {/* 작성자 섹션 */}
        <div className="author-info">
          <img
            src={noticeData.userProfileImageUrl || "/img/user/Group115.png"}
            className="profile-img"
          />
          <div className="author-text">
            <p className="author-name">{noticeData.userName}</p>
            <p className="author-date">
              {new Date(noticeData.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="divider" />

        {/* 내용 */}
        <p className="noticeText">{noticeData.content}</p>

        {/* 첨부파일 */}
        {noticeData.files && noticeData.files.length > 0 && (
          <div className="file-list">
            <h4>첨부파일</h4>
            <ul>
              {noticeData.files.map((file) => (
                <li key={file.fileId}>
                  <a href={file.fileUrl} target="_blank" rel="noreferrer">
                    {file.fileName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="divider" />
      </div>

      {/* 댓글 리스트 */}
      <div className="commentList">
        {comments.map((c) => (
          <div key={c.commentId} className="commentItem">
            <img src={c.userProfileImageUrl} className="commentProfileImg" />

            <div className="commentBody">
              <div className="commentMeta">
                <span className="commentName">{c.userName}</span>
                <span className="commentDate">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="commentText">{c.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 댓글 입력창 */}
      <div className="commentInputBox">
        <input
          type="text"
          className="commentInput"
          placeholder="댓글을 입력하세요..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()}
        />

        <Send size={20} className="sendIcon" onClick={handleCommentSubmit} />
      </div>

      {/* 하단 탭바 */}
      <div className="tab-bar">
        <div className="tab-item" onClick={() => navigate("/home")}>
          <Home size={22} />
          <span>홈</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/mygroup")}>
          <FileText size={22} />
          <span>내 그룹</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/bookmarked")}>
          <Heart size={22} />
          <span>찜 목록</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/myprofile")}>
          <Users size={22} />
          <span>내 정보</span>
        </div>
      </div>

    </div>
  );
}
