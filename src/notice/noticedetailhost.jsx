import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreHorizontal, Send, Home, FileText, Heart, Users } from 'lucide-react';
import './noticedetailhost.css';

export default function NoticeDetailHost() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const comments = [
    { id: 1, name: '지민', date: '8월 28일 오후 4:23', text: '참석 가능합니다!' },
    { id: 2, name: '수현', date: '8월 28일 오후 4:23', text: '7시 참여 가능해요 :)' },
    { id: 3, name: '다연', date: '8월 28일 오후 4:23', text: '참석 O' },
  ];

  // 바깥 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className='container'>
      {/* 상단 헤더 */}
      <div className='header'>
        <ArrowLeft size={24} className='icon' />
        <h1 className='headerTitle'>상세보기</h1>

        {/* ... 아이콘 + 메뉴 */}
        <div className='menuWrapper' ref={menuRef}>
          <MoreHorizontal
            size={24}
            className='icon'
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <div className='dropdownMenu'>
              <button className='menuItem'>수정</button>
              <div className='dropdown-divider'></div>
              <button className='menuItem'>삭제</button>
            </div>
          )}
        </div>
      </div>

      {/* 공지 내용 */}
      <div className='noticeContent'>
        <h2 className='noticeTitle'>9월 7일 UI 피드백 세션 안내</h2>
        <div className='noticeMeta'>
          <div className='tabItem'>
            <img src="/Group115.png" className='tabIcon' />
          </div>
          <div className='noticeContainer'>
            <span className='noticeAuthor'>홍길동</span>
            <span className='noticeDate'>8월 28일 오후 4:23</span>
          </div>
        </div>

        {/* 굵은 구분선 */}
        <hr className='noticeDivider' />

        <ul className='noticePoints'>
          <li>오후 7시 Zoom 진행</li>
          <li>참석 여부 댓글 필수</li>
        </ul>
        <p className='noticeText'>
          안녕하세요, 운영진입니다. <br />
          이번 주 UI 피드백 세션은 9월 7일(화) 오후 7시, Zoom에서 진행됩니다. <br/>
          참석 여부는 9월 6일(월) 자정까지 댓글로 알려주세요.
        </p>
        <hr className='noticeDivider' />
      </div>

      {/* 댓글 리스트 */}
      <div className='commentList'>
        {comments.map(c => (
          <div key={c.id} className='commentItem'>
            <div className='tabItem'>
              <img src="/Group115.png" className='tabIcon' />
            </div>
            <div className='commentBody'>
              <div className='commentMeta'>
                <span className='commentName'>{c.name}</span>
                <span className='commentDate'>{c.date}</span>
              </div>
              <p className='commentText'>{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 댓글 입력창 */}
      <div className='commentInputBox'>
        <input
          type="text"
          className='commentInput'
          placeholder="댓글,,,"
        />
        <Send size={20} className='sendIcon' />
      </div>

      {/* 하단 탭바 */}
      <div className='tabbar'>
        <div className='tabItem'>
          <Home size={24} />
          <span>홈</span>
        </div>
        <div className='tabItem'>
          <FileText size={24} />
          <span>내 그룹</span>
        </div>
        <div className='tabItem'>
          <Heart size={24} />
          <span>찜 목록</span>
        </div>
        <div className='tabItem'>
          <Users size={24} />
          <span>내 정보</span>
        </div>
      </div>
    </div>
  );
}



