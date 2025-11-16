import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Assignments.css";
import { ArrowLeft, PlusCircle, Home, FileText, Heart, Users, User } from "lucide-react";

// access token 갱신
async function getRefreshToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    const res = await fetch("http://3.39.81.234:8080/api/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("토큰 갱신 실패");

    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    console.log("Access token 갱신 완료");
  } catch (err) {
    console.error(err);
  }
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { studyId } = useParams();

  const baseUrl = "http://3.39.81.234:8080/api/studies";

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("로그인이 필요합니다.");
          setLoading(false);
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
        console.log(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="assignments-container">
      {/* Header */}
      <div className="assignments-header">
        <button className="header-back" onClick={() => navigate(`/groupscreen/${studyId}`)}>
          <ArrowLeft size={20} />
        </button>
        <span className="header-title">그룹명</span>
      </div>

      {/* 과제 리스트 */}
      <div className="assignment-list">
        {assignments.length === 0 ? (
          <p>과제가 없습니다.</p>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="assignment-item"
              onClick={() => navigate(`/assignmentsdetail/${studyId}/${assignment.id}`)}
              style={{ cursor: "pointer" }}
            >
              <span className="assignment-title">{assignment.title}</span>
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


