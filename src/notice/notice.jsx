import React, { useState, useEffect } from 'react';
import { ArrowLeft, Megaphone, Home, FileText, Heart, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './notice.css';

export default function NoticeScreen() {
  const navigate = useNavigate();
  const { studyId } = useParams();   // ← URL에서 동적 studyId 받기!
  const [notices, setNotices] = useState([]);

  /* ---------------------------
      Access Token 자동 갱신
  ---------------------------- */
  async function getRefreshToken() {
    try {
      const res = await fetch("http://3.39.81.234:8080/api/auth/refresh", {
        method: "POST",
        credentials: "include",     // refreshToken은 cookie 기반!
      });

      if (!res.ok) {
        console.error("refresh 실패");
        return null;
      }

      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    } catch (err) {
      console.error("refreshToken error:", err);
      return null;
    }
  }

  /* ---------------------------
      Auth fetch 공통 처리
  ---------------------------- */
  async function authFetch(url, options = {}) {
    let accessToken = localStorage.getItem("accessToken");

    let res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 토큰 만료 → refresh
    if (res.status === 401 || res.status === 403) {
      const newToken = await getRefreshToken();
      if (!newToken) return res;

      res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
        },
      });
    }

    return res;
  }

  /* ---------------------------
      공지 목록 가져오기
  ---------------------------- */
  async function fetchNotices() {
    console.log(" NoticeScreen 렌더링됨");
    try {
      if (!studyId) {
        console.error("studyId 없음:", studyId);
        return;
      }

      const res = await authFetch(
  `http://3.39.81.234:8080/api/studies/${studyId}/announcements`,
  { method: "GET" }
);


      if (!res.ok) {
        throw new Error(`공지 목록 불러오기 실패: ${res.status}`);
      }

      const data = await res.json();
      setNotices(data);

    } catch (err) {
      console.error(err);
      alert("공지 목록 불러오기 실패!");
    }
  }

  useEffect(() => {
    fetchNotices();
  }, [studyId]);

  /* ---------------------------
      UI 렌더링
  ---------------------------- */
  return (
    <div className='noticeContainer'>
      {/* 상단 바 */}
      <div className='noticeHeader'>
        <ArrowLeft size={24} className='noticeIcon'
          onClick={() => navigate(`/groupScreenhost/${studyId}`)}
          style={{ cursor: 'pointer' }} />
          
        <h1 className='noticeTitle'>공지</h1>
        <Megaphone size={24} className='noticeIcon' style={{ visibility: 'hidden' }} />
      </div>

      {/* 공지 리스트 */}
      <div className='noticeList'>
        {notices.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 20 }}>공지가 없습니다.</div>
        ) : (
          notices.map(notice => (
            <div
              key={notice.id}
              className='noticeItem'
              onClick={() =>
                navigate(`/notice/${studyId}/${notice.id}`)  // ✔ 공지 상세 이동
              }
            >
              <Megaphone size={16} className='noticeMegaphone' />
              <span>{notice.title}</span>
            </div>
          ))
        )}
      </div>

      {/* 하단 탭바 */}
      <div className='noticeTabbar'>
        <div className='noticeTabItem' onClick={() => navigate('/home')}>
          <Home size={24} className='noticeTabIcon' /><span>홈</span>
        </div>
        <div className='noticeTabItem' onClick={() => navigate('/mygroup')}>
          <FileText size={24} className='noticeTabIcon' /><span>내 그룹</span>
        </div>
        <div className='noticeTabItem' onClick={() => navigate('/bookmarked')}>
          <Heart size={24} className='noticeTabIcon' /><span>찜 목록</span>
        </div>
        <div className='noticeTabItem' onClick={() => navigate('/myprofile')}>
          <Users size={24} className='noticeTabIcon' /><span>내 정보</span>
        </div>
      </div>
    </div>
  );
}
