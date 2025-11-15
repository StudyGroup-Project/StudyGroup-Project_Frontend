// GroupScreen.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Megaphone,
  FileText,
  Image,
  Users,
  Settings,
  ArrowLeft,
  Home,
  Heart,
  MessageCircle,
  Crown
} from 'lucide-react';
import './groupScreen.css';
import { useParams, useNavigate } from 'react-router-dom';


async function getRefreshToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    const res = await fetch("http://3.39.81.234:8080/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      // 갱신 실패 (로그아웃 필요)
      console.warn("getRefreshToken: refresh failed", res.status);
      return null;
    }

    const data = await res.json();
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      console.log("Access token 갱신 완료");
      return data.accessToken;
    }
    return null;
  } catch (err) {
    console.error("getRefreshToken error:", err);
    return null;
  }
}


async function authFetch(url, options = {}) {
  try {
    let token = localStorage.getItem("accessToken");
    const defaultHeaders = { "Content-Type": "application/json" };
    if (token) defaultHeaders.Authorization = `Bearer ${token}`;

    let res = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...(options.headers || {}) },
    });

    if (res.status === 401) {
  
      const newToken = await getRefreshToken();
      if (!newToken) {
    
        return null;
      }
 
      res = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          Authorization: `Bearer ${newToken}`,
          ...(options.headers || {}),
        },
      });
    }

    return res;
  } catch (err) {
    console.error("authFetch error:", err);
    throw err;
  }
}

export default function GroupScreen() {
  const { id: studyId } = useParams(); // route: /groupprofile/:id (user said this)
  const navigate = useNavigate();

  const [open, setOpen] = useState(false); // settings dropdown
  const [showMembers, setShowMembers] = useState(false);
  const dropdownRef = useRef(null);
  const overlayRef = useRef(null);

  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 로그인 체크: token 없으면 로그인 페이지로 이동
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // 외부 클릭 시 드롭다운 / 오버레이 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        setShowMembers(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 오버레이 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (showMembers) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showMembers]);

  // 그룹 정보 + 멤버 목록 불러오기
  useEffect(() => {
    if (!studyId) return;
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        // 1) 그룹 기본 정보
        const resInfo = await authFetch(`http://3.39.81.234:8080/api/studies/${studyId}`, { method: "GET" });
        if (!resInfo) {
          // authFetch 내부에서 토큰 만료로 login 필요 상태라면 이동
          const token = localStorage.getItem("accessToken");
          if (!token) navigate("/login");
          setLoading(false);
          return;
        }
        if (!resInfo.ok) {
          console.error("그룹 정보 조회 실패", resInfo.status);
        } else {
          const data = await resInfo.json();
          if (!mounted) return;
          setGroupInfo({
            name: data.studyName || data.name || "그룹명",
            description: data.description || "",
          });
        }

        // 2) 멤버 목록 (members 엔드포인트이거나 study response 안에 멤버 포함될 수 있음)
        // 우선 멤버 전용 엔드포인트 시도
        const resMembers = await authFetch(`http://3.39.81.234:8080/api/studies/${studyId}/members`, { method: "GET" });
        if (resMembers && resMembers.ok) {
          const mData = await resMembers.json();
          if (!mounted) return;
          setMembers(
            Array.isArray(mData) ? mData.map(m => ({
              id: m.memberId ?? m.id,
              name: m.nickname ?? m.name,
              joinedAt: m.joinedAt ?? m.createdAt ?? "",
              isOwner: !!m.isOwner,
              avatar: m.profileImageUrl ?? m.avatarUrl ?? null
            })) : []
          );
        } else {
          // 멤버 전용 엔드포인트가 없으면, study 정보 안의 members 필드 사용
          try {
            const fallback = await resInfo.json(); // might already be read; safe guard above
            const mm = fallback.members || fallback.memberList || [];
            if (Array.isArray(mm) && mm.length > 0) {
              setMembers(mm.map(m => ({
                id: m.memberId ?? m.id,
                name: m.nickname ?? m.name,
                joinedAt: m.joinedAt ?? m.createdAt ?? "",
                isOwner: !!m.isOwner,
                avatar: m.profileImageUrl ?? m.avatarUrl ?? null
              })));
            }
          } catch (e) {
            console.warn("멤버 목록 fallback 불가", e);
          }
        }
      } catch (err) {
        console.error("그룹 데이터 로드 에러:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [studyId, navigate]);

  // 그룹 탈퇴 (DELETE)
  const handleLeaveGroup = async () => {
    if (!window.confirm("정말 그룹을 탈퇴하시겠습니까?")) return;

    try {
      const res = await authFetch(`http://3.39.81.234:8080/api/studies/${studyId}/members/me`, {
        method: "DELETE"
      });

      if (!res) {
        // authFetch returned null -> probably login required
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      if (res.status === 204) {
        alert("그룹 탈퇴 성공");
        // 탈퇴 후 이동: 내 그룹 목록 등으로
        navigate("/mygroup");
      } else {
        const text = await res.text();
        console.warn("탈퇴 실패", res.status, text);
        alert("그룹 탈퇴에 실패했습니다.");
      }
    } catch (err) {
      console.error("그룹 탈퇴 에러:", err);
      alert("오류가 발생했습니다.");
    }
  };

  // 네비게이션 헬퍼 (스터디 컨텍스트 포함)
  const toNotice = () => navigate(`/groupprofile/${studyId}/notice`);
  const toNotification = () => navigate(`/groupprofile/${studyId}/notification`);
  const toAssignments = () => navigate(`/groupprofile/${studyId}/assignments`);
  const toResources = () => navigate(`/groupprofile/${studyId}/resources`);

  return (
    <div className="group-screen">
      {/* 상단 바 */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
          <ArrowLeft size={24} />
        </button>

        <h1 className="group-title">{groupInfo?.name ?? "그룹명"}</h1>

        <div className="top-icons">
          <MessageCircle size={24} onClick={() => navigate(`/groupprofile/${studyId}/chat`)} />

          <div className="dropdown" ref={dropdownRef}>
            <Settings size={24} onClick={() => setOpen(prev => !prev)} />
            {open && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={handleLeaveGroup}>그룹 탈퇴</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 로딩 표시 (간단) */}
      {loading ? (
        <div className="loading">로딩 중...</div>
      ) : (
        <>
          {/* 그룹 메뉴 */}
          <div className="group-menu">
            <div className="menu-card">
              <div className="menu-item clickable" onClick={toNotice}>
                <span>공지</span>
                <Megaphone size={16} color="#FF3B30" fill="#FF3B30" />
              </div>

              <div className="menu-item clickable" onClick={toNotification}>
                <span>알림함</span>
                <Bell size={16} color="#23D238" fill="#23D238" />
              </div>

              <div className="menu-item clickable" onClick={toAssignments}>
                <span>과제</span>
                <FileText size={16} color="#04A3FF" />
              </div>
            </div>

            <div className="menu-card">
              <div className="menu-item clickable" onClick={toResources}>
                <span>자료실</span>
                <Image size={16} />
              </div>
            </div>

            <div className="menu-card clickable" onClick={() => setShowMembers(true)}>
              <div className="menu-item">
                <span>그룹원</span>
                <Users size={16} color="#000" />
              </div>
            </div>
          </div>

          {/* 하단 탭바 */}
          <div className="tab-bar">
            <div className="tab-item" onClick={() => navigate("/")}>
              <Home size={24} />
              <span>홈</span>
            </div>
            <div className="tab-item" onClick={() => navigate("/mygroup")}>
              <FileText size={24} />
              <span>내 그룹</span>
            </div>
            <div className="tab-item" onClick={() => navigate("/favorites")}>
              <Heart size={24} />
              <span>찜 목록</span>
            </div>
            <div className="tab-item" onClick={() => navigate("/profile")}>
              <Users size={24} />
              <span>내 정보</span>
            </div>
          </div>
        </>
      )}

      {/* 그룹원 오버레이 */}
      {showMembers && (
        <div className="overlay">
          <div className="overlay-content" ref={overlayRef}>
            <div className="overlay-header">
              <h3>그룹원 ({members.length})</h3>
              <button className="close-btn" onClick={() => setShowMembers(false)}><X /></button>
            </div>

            <div className="members-list">
              {members.length === 0 ? (
                <div className="no-members">그룹원이 없습니다.</div>
              ) : (
                members.map(member => (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <div className="avatar">
                        <img
                          src={member.avatar || "/img/Group 115.png"}
                          alt={member.name}
                          className="avatarImg"
                        />
                      </div>
                      <div className="member-name-wrap">
                        <div className="member-name">
                          {member.name}
                          {member.isOwner && <Crown size={14} color="#FFD700" />}
                        </div>
                        <div className="member-joined">최초 접속 {member.joinedAt}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

