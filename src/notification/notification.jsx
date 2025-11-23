import React, { useState, useRef, useEffect } from "react";
import { Bell, Home, FileText, Heart, Users, X, ArrowLeft } from "lucide-react";
import axios from "axios";
import './notification.css';
import { useNavigate, useParams } from "react-router-dom";

const NotificationPage = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef(null);
  const [isLeader, setIsLeader] = useState(false);

  const navigate = useNavigate();
  const { studyId } = useParams();
  const baseUrl = "http://3.39.81.234:8080/api/studies";

  /* ---------------- Access Token 재발급 ---------------- */
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

  const authorizedFetch = async (url, options = {}) => {
    let token = localStorage.getItem("accessToken") || (await getRefreshToken());
    if (!token) return null;

    let res = await fetch(url, {
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

      res = await fetch(url, {
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

  /* ---------------- 알림 목록 + 방장 여부 ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken") || (await getRefreshToken());
        if (!token) return;

       
        const groupRes = await fetch(`${baseUrl}/${studyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!groupRes.ok) throw new Error("그룹 정보 불러오기 실패");
        const groupData = await groupRes.json();
        const leader = !!groupData.leaderCheck;
        setIsLeader(leader);

        
        const notifRes = await authorizedFetch(`${baseUrl}/${studyId}/notifications`);
        if (!notifRes || !notifRes.ok) throw new Error("알림 불러오기 실패");
        const data = await notifRes.json();

      
        const filtered = data.filter((n) => {
 
          if (leader) return true; 
          return n.audienceType === "ALL_MEMBERS" ; 
        });
        setNotifications(filtered);

      } catch (err) {
        console.error(err);
        alert("알림 불러오기 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studyId]);

  /* ---------------- 알림 상세 보기 ---------------- */
  const fetchNotificationDetail = async (notificationId) => {
    try {
      const res = await authorizedFetch(
        `${baseUrl}/${studyId}/notifications/${notificationId}`
      );
      if (!res || !res.ok) throw new Error("알림 상세 불러오기 실패");
      const data = await res.json();
      setSelectedNotification(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- 모달 바깥 클릭 시 닫기 ---------------- */
  useEffect(() => {
    if (!selectedNotification) return;

    const handleClickOutside = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        setSelectedNotification(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedNotification]);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="container">
      <header className="header">
        <button className="headerCloseButton" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="title">알림함</h1>
      </header>

      <div className="notificationList">
        {notifications.length === 0 ? (
          <p>알림이 없습니다.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="notificationItem"
              onClick={() => fetchNotificationDetail(n.id)}
            >
              <Bell className="icon" />
              <span>{n.title}</span>
            </div>
          ))
        )}
      </div>

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
