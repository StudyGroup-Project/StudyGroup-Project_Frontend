import React from 'react';
import { ArrowLeft, Plus, Megaphone, Home, FileText, Heart, Users } from 'lucide-react';
import './notice.css';

export default function NoticeScreen() {
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
  <div className='noticeTabbar'>
    <div className='noticeTabItem'>
      <Home size={24} className='noticeTabIcon' />
      <span>홈</span>
    </div>
    <div className='noticeTabItem'>
      <FileText size={24} className='noticeTabIcon' />
      <span>내 그룹</span>
    </div>
    <div className='noticeTabItem'>
      <Heart size={24} className='noticeTabIcon' />
      <span>찜 목록</span>
    </div>
    <div className='noticeTabItem'>
      <Users size={24} className='noticeTabIcon' />
      <span>내 정보</span>
    </div>
  </div>
    </div>
  );
}
