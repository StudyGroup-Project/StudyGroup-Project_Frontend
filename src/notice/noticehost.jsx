import React from 'react';
import { ArrowLeft, Plus, Megaphone, Home, FileText, Heart, Users } from 'lucide-react';
import { useNavigate, useParams } from "react-router-dom";
import './notice.css';

export default function NoticeHost() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  const notices = [
    { id: 1, text: '9월 7일 UI 피드백 세션 안내' },
    { id: 2, text: '최신 UX 트렌드 자료 공유' },
    { id: 3, text: '3주차 과제: 앱 로그인 화면 리디자인' },
  ];

  return (
    <div className='noticeContainer'>
      {/* 상단 바 */}
      <div className='noticeHeader'>
        <ArrowLeft size={24} className='noticeIcon' />

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
        {notices.map(notice => (
          <div key={notice.id} className='noticeItem'>
            <Megaphone size={16} className='noticeMegaphone' />
            <span>{notice.text}</span>
          </div>
        ))}
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
