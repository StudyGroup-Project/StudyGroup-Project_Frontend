import React, { useState, useRef, useEffect } from "react";
import { Bell, Home, FileText, Heart, Users, X } from "lucide-react";
import "./notification.css";


const NotificationPage = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const overlayRef = useRef(null);

  const studyId = 1; // 실제 스터디 ID로 변경
  const baseUrl = "http://3.39.81.234:8080/api/studies";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("로그인이 필요합니다.");
          navigate("/login"); // 토큰 없으면 로그인 페이지 이동
        }

        const res = await fetch(`${baseUrl}/${studyId}/notifications`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("알림 목록 불러오기 실패");

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


  const fetchNotificationDetail = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const res = await fetch(`${baseUrl}/${studyId}/notifications/${notificationId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("알림 상세 불러오기 실패");

      const data = await res.json();
      setSelectedNotification(data);
    } catch (error) {
      console.error(error);
    }
  };


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
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <button className={styles.headerCloseButton}>←</button>
        <h1 className={styles.title}>알림함</h1>
      </header>

      {/* 알림 리스트 */}
      <div className={styles.notificationList}>
        {notifications.map((n) => (
          <div
            key={n.notificationId}
            className={styles.notificationItem}
            onClick={() => fetchNotificationDetail(n.notificationId)}
          >
            <Bell className={styles.icon} />
            <span>{n.title}</span>
          </div>
        ))}
      </div>

      {/* 상세 카드 모달 */}
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

            <h2 className={styles.modalTitle}>
              {selectedNotification.title}
            </h2>

            <p className={styles.modalDate}>
              발송: {selectedNotification.date}
            </p>
            <p className={styles.modalSender}>
              발신자: {selectedNotification.sender}
            </p>

            <hr className={styles.divider} />

            <div className={styles.modalContent}>
              {selectedNotification.content?.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 하단 탭바 */}
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
