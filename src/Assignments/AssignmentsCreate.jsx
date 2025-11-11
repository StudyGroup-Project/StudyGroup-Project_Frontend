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

/* ✅ 토큰 갱신 함수 */
async function getRefreshToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return;

    const res = await fetch("http://3.39.81.234:8080/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error("토큰 갱신 실패");
    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    console.log("✅ Access token 갱신 완료");
  } catch (err) {
    console.error("❌ 토큰 갱신 실패:", err);
  }
}

const AssignmentsCreate = () => {
  const navigate = useNavigate();
  const { studyId } = useParams(); // URL에서 스터디 ID 가져옴

  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentContent, setAssignmentContent] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [startDate, setStartDate] = useState({ year: "", month: "", day: "" });
  const [endDate, setEndDate] = useState({ year: "", month: "", day: "" });

  /* ✅ 로그인 확인 + 토큰 갱신 */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    getRefreshToken();
  }, [navigate]);

  const handleFileChange = (e) => {
    setAttachedFile(e.target.files[0]);
  };

  const handleDateSelect = (type, value) => {
    const d = new Date(value);
    const formatted = {
      year: d.getFullYear(),
      month: String(d.getMonth() + 1).padStart(2, "0"),
      day: String(d.getDate()).padStart(2, "0"),
    };
    if (type === "start") {
      setStartDate(formatted);
      setShowStartCalendar(false);
    } else {
      setEndDate(formatted);
      setShowEndCalendar(false);
    }
  };

  /* ✅ 과제 생성 함수 */
  const handleCreateAssignment = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }
      
      // 백엔드 통신용 코드
      const formData = new FormData();
      formData.append("title", assignmentTitle);
      formData.append("content", assignmentContent);
      formData.append(
        "startDate",
        `${startDate.year}-${startDate.month}-${startDate.day}`
      );
      formData.append(
        "endDate",
        `${endDate.year}-${endDate.month}-${endDate.day}`
      );
      if (attachedFile) {
        formData.append("file", attachedFile);
      }

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
        if (res.status === 401) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/login");
        } else {
          const errText = await res.text();
          alert("과제 생성 실패: " + errText);
        }
        return;
      }

      alert("과제가 성공적으로 생성되었습니다!");
      navigate(`/studies/${studyId}/assignments`); // 과제 목록 페이지로 이동
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

      {/* 스크롤 영역 */}
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

        {/* 시작 일시 설정 */}
        <div className="info-row date-section">
          <p>• 시작 일시 설정</p>
          <div className="date-inputs">
            <input
              type="text"
              placeholder="YYYY"
              value={startDate.year}
              onChange={(e) =>
                setStartDate({ ...startDate, year: e.target.value })
              }
            />
            <span>년</span>
            <input
              type="text"
              placeholder="MM"
              value={startDate.month}
              onChange={(e) =>
                setStartDate({ ...startDate, month: e.target.value })
              }
            />
            <span>월</span>
            <input
              type="text"
              placeholder="DD"
              value={startDate.day}
              onChange={(e) =>
                setStartDate({ ...startDate, day: e.target.value })
              }
            />
            <span>일</span>
            <Calendar
              size={18}
              className="calendar-icon"
              onClick={() => setShowStartCalendar(!showStartCalendar)}
            />
          </div>
          {showStartCalendar && (
            <input
              type="date"
              className="mini-calendar"
              onChange={(e) => handleDateSelect("start", e.target.value)}
            />
          )}
        </div>
        <hr />

        {/* 마감 일시 설정 */}
        <div className="info-row date-section">
          <p>• 마감 일시 설정</p>
          <div className="date-inputs">
            <input
              type="text"
              placeholder="YYYY"
              value={endDate.year}
              onChange={(e) =>
                setEndDate({ ...endDate, year: e.target.value })
              }
            />
            <span>년</span>
            <input
              type="text"
              placeholder="MM"
              value={endDate.month}
              onChange={(e) =>
                setEndDate({ ...endDate, month: e.target.value })
              }
            />
            <span>월</span>
            <input
              type="text"
              placeholder="DD"
              value={endDate.day}
              onChange={(e) =>
                setEndDate({ ...endDate, day: e.target.value })
              }
            />
            <span>일</span>
            <Calendar
              size={18}
              className="calendar-icon"
              onClick={() => setShowEndCalendar(!showEndCalendar)}
            />
          </div>
          {showEndCalendar && (
            <input
              type="date"
              className="mini-calendar"
              onChange={(e) => handleDateSelect("end", e.target.value)}
            />
          )}
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

        {/* 첨부 파일 */}
        <div className="section">
          <p className="section-title">• 첨부 파일란</p>
          <div className="file-input-wrapper">
            <input
              className="file-display"
              type="text"
              readOnly
              value={attachedFile ? attachedFile.name : ""}
              placeholder=""
            />
            <label htmlFor="file-input" className="file-upload-btn" aria-hidden>
              <Plus size={18} strokeWidth={2} />
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="submit-btn-wrapper">
            <button className="submit-btn" onClick={handleCreateAssignment}>
              생성
            </button>
          </div>
        </div>
        <hr />
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

