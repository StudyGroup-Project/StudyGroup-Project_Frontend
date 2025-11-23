import React, { useState, useEffect, useRef } from "react";
import {
  Bell, Megaphone, FileText, Image, Users, Settings, ArrowLeft,
  Home, Heart, MessageCircle, X, Crown, Archive
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import "./groupScreen.css";

const PURPLE = "#3D348B";

export default function GroupScreen() {
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
    Access Token 포함 + 만료시 refresh 후 재시도
  ---------------------------- */
  async function authFetch(url, options = {}) {
    let token = localStorage.getItem("accessToken");

    let newOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
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

      try {
        const groupHomeData = await authFetch(
          `http://3.39.81.234:8080/api/studies/${studyId}/home`,
          { method: "GET" }
        );

        if (!groupHomeData.ok) {
          const err = await groupHomeData.json();
          
          if (err.detail === "추방된 사용자입니다.") {
            alert("강퇴당한 그룹입니다.");
            navigate(-1);
            return;
          }

          if (err.detail === "탈퇴한 사용자입니다.") {
            alert("탈퇴한 그룹입니다.");
            navigate(-1);
            return;
          }
        }

        if (groupHomeData.ok) {
          setGroupHome(await groupHomeData.json());
        }

        const resGroup = await authFetch(
          `http://3.39.81.234:8080/api/studies/${studyId}`,
          { method: "GET" }
        );
        if (resGroup.ok) {
          setGroupInfo(await resGroup.json());
        }

        const resMembers = await authFetch(
          `http://3.39.81.234:8080/api/studies/${studyId}/members`,
          { method: "GET" }
        );
        if (resMembers.ok) {
          const data = await resMembers.json();
          setMembers(data.members);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
  }, [studyId, navigate]);


  /* ---------------------------
      그룹 탈퇴 (일반 유저)
  ---------------------------- */
  async function leaveGroup() {
    if (!window.confirm("정말 그룹을 탈퇴하시겠습니까?")) return;

    try {
      const res = await authFetch(
        // 1. API 엔드포인트를 'me'로 변경
        `http://3.39.81.234:8080/api/studies/${studyId}/members/me`,
        { method: "DELETE" }
      );

      if (res.ok) { // 204 대신 .ok로 체크 (더 안전함)
        alert("그룹에서 탈퇴되었습니다.");
        navigate("/mygroup"); // 내 그룹 목록으로 이동
      } else {
        alert("그룹 탈퇴에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
    }
  }


  /* ---------------------------
      그룹 프로필 설정 이동
  ---------------------------- */
  const goGroupProfileSetting = () => navigate(`/group_profile/${studyId}`);
  const goNotice = () => navigate(`/notice/${studyId}`);
  const goAlarm = () => navigate(`/notification/${studyId}`);
  const goAssignments = () => navigate(`/assignments/${studyId}`);
  const goResources = () => navigate(`/resources/${studyId}`);

  /* ---------------------------
      오버레이 바깥 클릭 시 닫기
  ---------------------------- */
  const handleOverlayClick = (e) => {
    // overlay 바깥만 클릭했을 때 닫히도록
    if (overlayRef.current && !overlayRef.current.contains(e.target)) {
      setShowMembers(false);
    }
  };

  return (
    <div className="group-screen">
      {/* 상단 바 */}
      <div className="top-bar">
        <ArrowLeft size={24} onClick={() => navigate(`/home`)} />
        <h1>{groupHome?.title || "그룹명"}</h1>
        <div className="top-icons">
          <MessageCircle
            size={24}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/chat/${studyId}`)}
          />
          <div className="dropdown" ref={dropdownRef}>
            <Settings size={24} onClick={() => setOpen(!open)} />
            {open && (
              <div className="dropdown-menu">
                {groupInfo && groupInfo.leaderCheck ? (
                  // 1. 🟢 방장일 때 메뉴
                  <>
                    <div className="dropdown-item" onClick={deleteGroup}>
                      그룹 삭제
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={goGroupProfileSetting}>
                      그룹 프로필 설정
                    </div>
                  </>
                ) : (
                  // 2. 🔵 일반 회원일 때 메뉴
                  <div className="dropdown-item" onClick={leaveGroup}>
                    그룹 탈퇴
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메뉴 */}
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
      </div>

      {/* 탭바 */}
      <div className="tab-bar">
        <div className="tab-item" onClick={() => navigate("/home")}>
          <Home size={24} />
          <span>홈</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/mygroup")}>
          <FileText size={24} />
          <span>내 그룹</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/bookmarked")}>
          <Heart size={24} />
          <span>찜 목록</span>
        </div>
        <div className="tab-item" onClick={() => navigate("/myprofile")}>
          <Users size={24} />
          <span>내 정보</span>
        </div>
      </div>

      {/* 그룹원 오버레이 */}
      {showMembers && (
        <div className="overlay" onClick={handleOverlayClick}>
          <div
            className="overlay-content"
            ref={overlayRef}
            onClick={(e) => e.stopPropagation()} // 안쪽 클릭시 닫기 방지
          >
            <div className="overlay-header">
              <h2>그룹원</h2>
              <X
                size={24}
                onClick={() => setShowMembers(false)}
                style={{ cursor: "pointer" }}
              />
            </div>

            {members.map((member) => (
              <div key={member.userId} className="member-item">
                <div className="member-info">
                  <div className="avatar">
                    <img
                      src={member.profileImageUrl || "/img/Group 115.png"}
                      alt="프로필"
                      className="avatarImg"
                    />
                  </div>

                  <span>
                    {member.nickname}
                    {member.role === "LEADER" && (
                      <Crown size={16} color="#FFD700" fill="#FFD700" />
                    )}
                  </span>
                </div>

                <div className="member-meta">
                  <span>마지막 접속 {member.lastLoginAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
