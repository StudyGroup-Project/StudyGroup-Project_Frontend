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
import { getRefreshToken, postUserData } from "../api/auth";

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

  // 기존 과제 데이터 불러오기
  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        const res = await fetch(
          `/api/studies/${studyId}/assignments/${assignmentId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 401) {
          const newToken = await getRefreshToken();
          if (newToken) {
            localStorage.setItem("accessToken", newToken);
            return fetchAssignmentDetail(); // 재시도
          } else {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            navigate("/login");
            return;
          }
        }

        const data = await res.json();
        setModifiedTitle(data.title || "");
        setModifiedContent(data.content || "");
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
        console.error("과제 상세 불러오기 실패:", err);
      }
    };

    fetchAssignmentDetail();
  }, [studyId, assignmentId, navigate]);

  const handleFileChange = (e) => {
    setModifiedFile(e.target.files[0]);
  };

  // 파일 Base64 인코딩 함수 (api 명세서에 따라)
  const convertFileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // 과제 수정 API
  const handleModifyAssignment = async () => {
    try {
      let token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      let filesArray = [];
      if (modifiedFile) {
        const base64Data = await convertFileToBase64(modifiedFile);
        filesArray.push({
          fileName: modifiedFile.name,
          fileData: base64Data,
        });
      }

      const bodyData = {
        title: modifiedTitle,
        content: modifiedContent,
        startAt: `${modifiedStartDate.year}-${modifiedStartDate.month}-${modifiedStartDate.day}`,
        dueAt: `${modifiedEndDate.year}-${modifiedEndDate.month}-${modifiedEndDate.day}`,
        files: filesArray,
      };

      const res = await fetch(
        `/api/studies/${studyId}/assignments/${assignmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(bodyData),
        }
      );

      if (res.status === 401) {
        // 토큰 만료 시 refreshToken 갱신
        const newToken = await getRefreshToken();
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          return handleModifyAssignment(); // 재시도
        } else {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/login");
          return;
        }
      }

      if (res.status === 201) {
        alert("과제가 성공적으로 수정되었습니다!");
        navigate(`/studies/${studyId}/assignments/${assignmentId}`); // ✅ 상세페이지로 이동
      } else {
        const data = await res.json();
        console.error("수정 실패:", data);
        alert("과제 수정에 실패했습니다.");
      }
    } catch (err) {
      console.error("서버 오류:", err);
      alert("서버 오류가 발생했습니다.");
    }
  };

  // 날짜 선택 핸들러
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
        <div className="back-btn" onClick={() => window.history.back()}>
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
            value={modifiedTitle}
            onChange={(e) => setModifiedTitle(e.target.value)}
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
              value={modifiedStartDate.year}
              onChange={(e) =>
                setModifiedStartDate({
                  ...modifiedStartDate,
                  year: e.target.value,
                })
              }
            />
            <span>년</span>
            <input
              type="text"
              placeholder="MM"
              value={modifiedStartDate.month}
              onChange={(e) =>
                setModifiedStartDate({
                  ...modifiedStartDate,
                  month: e.target.value,
                })
              }
            />
            <span>월</span>
            <input
              type="text"
              placeholder="DD"
              value={modifiedStartDate.day}
              onChange={(e) =>
                setModifiedStartDate({
                  ...modifiedStartDate,
                  day: e.target.value,
                })
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
              value={modifiedEndDate.year}
              onChange={(e) =>
                setModifiedEndDate({
                  ...modifiedEndDate,
                  year: e.target.value,
                })
              }
            />
            <span>년</span>
            <input
              type="text"
              placeholder="MM"
              value={modifiedEndDate.month}
              onChange={(e) =>
                setModifiedEndDate({
                  ...modifiedEndDate,
                  month: e.target.value,
                })
              }
            />
            <span>월</span>
            <input
              type="text"
              placeholder="DD"
              value={modifiedEndDate.day}
              onChange={(e) =>
                setModifiedEndDate({
                  ...modifiedEndDate,
                  day: e.target.value,
                })
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
            value={modifiedContent}
            onChange={(e) => setModifiedContent(e.target.value)}
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

export default AssignmentsModify;
