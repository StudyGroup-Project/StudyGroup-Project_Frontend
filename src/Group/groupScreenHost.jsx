import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Bell, Megaphone, FileText, Image, Users, Settings, ArrowLeft,
  Home, Heart, MessageCircle, X, Crown, Archive
} from 'lucide-react';
import './groupScreenHost.css';

const PURPLE = '#3D348B';

export default function GroupScreen() {
  let { id } = useParams();
  const [open, setOpen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const dropdownRef = useRef(null);
  const overlayRef = useRef(null);

  const currentUserIsOwner = true;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        setShowMembers(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [members, setMembers] = useState([
    { id: 1, name: "지민", joinedAt: "2025.08.28", isOwner: true, avatar: null },
    { id: 2, name: "수현", joinedAt: "2025.08.29", isOwner: false, avatar: null },
    { id: 3, name: "다연", joinedAt: "2025.09.01", isOwner: false, avatar: null },
  ]);

  const removeMember = (id) => {
    setMembers(prev => prev.filter(member => member.id !== id));
  };

  return (
    <div className='group-screen'>
      {/* 상단 바 */}
      <div className='top-bar'>
        <ArrowLeft size={24} />
        <h1>그룹명</h1>
        <div className='top-icons'>
          <MessageCircle size={24} />
          <div className='dropdown' ref={dropdownRef}>
            <Settings size={24} onClick={() => setOpen(!open)} />
            {open && (
              <div className='dropdown-menu'>
                <div className='dropdown-item'>그룹 삭제</div>
                <div className='dropdown-divider'></div>
                <div className='dropdown-item'>그룹 프로필 설정</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 그룹 메뉴 */}
      <div className='group-menu'>
        <div className='menu-card'>
          <div className='menu-item'>
            <span>공지</span>
            <Megaphone size={16} color="#FF3B30" fill="#FF3B30" />

          </div>
          <div className='menu-item'>
            <span>알림함</span>
            <Bell size={16} color="#23D238" fill="#23D238" />

          </div>
          <div className='menu-item'>
            <span>과제</span>
            <FileText size={16} color="#04A3FF" />

          </div>
        </div>

        <div className='menu-card'>
          <div className='menu-item'>
            <span>자료실</span>
            <Image size={16} />
          </div>
        </div>


        <div className='menu-card clickable' onClick={() => setShowMembers(true)}>
          <div className='menu-item'>
            <span>그룹원</span>
            <Users size={16} color="#000" fill="#000" />

          </div>
        </div>


        <div className='menu-card'>
          <div className='menu-item'>
            <span>신청함</span>
            <Archive size={16} color="#E3C12D" fill={PURPLE} />

          </div>
        </div>
      </div>

      {/* 하단 탭바 */}
      <div className='tab-bar'>
        <div className='tab-item'>
          <Home size={24} />
          <span>홈</span>
        </div>
        <div className='tab-item'>
          <FileText size={24} />
          <span>내 그룹</span>
        </div>
        <div className='tab-item'>
          <Heart size={24} />
          <span>찜 목록</span>
        </div>
        <div className='tab-item'>
          <Users size={24} />
          <span>내 정보</span>
        </div>
      </div>

      {/* 그룹원 오버레이 */}
      {showMembers && (
        <div className='overlay'>
          <div className='overlay-content' ref={overlayRef}>
            {members.map(member => (
              <div key={member.id} className='member-item'>
                <div className='member-info'>
                  <div className='avatar'>
                    {member.avatar ? (
                      <img src={member.avatar} alt="프로필" className='avatarImg' />
                    ) : (
                      <img src="/Group115.png" alt="기본 프로필" className='avatarImg' />
                    )}
                  </div>
                  <span>
                    {member.name}
                    {member.isOwner && <Crown size={16} color="#FFD700" fill="#FFD700" />}
                  </span>
                </div>
                <div className='member-meta'>
                  <span>최초 접속 {member.joinedAt}</span>
                  {currentUserIsOwner && !member.isOwner && (
                    <X size={16} color="#D03636" onClick={() => removeMember(member.id)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
