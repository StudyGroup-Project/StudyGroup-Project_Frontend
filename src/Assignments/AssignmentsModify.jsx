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
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

/* Access token 갱신 */
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
    console.error("토큰 갱신 오류:", err);
  }
}

const AssignmentsModify = () => {
  const navigate = useNavigate();
  const { studyId, assignmentId } = useParams();

  const [modifiedTitle, setModifiedTitle] = useState("");
  const [modifiedContent, setModifiedContent] = useState("");
  const [modifiedFiles, setModifiedFiles] = useState([]); // 새 첨부파일
  const [existingFiles, setExistingFiles] = useState([]); // 기존 첨부파일
  const [deleteFileIds, setDeleteFileIds] = useState([]); // 삭제할 기존 파일

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

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        await getRefreshToken();

        const res = await fetch(
          `http://3.39.81.234:8080/api/studies/${studyId}/assignments/${assignmentId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          }
        );

        if (!res.ok) throw new Error("과제 상세 불러오기 실패");

        const data = await res.json();
        setModifiedTitle(data.title || "");
        setModifiedContent(data.description || "");
        setExistingFiles(data.files || []);

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

  /* 새 파일 선택 */
  const handleFileChange = (e) => {
    setModifiedFiles([...modifiedFiles, ...Array.from(e.target.files)]);
  };

  /* 새 파일 삭제 */
  const handleDeleteNewFile = (idx) => {
    const updated = [...modifiedFiles];
    updated.splice(idx, 1);
    setModifiedFiles(updated);
  };

  /* 기존 파일 삭제 (쓰레기통 클릭) */
  const handleDeleteExistingFile = (fileId) => {
    setExistingFiles(existingFiles.filter((f) => f.fileId !== fileId));
    setDeleteFileIds([...deleteFileIds, fileId]);
  };

  /* 과제 수정 (multipart) */
  const handleModifyAssignment = async () => {
    try {
      const token = localStorage.getItem("accessToken");
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
        `${modifiedStartDate.year}-${modifiedStartDate.month}-${modifiedStartDate.day}T00:00:00`
      );
      formData.append(
        "dueAt",
        `${modifiedEndDate.year}-${modifiedEndDate.month}-${modifiedEndDate.day}T23:59:59`
      );

      // 새 파일 추가
      modifiedFiles.forEach((file) => formData.append("files", file));

      // 삭제할 파일 아이디
      deleteFileIds.forEach((id) => formData.append("deleteFileIds", id));

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
        navigate(`/assignmentsdetailhost/${studyId}/${assignmentId}`);
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

        {/* 시작 / 마감 일시 */}
        <div className="info-row date-section">
          <p>• 시작 일시</p>
          <div className="date-inputs">
            <input
              type="text"
              value={modifiedStartDate.year}
              onChange={(e) =>
                setModifiedStartDate({ ...modifiedStartDate, year: e.target.value })
              }
            />
            <span>년</span>
            <input
              type="text"
              value={modifiedStartDate.month}
              onChange={(e) =>
                setModifiedStartDate({ ...modifiedStartDate, month: e.target.value })
              }
            />
            <span>월</span>
            <input
              type="text"
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

        <div className="info-row date-section">
          <p>• 마감 일시</p>
          <div className="date-inputs">
            <input
              type="text"
              value={modifiedEndDate.year}
              onChange={(e) =>
                setModifiedEndDate({ ...modifiedEndDate, year: e.target.value })
              }
            />
            <span>년</span>
            <input
              type="text"
              value={modifiedEndDate.month}
              onChange={(e) =>
                setModifiedEndDate({ ...modifiedEndDate, month: e.target.value })
              }
            />
            <span>월</span>
            <input
              type="text"
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

        <hr />

        {/* 기존 첨부파일 */}
        <div className="section">
          <p className="section-title">• 기존 첨부파일</p>
          {existingFiles.length > 0 ? (
            <ul>
              {existingFiles.map((file) => (
                <li key={file.fileId}>
                  📎 {file.fileName}{" "}
                  <Trash2
                    size={16}
                    style={{ cursor: "pointer", marginLeft: "8px" }}
                    onClick={() => handleDeleteExistingFile(file.fileId)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p>첨부파일 없음</p>
          )}
        </div>

        <hr />

        {/* 새 첨부파일 */}
        <div className="section">
          <p className="section-title">• 새 첨부파일 추가</p>
          <div className="file-input-wrapper">
            <input
              className="file-display"
              type="text"
              readOnly
              value={modifiedFiles.map((f) => f.name).join(", ")}
              placeholder="선택된 파일 없음"
            />
            <label htmlFor="file-input" className="file-upload-btn" aria-hidden>
              <Plus size={18} strokeWidth={2} />
            </label>
            <input
              id="file-input"
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {modifiedFiles.length > 0 && (
            <ul className="file-list">
              {modifiedFiles.map((file, idx) => (
                <li key={idx}>
                  {file.name}{" "}
                  <Trash2
                    size={16}
                    style={{ cursor: "pointer", marginLeft: "8px" }}
                    onClick={() => handleDeleteNewFile(idx)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 수정 버튼 */}
        <div className="submit-btn-wrapper">
          <button className="submit-btn" onClick={handleModifyAssignment}>
            수정
          </button>
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

export default AssignmentsModify;
