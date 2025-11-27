import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Assignments.css";
import { ArrowLeft, Home, FileText, Heart, Users } from "lucide-react";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null); 
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { studyId } = useParams();
  const baseUrl = "http://3.39.81.234:8080/api/studies";

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("로그인이 필요합니다.");
          setLoading(false);
          return;
        }

        const resGroup = await fetch(`${baseUrl}/${studyId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (resGroup.ok) {
          const groupData = await resGroup.json();
          setGroupInfo(groupData);
        }

        const resAssignments = await fetch(`${baseUrl}/${studyId}/assignments`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!resAssignments.ok) throw new Error("과제 목록 불러오기 실패");

        const assignmentsData = await resAssignments.json();
        setAssignments(assignmentsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studyId]);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="assignments-container">
      {/* Header */}
      <div className="assignments-header">
        <button className="header-back" onClick={() => navigate(`/groupscreen/${studyId}`)}>
          <ArrowLeft size={20} />
        </button>

        <span className="header-title">{groupInfo?.name || "그룹명"}</span>
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

