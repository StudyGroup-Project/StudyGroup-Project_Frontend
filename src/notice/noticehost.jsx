import  React, { useState, useEffect }  from 'react';
import { ArrowLeft, Plus, Megaphone, Home, FileText, Heart, Users } from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";
import './notice.css';

export default function NoticeHost() {
  const navigate = useNavigate();
  const { studyId } = useParams();
  const [notices, setNotices]= useState([]);

   
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

   useEffect(() => {
      fetchNotices();
    }, [studyId]);


async function fetchNotices() {
  console.log("📌 studyId =", studyId);
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

      const result = await res.json();
      setNotices(result); // 배열만 저장

    } catch (err) {
      console.error(err);
      alert("공지 목록 불러오기 실패!");
    }
  }



  return (
    <div className='noticeContainer'>
      {/* 상단 바 */}
      <div className='noticeHeader'>
        <ArrowLeft size={24} className='noticeIcon'
          onClick={() => navigate(`/groupScreenHost/${studyId}`)}
          style={{ cursor: 'pointer' }} />

        <h1 className='noticeTitle'>공지</h1>

        {/* 플러스 버튼 클릭 시 공지 생성 페이지로 이동 */}
        <Plus
          size={24}
          className='noticeIcon'
          onClick={() => navigate(`/noticecreate/${studyId}`)}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* 공지 리스트 */}
            <div className='noticeList'>
              {notices.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: 20 }}>공지가 없습니다.</div>
              ) : (
                notices.map(notice => (
                  <div            
                     key={notice.announcementId}
                    className='noticeItem'
                    onClick={() =>
                      navigate(`/noticedetailhost/${studyId}/${notice.announcementId}`)
                    }
                  >
                    <Megaphone size={16} className='noticeMegaphone' />
                    <span>{notice.title}</span>
                  </div>
                ))
              )}
            </div>

      {/* 하단 탭바 */}
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
    </div>
  );
}
