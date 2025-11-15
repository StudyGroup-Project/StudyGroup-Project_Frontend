import React, { useState, useEffect } from 'react';
import { ArrowLeft, Megaphone, Home, FileText, Heart, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './notice.css';

export default function NoticeScreen() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [studyId, setStudyId] = useState(1); // 실제 스터디 ID는 계정별로 받아와야 함

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

  /* ---------------------------
      Auth fetch + 401 시 refresh 재시도
  ---------------------------- */
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
      공지 목록 가져오기
  ---------------------------- */
  const fetchNotices = async () => {
    if (!studyId) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인 후 이용해주세요.");
        navigate("/login");
        return;
      }

      const res = await authFetch(`http://3.39.81.234:8080/api/studies/${studyId}/announcements`, {
        method: "GET",
      });

      if (!res.ok) throw new Error(`공지 목록 불러오기 실패: ${res.status}`);

      const data = await res.json();
      setNotices(data); // API 응답 그대로 배열로 세팅
    } catch (err) {
      console.error(err);
      alert("공지 목록 불러오기 실패!");
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [studyId]);

  return (
    <div className='noticeContainer'>
      {/* 상단 바 */}
      <div className='noticeHeader'>
        <ArrowLeft
          size={24}
          className='noticeIcon'
          onClick={() => navigate(-1)}
          style={{ cursor: 'pointer' }}
        />
        <h1 className='noticeTitle'>공지</h1>
        <Megaphone
          size={24}
          className='noticeIcon'
          style={{ visibility: 'hidden' }}
        />
      </div>

      {/* 공지 리스트 */}
      <div className='noticeList'>
        {notices.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 20 }}>공지가 없습니다.</div>
        ) : (
          notices.map(notice => (
            <div
              key={notice.AnnouncementId}
              className='noticeItem'
              onClick={() => navigate(`/notice/${notice.AnnouncementId}`, { state: { studyId } })}
              style={{ cursor: 'pointer' }}
            >
              <Megaphone size={16} className='noticeMegaphone' />
              <span>{notice.title}</span>
            </div>
          ))
        )}
      </div>

      {/* 하단 탭바 */}
      <div className='noticeTabbar'>
        <div className='noticeTabItem'><Home size={24} className='noticeTabIcon' /><span>홈</span></div>
        <div className='noticeTabItem'><FileText size={24} className='noticeTabIcon' /><span>내 그룹</span></div>
        <div className='noticeTabItem'><Heart size={24} className='noticeTabIcon' /><span>찜 목록</span></div>
        <div className='noticeTabItem'><Users size={24} className='noticeTabIcon' /><span>내 정보</span></div>
      </div>
    </div>
  );
}

