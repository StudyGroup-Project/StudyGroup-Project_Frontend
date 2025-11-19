import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AssignmentsHost.css";
import { ArrowLeft, PlusCircle, Home, FileText, Heart, Users } from "lucide-react";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState("MEMBER"); // 기본 MEMBER

  const navigate = useNavigate();
  const { studyId } = useParams();
  const baseUrl = "http://3.39.81.234:8080/api/studies";

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // 그룹 정보 가져오기
        const resGroup = await fetch(`${baseUrl}/${studyId}`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (resGroup.ok) {
          const group = await resGroup.json();
          setGroupInfo(group);
        }

        // 과제 목록 가져오기
        const resAssignments = await fetch(`${baseUrl}/${studyId}/assignments`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (resAssignments.ok) {
          const list = await resAssignments.json();
          setAssignments(list);
        }

        // 내 역할 가져오기
        const resMembers = await fetch(`${baseUrl}/${studyId}/members`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        if (resMembers.ok) {
          const membersData = await resMembers.json();
          const currentUserId = parseInt(localStorage.getItem("userId"));
          const me = membersData.members.find(m => m.userId === currentUserId);
          setCurrentUserRole(me?.role || "MEMBER");
        }

      } catch (err) {
        console.error("데이터 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [studyId, navigate]);

  if (loading) return <p>로딩 중...</p>;

  const handleAddClick = () => {
    navigate(`/assignmentscreate/${studyId}`);
  };

  return (
    <div className="assignments-container">
      {/* Header */}
      <div className="assignments-header">
        <button className="header-back" onClick={() => navigate(`/groupscreenHost/${studyId}`)}>
          <ArrowLeft size={20} />
        </button>

        <span className="header-title">
          {groupInfo?.title || groupInfo?.name || "그룹명"}
        </span>

          <button className="add-button" onClick={handleAddClick}>
            <PlusCircle size={20} />
          </button>
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
              onClick={() =>
                navigate(`/assignmentsdetailhost/${studyId}/${assignment.id}`)
              }
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



