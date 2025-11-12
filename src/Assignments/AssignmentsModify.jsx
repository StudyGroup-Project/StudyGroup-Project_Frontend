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

/* ✅ Access token 갱신 */
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
    localStorage.setItem("token", data.accessToken);
    console.log("Access token 갱신 완료");
  } catch (err) {
    console.error("토큰 갱신 오류:", err);
  }
}

/* ✅ 사용자 데이터 POST */
async function postUserData() {
  try {
    const token = localStorage.getItem("token");
    const userData = { /* 필요시 유저 데이터 */ };

    const res = await fetch("http://3.39.81.234:8080/api/users/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) throw new Error("유저 데이터 전송 실패");
    console.log("유저 데이터 전송 완료");
  } catch (err) {
    console.error(err);
  }
}

const AssignmentsModify = () => {
  const navigate = useNavigate();
  const { studyId, assignmentId } = useParams();

  const [modifiedTitle, setModifiedTitle] = useState("");
  const [modifiedContent, setModifiedContent] = useState("");
  const [modifiedFile, setModifiedFile] = useState(null);

  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [modifiedStartDate, setModifiedStartDate] = useState({
    year: "",
    month: "",
    day: "",
  });
  const [modifiedEndDate, setModifiedEndDate] = useState({
    year: "",
    month: "",
    day: "",
  });

  /* ✅ 기존 과제 데이터 불러오기 */
  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        await getRefreshToken();
        await postUserData();

        const res = await fetch(
          `http://3.39.81.234:8080/api/studies/${studyId}/assignments/${assignmentId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );

        if (!res.ok) throw new Error("과제 상세 불러오기 실패");

        const data = await res.json();
        setModifiedTitle(data.title || "");
        setModifiedContent(data.description || "");

        if (data.startAt) {
          const start = new Date(data.startAt);
          setModifiedStartDate({
            year: start.getFullYear(),
            month: String(start.getMonth() + 1).padStart(2, "0"),
            day: String(start.getDate()).padStart(2, "0"),
          });
        }

        if (data.dueAt) {
          const end = new Date(data.dueAt);
          setModifiedEndDate({
            year: end.getFullYear(),
            month: String(end.getMonth() + 1).padStart(2, "0"),
            day: String(end.getDate()).padStart(2, "0"),
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAssignmentDetail();
  }, [studyId, assignmentId, navigate]);

  const handleFileChange = (e) => {
    setModifiedFile(e.target.files[0]);
  };

  /* ✅ 과제 수정 (multipart) */
  const handleModifyAssignment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("title", modifiedTitle);
      formData.append("description", modifiedContent);
      formData.append(
        "startAt",
        `${modifiedStartDate.year}-${modifiedStartDate.month}-${modifiedStartDate.day}`
      );
      formData.append(
        "dueAt",
        `${modifiedEndDate.year}-${modifiedEndDate.month}-${modifiedEndDate.day}`
      );
      if (modifiedFile) {
        formData.append("files", modifiedFile);
      }

      const res = await fetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/assignments/${assignmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (res.status === 401) {
        await getRefreshToken();
        return handleModifyAssignment(); // 재시도
      }

      if (res.status === 201 || res.status === 200) {
        alert("과제가 성공적으로 수정되었습니다!");
        navigate(`/studies/${studyId}/assignments/${assignmentId}`);
      } else {
        const errText = await res.text();
        console.error("수정 실패:", errText);
        alert("과제 수정 실패: " + errText);
      }
    } catch (err) {
      console.error("서버 오류:", err);
      alert("서버 오류가 발생했습니다.");
    }
  };

  /* ✅ 날짜 선택 */
  const handleDateSelect = (type, value) => {
    const d = new Date(value);
    const formatted = {
      year: d.getFullYear(),
      month: String(d.getMonth() + 1).padStart(2, "0"),
      day: String(d.getDate()).padStart(2, "0"),
    };
    if (type === "start") {
      setModifiedStartDate(formatted);
      setShowStartCalendar(false);
    } else {
      setModifiedEndDate(formatted);
      setShowEndCalendar(false);
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

      {/* 메인 영역 */}
      <div className="scroll-container">
        <div className="info-row">
          <p>• 과제 제목</p>
          <input
            type="text"
            value={modifiedTitle}
            onChange={(e) => setModifiedTitle(e.target.value)}
            placeholder="과제 제목을 입력하세요"
          />
        </div>
        <hr />

        {/* 시작 일시 */}
        <div className="info-row date-section">
          <p>• 시작 일시 설정</p>
          <div className="date-inputs">
            <input
              type="text"
              placeholder="YYYY"
              value={modifiedStartDate.year}
              onChange={(e) =>
                setModifiedStartDate({ ...modifiedStartDate, year: e.target.value })
              }
            />
            <span>년</span>
            <input
              type="text"
              placeholder="MM"
              value={modifiedStartDate.month}
              onChange={(e) =>
                setModifiedStartDate({ ...modifiedStartDate, month: e.target.value })
              }
            />
            <span>월</span>
            <input
              type="text"
              placeholder="DD"
              value={modifiedStartDate.day}
              onChange={(e) =>
                setModifiedStartDate({ ...modifiedStartDate, day: e.target.value })
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

        {/* 마감 일시 */}
        <div className="info-row date-section">
          <p>• 마감 일시 설정</p>
          <div className="date-inputs">
            <input
              type="text"
              placeholder="YYYY"
              value={modifiedEndDate.year}
              onChange={(e) =>
                setModifiedEndDate({ ...modifiedEndDate, year: e.target.value })
              }
            />
            <span>년</span>
            <input
              type="text"
              placeholder="MM"
              value={modifiedEndDate.month}
              onChange={(e) =>
                setModifiedEndDate({ ...modifiedEndDate, month: e.target.value })
              }
            />
            <span>월</span>
            <input
              type="text"
              placeholder="DD"
              value={modifiedEndDate.day}
              onChange={(e) =>
                setModifiedEndDate({ ...modifiedEndDate, day: e.target.value })
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

        {/* 내용 */}
        <div className="submission-section">
          <p>• 과제 내용</p>
          <textarea
            value={modifiedContent}
            onChange={(e) => setModifiedContent(e.target.value)}
            placeholder="내용을 입력하세요"
          />
        </div>

        {/* 파일 */}
        <div className="section">
          <p className="section-title">• 첨부 파일란</p>
          <div className="file-input-wrapper">
            <input
              className="file-display"
              type="text"
              readOnly
              value={modifiedFile ? modifiedFile.name : ""}
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
            <button className="submit-btn" onClick={handleModifyAssignment}>
              수정
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

export default AssignmentsModify;

