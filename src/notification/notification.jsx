import React, { useState, useRef, useEffect } from "react";
import { Bell, Home, FileText, Heart, Users, X } from "lucide-react";
import axios from "axios"; // axios 추가
import "./notification.css";

const NotificationPage = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef(null);

  const studyId = 1;
  const baseUrl = "http://3.39.81.234:8080/api/studies";

  // access token 재발급 함수
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

  // 공통 fetch 함수 (토큰 만료 시 자동 갱신)
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

    // access token 만료 → 새로 받아서 재시도
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

  // 알림 목록 불러오기
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

  // 알림 상세
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

  // 바깥 클릭 시 닫기
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
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.headerCloseButton}>←</button>
        <h1 className={styles.title}>알림함</h1>
      </header>

      <div className={styles.notificationList}>
        {notifications.map((n) => (
          <div
            key={n.id}
            className={styles.notificationItem}
            onClick={() => fetchNotificationDetail(n.id)}
          >
            <Bell className={styles.icon} />
            <span>{n.title}</span>
          </div>
        ))}
      </div>

      {selectedNotification && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} ref={overlayRef}>
            <button
              aria-label="닫기"
              className={styles.modalCloseButton}
              onClick={() => setSelectedNotification(null)}
            >
              <X size={24} />
            </button>

            <h2 className={styles.modalTitle}>{selectedNotification.title}</h2>

            <p className={styles.modalDate}>
              발송:{" "}
              {new Date(selectedNotification.createdAt).toLocaleString("ko-KR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>

            <hr className={styles.divider} />

            <div className={styles.modalContent}>
              <p>{selectedNotification.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.tabbar}>
        <div className={styles.tabItem}>
          <Home size={24} />
          <span>홈</span>
        </div>
        <div className={styles.tabItem}>
          <FileText size={24} />
          <span>내 그룹</span>
        </div>
        <div className={styles.tabItem}>
          <Heart size={24} />
          <span>찜 목록</span>
        </div>
        <div className={styles.tabItem}>
          <Users size={24} />
          <span>내 정보</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
