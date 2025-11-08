import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./assignments.css";
import { ArrowLeft, Plus, Home, FileText, Heart, Users, User } from "lucide-react";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const studyId = 1; // 실제 스터디 ID로 변경 필요
  const baseUrl = "http://3.39.81.234:8080/api/studies";

  /*useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        const res = await fetch(`${baseUrl}/${studyId}/assignments`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("과제 목록 불러오기 실패");

        const data = await res.json();
        setAssignments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  if (loading) return <p>로딩 중...</p>;
*/

  return (
    <div className="assignments-container">
      {/* Header */}
      <div className="assignments-header">
        <button className="header-back">
          <ArrowLeft size={20} />
        </button>
        <span className="header-title">그룹명</span>

        {/* Plus 버튼 클릭 시 assignmentscreate 페이지로 이동 */}
        <button
          className="add-button"
          onClick={() => navigate("/assignmentscreate")}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* 과제 리스트 */}
      <div className="assignment-list">
        {assignments.length === 0 ? (
          <p>과제가 없습니다.</p>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="assignment-item">
              <span className="assignment-title">{assignment.title}</span>
              <div className="assignment-author">
                <User size={16} />
                <span>{assignment.author}</span>
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
