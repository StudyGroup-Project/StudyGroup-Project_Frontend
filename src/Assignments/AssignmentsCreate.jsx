import React, { useState, useEffect } from "react";
import "./AssignmentsCreate.css";
import {
  Home,
  FileText,
  Heart,
  Users,
  Plus,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

/* --------------------------------------------------------------------
   🔐 Access Token 갱신 함수
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

/* --------------------------------------------------------------------
   📌 AssignmentsCreate Component
-------------------------------------------------------------------- */
const AssignmentsCreate = () => {
  const navigate = useNavigate();
  const { studyId } = useParams(); // URL에서 {studyId} 가져옴

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentContent, setAssignmentContent] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);

  const [startDate, setStartDate] = useState({ year: "", month: "", day: "" });
  const [endDate, setEndDate] = useState({ year: "", month: "", day: "" });

  /* --------------------------------------------------------------------
     로그인 확인 + refreshToken 갱신
  -------------------------------------------------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    getRefreshToken();
  }, [navigate]);

  /* --------------------------------------------------------------------
     파일 첨부 핸들러
  -------------------------------------------------------------------- */
  const handleFileChange = (e) => {
    setAttachedFile(e.target.files[0]);
  };

  /* --------------------------------------------------------------------
     날짜 선택 시 YYYY-MM-DD 형태로 분해 저장
  -------------------------------------------------------------------- */
  const handleDateSelect = (type, value) => {
    const d = new Date(value);
    const formatted = {
      year: d.getFullYear(),
      month: String(d.getMonth() + 1).padStart(2, "0"),
      day: String(d.getDate()).padStart(2, "0"),
    };
    if (type === "start") setStartDate(formatted);
    else setEndDate(formatted);
  };

  /* --------------------------------------------------------------------
     📌 과제 생성 함수 (multipart/form-data)
  -------------------------------------------------------------------- */
  const handleCreateAssignment = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      /* 날짜 유효성 체크 */
      if (!startDate.year || !startDate.month || !startDate.day) {
        alert("시작 날짜를 입력해주세요.");
        return;
      }
      if (!endDate.year || !endDate.month || !endDate.day) {
        alert("마감 날짜를 입력해주세요.");
        return;
      }

      const formData = new FormData();

      // 📌 DTO의 필드명을 그대로 append (JSON이 아니라 문자열)
      formData.append("title", assignmentTitle);
      formData.append("description", assignmentContent);

      formData.append(
        "startAt",
        `${startDate.year}-${startDate.month}-${startDate.day}T00:00:00`
      );

      formData.append(
        "dueAt",
        `${endDate.year}-${endDate.month}-${endDate.day}T23:59:59`
      );


      // 📌 파일 첨부 — files key
      if (attachedFile) {
        formData.append("files", attachedFile);
      }

      console.log("📤 전송 FormData 내용:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      const res = await fetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/assignments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // ❗ 절대 Content-Type 넣으면 안 된다 (multipart boundary 깨짐)
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ 서버 응답:", errText);
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

  /* --------------------------------------------------------------------
     📌 렌더링
  -------------------------------------------------------------------- */
  return (
    <div className="assignments-detail">
      {/* 상단 */}
      <div className="top-bar">
        <div className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </div>
      </div>

      {/* 입력 영역 */}
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

        {/* 시작 일시 */}
        <div className="info-row date-section">
          <p>• 시작 일시 설정</p>
          <input
            type="date"
            onChange={(e) => handleDateSelect("start", e.target.value)}
          />
        </div>
        <hr />

        {/* 마감 일시 */}
        <div className="info-row date-section">
          <p>• 마감 일시 설정</p>
          <input
            type="date"
            onChange={(e) => handleDateSelect("end", e.target.value)}
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

          <input type="file" onChange={handleFileChange} />

          <div className="submit-btn-wrapper">
            <button className="submit-btn" onClick={handleCreateAssignment}>
              생성
            </button>
          </div>
        </div>
      </div>

      {/* 하단 탭바 */}
      <div className="tabbar">
        <div className="tabItem">
          <Home size={20} />
          <span>홈</span>
        </div>
        <div className="tabItem">
          <FileText size={20} />
          <span>내 그룹</span>
        </div>
        <div className="tabItem">
          <Heart size={20} />
          <span>찜 목록</span>
        </div>
        <div className="tabItem">
          <Users size={20} />
          <span>내 정보</span>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsCreate;
