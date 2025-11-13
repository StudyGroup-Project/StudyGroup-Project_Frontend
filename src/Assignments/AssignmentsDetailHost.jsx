import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import "./AssignmentsDetailHost.css";
import {
  Home,
  FileText,
  Heart,
  Users,
  Plus,
  Calendar,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";

const submissionsData = [
  { name: "지민", time: "8월 28일 오후 4:23" },
  { name: "다연", time: "8월 28일 오후 4:23" },
  { name: "수현", time: "8월 28일 오후 4:23" },
];

/* 토큰 갱신 함수 */
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
    console.log("Access token 갱신 완료");
  } catch (err) {
    console.error("토큰 갱신 실패:", err);
  }
}

/* 과제 상세 데이터 가져오기 */
async function postUserData(studyId, assignmentId, token) {
  const res = await fetch(
    `http://3.39.81.234:8080/api/studies/${studyId}/assignments/${assignmentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("과제 상세 내용 가져오기 실패");
  const data = await res.json();
  return data;
}

const AssignmentsDetailHost = () => {
  const navigate = useNavigate();
  const { studyId, assignmentId } = useParams();

  const [submissionText, setSubmissionText] = useState("");
  const [file, setFile] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const [startDate, setStartDate] = useState({ year: "", month: "", day: "" });
  const [endDate, setEndDate] = useState({ year: "", month: "", day: "" });

  const [assignmentData, setAssignmentData] = useState(null);

  /* 페이지 진입 시 로그인 체크 + 과제 데이터 가져오기 */
  useEffect(() => {
    const checkLoginAndFetch = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      try {
        await getRefreshToken(); // 토큰 갱신 먼저 수행
        const data = await postUserData(studyId, assignmentId, token);
        setAssignmentData(data);
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
    };

    checkLoginAndFetch();
  }, [studyId, assignmentId, navigate]);

  const toggleMenu = () => setShowMenu((prev) => !prev);
  const goToModify = () => navigate(`/assignmentsmodify/${assignmentId}`);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  /* 과제 제출하기 */
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("description", submissionText);
      if (file) formData.append("files", file);

      const res = await fetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/assignments/${assignmentId}/submissions`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (res.ok) {
        alert("과제가 성공적으로 제출되었습니다!");
      } else {
        const errText = await res.text();
        alert("제출 실패: " + errText);
      }
    } catch (err) {
      console.error("제출 오류:", err);
      alert("제출 중 문제가 발생했습니다.");
    }
  };

  /* 과제 삭제하기 */
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/assignments/${assignmentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        alert("과제가 삭제되었습니다.");
        navigate("/assignments");
      } else {
        const errText = await res.text();
        alert("삭제 실패: " + errText);
      }
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert("삭제 중 문제가 발생했습니다.");
    } finally {
      setModalVisible(false);
    }
  };

  /* 날짜 선택 처리 */
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

  return (
    <div className="assignments-detail">
      {/* 상단 바 */}
      <div className="top-bar">
        <div className="back-btn" onClick={() => window.history.back()}>
          <ArrowLeft size={24} />
        </div>

        <div className="more-btn" onClick={toggleMenu}>
          <MoreHorizontal size={20} />
          {showMenu && (
            <div className="menu-popup">
              <div onClick={goToModify}>수정</div>
              <div onClick={() => setModalVisible(true)}>삭제</div>
            </div>
          )}
        </div>
      </div>

      {/* 메인 스크롤 영역 */}
      <div className="scroll-container">
        <div className="info-row">
          <p>• 과제 이름</p>
          <p>{assignmentData?.title || "제목 불러오는 중..."}</p>
        </div>

        {/* 시작 일시 */}
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

        {/* 마감 일시 */}
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
        <div className="info-row">
          <p>• 과제 내용</p>
          <p>{assignmentData?.description || "내용 불러오는 중..."}</p>
        </div>

        <hr />

        {/* 첨부파일 표시 */}
        <div className="info-row">
          <p>• 첨부파일 표시</p>
          {assignmentData?.files?.length
            ? assignmentData.files.map((f, i) => (
                <a key={i} href={f.url} target="_blank" rel="noreferrer">
                  {f.url}
                </a>
              ))
            : "첨부파일 없음"}
        </div>

        <hr />

        {/* 제출란 */}
        <div className="submission-section">
          <p>• 제출란</p>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="내용을 입력하세요"
          />
        </div>

        {/* 첨부 파일란 */}
        <div className="section">
          <p className="section-title">• 첨부 파일란</p>
          <div className="file-input-wrapper">
            <input
              className="file-display"
              type="text"
              readOnly
              value={file ? file.name : ""}
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
            <button className="submit-btn" onClick={handleSubmit}>
              제출
            </button>
          </div>
        </div>

        <hr />

        {/* 제출 현황 */}
        <div className="section">
          <p className="section-title">• 제출 현황</p>
          {submissionsData.map((s, i) => (
            <div key={i} className="submission-item">
              <div className="profile">
                <img src="/img/Group 115.png" alt="profile" />
                <div>
                  <div>{s.name}</div>
                  <div className="time">{s.time}</div>
                </div>
              </div>
              <div className="actions">
                <button>평가하기</button>
                <button>평가목록</button>
              </div>
            </div>
          ))}
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

      {/* 삭제 모달 */}
      {modalVisible &&
        createPortal(
          <div className="modal-overlay">
            <div className="modal">
              <p>⚠️ 삭제하시겠습니까?</p>
              <div className="modal-buttons">
                <button onClick={() => setModalVisible(false)}>취소</button>
                <button onClick={handleDelete}>삭제</button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AssignmentsDetailHost;


