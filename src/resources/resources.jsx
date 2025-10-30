import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // React Router 훅
import "./resources.css";
import { ArrowLeft, Plus, Home, FileText, Heart, Users, User, PlusCircle } from "lucide-react";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 페이지 이동 함수

  const studyId = 1; // 실제 스터디 ID로 변경 필요
  const baseUrl = "http://3.39.81.234:8080/api/studies";

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        const res = await fetch(`${baseUrl}/${studyId}/resources`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("자료 목록 불러오기 실패");

        const data = await res.json();
        setResources(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="resources-container">
      {/* Header */}
      <div className="resources-header">
        <button className="header-back">
          <ArrowLeft size={20} />
        </button>
        <span className="header-title">그룹명</span>

        {/* Plus 버튼 클릭 시 resourcescreate 페이지로 이동 */}
        <button
          className="add-button"
          onClick={() => navigate("/resourcescreate")}
        >
          <PlusCircle size={20} />
        </button>
      </div>

      {/* 자료 리스트 */}
      <div className="resource-list">
        {resources.length === 0 ? (
          <p>자료가 없습니다.</p>
        ) : (
          resources.map((res) => (
            <div key={res.id} className="resource-item">
              <span className="resource-title">{res.title}</span>
              <div className="resource-author">
                <User size={16} />
                <span>{res.author}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tab Bar */}
      <div className="tabbar">
        <div className="tabItem"><Home size={24} /><span>홈</span></div>
        <div className="tabItem"><FileText size={24} /><span>내 그룹</span></div>
        <div className="tabItem"><Heart size={24} /><span>찜 목록</span></div>
        <div className="tabItem"><Users size={24} /><span>내 정보</span></div>
      </div>
    </div>
  );
}


