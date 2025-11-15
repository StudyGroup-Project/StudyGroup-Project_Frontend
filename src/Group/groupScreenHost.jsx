import React, { useState, useEffect, useRef } from "react";
import {
  Bell, Megaphone, FileText, Image, Users, Settings, ArrowLeft,
  Home, Heart, MessageCircle, X, Crown, Archive
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./groupScreenHost.css";

const PURPLE = "#3D348B";

export default function GroupScreenHost() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  const [open, setOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const dropdownRef = useRef(null);
  const overlayRef = useRef(null);

  const currentUserIsOwner = true;

  /* ---------------------------
      Access Token 자동 갱신 함수
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

  /* ---------------------------
    Access Token 자동 포함 + 만료 시 refresh 재시도
  ---------------------------- */
  async function authFetch(url, options = {}) {
    let token = localStorage.getItem("accessToken");

    const newOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    };

    let res = await fetch(url, newOptions);

    // 토큰 만료 → 자동 갱신
    if (res.status === 401) {
      const newToken = await getRefreshToken();
      if (!newToken) return res;

      newOptions.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, newOptions);
    }

    return res;
  }

  /* ---------------------------
    그룹 정보 & 멤버 목록 불러오기
  ---------------------------- */
  const [groupInfo, setGroupInfo] = useState(null);
  const [groupHome, setGroupHome] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try { // /api/studies/{studyId}/home
        // 그룹 홈 데이터 가져오기
        const groupHomeData = await authFetch(
          `http://3.39.81.234:8080/api/studies/${studyId}/home`,
          { method: "GET" }
        );
        if (groupHomeData.ok) {
          setGroupHome(await groupHomeData.json());
        }

        // 그룹 정보 가져오기
        const resGroup = await authFetch(
          `http://3.39.81.234:8080/api/studies/${studyId}`,
          { method: "GET" }
        );
        if (resGroup.ok) {
          setGroupInfo(await resGroup.json());
        }

        // 그룹원 가져오기
        const resMembers = await authFetch(
          `http://3.39.81.234:8080/api/studies/${studyId}/members`,
          { method: "GET" }
        );
        if (resMembers.ok) {
          setMembers(await resMembers.json());
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, [studyId, navigate]);

  /* ---------------------------
      그룹 삭제 기능
  ---------------------------- */
  async function deleteGroup() {
    if (!window.confirm("정말 그룹을 삭제하시겠습니까?")) return;

    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}`,
        { method: "DELETE" }
      );

      if (res.status === 204) {
        alert("그룹이 삭제되었습니다.");
        navigate("/mygroups"); // 삭제 후 내 그룹 화면으로 이동
      } else {
        alert("삭제 실패");
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* ---------------------------
      멤버 추방 (방장만)
  ---------------------------- */
  async function removeMember(id) {
    if (!window.confirm("해당 멤버를 추방하시겠습니까?")) return;

    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/members/${id}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
      } else {
        alert("추방 실패");
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* ---------------------------
      그룹 프로필 설정 이동
  ---------------------------- */
  function goGroupProfileSetting() {
    navigate(`/group_profile/${studyId}`);
  }

  const goNotice = () => navigate(`/noticehost/${studyId}`);
  const goAlarm = () => navigate(`/notification/${studyId}`);
  const goAssignments = () => navigate(`/assignmentshost/${studyId}`);
  const goResources = () => navigate(`/resources/${studyId}`);
  const goApplyList = () => navigate(`/apply/${studyId}`);

  return (
    <div className="group-screen">
      {/* 상단 바 */}
      <div className="top-bar">
        <ArrowLeft size={24} onClick={() => navigate(-1)} />
        <h1>{groupHome?.title || "그룹명"}</h1>
        <div className="top-icons">
          <MessageCircle size={24} />
          <div className="dropdown" ref={dropdownRef}>
            <Settings size={24} onClick={() => setOpen(!open)} />
            {open && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={deleteGroup}>그룹 삭제</div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item" onClick={goGroupProfileSetting}>
                  그룹 프로필 설정
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 그룹 메뉴 */}
      <div className="group-menu">
        <div className="menu-card">
          <div className="menu-item" onClick={goNotice}>
            <span>공지</span>
            <Megaphone size={16} color="#FF3B30" fill="#FF3B30" />
          </div>
          <div className="menu-item" onClick={goAlarm}>
            <span>알림함</span>
            <Bell size={16} color="#23D238" fill="#23D238" />
          </div>
          <div className="menu-item" onClick={goAssignments}>
            <span>과제</span>
            <FileText size={16} color="#04A3FF" />
          </div>
        </div>

        <div className="menu-card">
          <div className="menu-item" onClick={goResources}>
            <span>자료실</span>
            <Image size={16} />
          </div>
        </div>

        <div className="menu-card clickable" onClick={() => setShowMembers(true)}>
          <div className="menu-item">
            <span>그룹원</span>
            <Users size={16} />
          </div>
        </div>

        <div className="menu-card" onClick={goApplyList}>
          <div className="menu-item">
            <span>신청함</span>
            <Archive size={16} color="#E3C12D" fill={PURPLE} />
          </div>
        </div>
      </div>

      {/* 하단 탭바 */}
      <div className="tab-bar">
        <div className="tab-item" onClick={() => navigate("/")}>
          <Home size={24} />
          <span>홈</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/mygroups")}>
          <FileText size={24} />
          <span>내 그룹</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/favorites")}>
          <Heart size={24} />
          <span>찜 목록</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/mypage")}>
          <Users size={24} />
          <span>내 정보</span>
        </div>
      </div>

      {/* 그룹원 오버레이 */}
      {showMembers && (
        <div className="overlay">
          <div className="overlay-content" ref={overlayRef}>
            {members.map(member => (
              <div key={member.id} className="member-item">
                <div className="member-info">
                  <div className="avatar">
                    <img
                      src={member.avatar || "/img/Group 115.png"}
                      alt="프로필"
                      className="avatarImg"
                    />
                  </div>

                  <span>
                    {member.name}
                    {member.isOwner && (
                      <Crown size={16} color="#FFD700" fill="#FFD700" />
                    )}
                  </span>
                </div>

                <div className="member-meta">
                  <span>최초 접속 {member.joinedAt}</span>

                  {currentUserIsOwner && !member.isOwner && (
                    <X
                      size={16}
                      color="#D03636"
                      onClick={() => removeMember(member.id)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}