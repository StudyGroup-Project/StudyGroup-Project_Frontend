import React, { useState, useEffect } from "react";
import "./AssignmentsCreate.css";
import { Home, FileText, Heart, Users, Plus, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

/* --------------------------------------------------------------------
   Access Token 갱신 함수
-------------------------------------------------------------------- */
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
  } catch (err) {
    console.error("토큰 갱신 실패:", err);
  }
}

const AssignmentsCreate = () => {
  const navigate = useNavigate();
  const { studyId } = useParams();

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentContent, setAssignmentContent] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    getRefreshToken();
  }, [navigate]);

  /* 파일 첨부 핸들러 (다중 첨부 가능) */
  const handleFileChange = (e) => {
    setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)]);
  };

  /* 과제 생성 함수 */
  const handleCreateAssignment = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      if (!startDate || !endDate) {
        alert("시작일과 마감일을 모두 입력해주세요.");
        return;
      }

      const formData = new FormData();
      formData.append("title", assignmentTitle);
      formData.append("description", assignmentContent);

      // LocalDateTime 형식으로 변환 (T00:00:00 ~ T23:59:59)
      formData.append("startAt", `${startDate}T00:00:00`);
      formData.append("dueAt", `${endDate}T23:59:59`);

      attachedFiles.forEach((file) => formData.append("files", file));

      const res = await fetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/assignments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("서버 응답:", errText);
        alert("과제 생성 실패: " + errText);
        return;
      }

      alert("과제가 성공적으로 생성되었습니다!");
      navigate(`/assignmentshost/${studyId}`);
    } catch (err) {
      console.error("과제 생성 오류:", err);
      alert("과제 생성 중 문제가 발생했습니다.");
    }
  };

  return (
    <div className="assignments-detail">
      {/* 상단 */}
      <div className="top-bar">
        <div className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </div>
      </div>

      <div className="scroll-container">
        {/* 과제 제목 */}
        <div className="info-row">
          <p>• 과제 제목</p>
          <input
            type="text"
            value={assignmentTitle}
            onChange={(e) => setAssignmentTitle(e.target.value)}
            placeholder="과제 제목을 입력하세요"
          />
        </div>
        <hr />

        {/* 시작일 */}
        <div className="info-row date-section">
          <p>• 시작 일시</p>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <hr />

        {/* 마감일 */}
        <div className="info-row date-section">
          <p>• 마감 일시</p>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <hr />

        {/* 과제 내용 */}
        <div className="submission-section">
          <p>• 과제 내용</p>
          <textarea
            value={assignmentContent}
            onChange={(e) => setAssignmentContent(e.target.value)}
            placeholder="내용을 입력하세요"
          />
        </div>
        <hr />

        {/* 파일 첨부 */}
        <div className="section">
          <p className="section-title">• 첨부 파일</p>
          <input type="file" multiple onChange={handleFileChange} />

          {/* 선택한 파일 목록 */}
          {attachedFiles.length > 0 && (
            <ul>
              {attachedFiles.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          )}

          <div className="submit-btn-wrapper">
            <button className="submit-btn" onClick={handleCreateAssignment}>
              생성
            </button>
          </div>
        </div>
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
};

export default AssignmentsCreate;
