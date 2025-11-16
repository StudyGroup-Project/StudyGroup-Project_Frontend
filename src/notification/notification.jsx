import React, { useState, useRef, useEffect } from "react";
import { Bell, Home, FileText, Heart, Users, X } from "lucide-react";
import axios from "axios";
import './notification.css';
import { useNavigate, useParams } from "react-router-dom";

const NotificationPage = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef(null);

  const navigate = useNavigate();
  const { studyId } = useParams();

  const baseUrl = "http://3.39.81.234:8080/api/studies";

  /* ----------------------------------
      시간 포맷 함수 - 상대 시간 표현
     ---------------------------------- */
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const diff = (Date.now() - date.getTime()) / 1000; // seconds

    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

    return date.toLocaleString("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /* ----------------------------------
      Access Token 재발급
     ---------------------------------- */
  const getRefreshToken = async () => {
    try {
      const cookies = document.cookie
        .split("; ")
        .reduce((acc, cur) => {
          const [key, value] = cur.split("=");
          acc[key] = value;
          return acc;
        }, {});

      const res = await axios.post(
        "http://3.39.81.234:8080/api/auth/token",
        { refreshToken: cookies.refreshToken },
        { withCredentials: true }
      );

      localStorage.setItem("accessToken", res.data.accessToken);
      return res.data.accessToken;
    } catch (err) {
      console.error("토큰 갱신 실패:", err);
      alert("로그인이 필요합니다.");
      return null;
    }
  };

  /* ----------------------------------
      공통 fetch + 토큰 자동 갱신
     ---------------------------------- */
  const authorizedFetch = async (url, options = {}) => {
    let token = localStorage.getItem("accessToken");
    if (!token) token = await getRefreshToken();
    if (!token) return null;

    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (res.status === 401) {
      token = await getRefreshToken();
      if (!token) return null;

      return await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
    }

    return res;
  };

  /* ----------------------------------
      알림 목록 불러오기
     ---------------------------------- */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await authorizedFetch(`${baseUrl}/${studyId}/notifications`, {
          method: "GET",
        });
        if (!res || !res.ok) throw new Error("알림 목록 불러오기 실패");

        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  /* ----------------------------------
      알림 상세 불러오기
     ---------------------------------- */
  const fetchNotificationDetail = async (notificationId) => {
    try {
      const res = await authorizedFetch(
        `${baseUrl}/${studyId}/notifications/${notificationId}`,
        { method: "GET" }
      );

      if (!res || !res.ok) throw new Error("알림 상세 불러오기 실패");

      const data = await res.json();
      setSelectedNotification(data);
    } catch (error) {
      console.error(error);
    }
  };

  /* ----------------------------------
      바깥 클릭 시 닫기
     ---------------------------------- */
  useEffect(() => {
    if (!selectedNotification) return;

    function handleClickOutside(event) {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        setSelectedNotification(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedNotification]);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="container">
      {/* ---------------- Header ---------------- */}
      <header className="header">
        <button className="headerCloseButton" onClick={() => navigate(-1)}>←</button>
        <h1 className="title">알림함</h1>
      </header>

      {/* ---------------- 알림 목록 ---------------- */}
      <div className="notificationList">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="notificationItem"
            onClick={() => fetchNotificationDetail(n.id)}
          >
            <Bell className="icon" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span>{n.title}</span>
              <span style={{ fontSize: "12px", marginTop: "4px" }}>
                {timeAgo(n.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* ---------------- 알림 상세 모달 ---------------- */}
      {selectedNotification && (
        <div className="modalOverlay">
          <div className="modalCard" ref={overlayRef}>
            <button
              aria-label="닫기"
              className="modalCloseButton"
              onClick={() => setSelectedNotification(null)}
            >
              <X size={22} />
            </button>

            <h2 className="modalTitle">{selectedNotification.title}</h2>

            {/* 정확한 한국식 날짜/시간 */}
            <p className="modalDate">
              발송:{" "}
                {new Date(selectedNotification.createAt).toLocaleString("ko-KR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
            </p>


            <hr className="divider" />

            <div className="modalContent">
              <p>{selectedNotification.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 하단 네비 ---------------- */}
      <div className="tabbar">
        <div className="tabItem" onClick={() => navigate("/home")}>
          <Home size={24} />
          <span>홈</span>
        </div>

        <div className="tabItem" onClick={() => navigate("/mygroup")}>
          <FileText size={24} />
          <span>내 그룹</span>
        </div>

        <div className="tabItem" onClick={() => navigate("/bookmarked")}>
          <Heart size={24} />
          <span>찜 목록</span>
        </div>

        <div className="tabItem" onClick={() => navigate("/myprofile")}>
          <Users size={24} />
          <span>내 정보</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
