import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AssignmentsDetail.css";
import { ArrowLeft, Plus } from "lucide-react";

/* 토큰 갱신 */
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

/* 과제 상세 가져오기 */
async function fetchAssignmentDetail(studyId, assignmentId) {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(
    `http://3.39.81.234:8080/api/studies/${studyId}/assignments/${assignmentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("과제 상세 내용 가져오기 실패");
  return res.json();
}

const AssignmentsDetail = () => {
  const navigate = useNavigate();
  const { studyId, assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      try {
        await getRefreshToken();
        const data = await fetchAssignmentDetail(studyId, assignmentId);
        setAssignment(data);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      }
    };

    load();
  }, [studyId, assignmentId, navigate]);

  /* 제출하기 */
  const handleSubmit = async () => {
    const token = localStorage.getItem("accessToken");

    if (!submissionText && !file) {
      alert("내용 또는 파일 중 하나는 입력해야 합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("description", submissionText);
    if (file) {
      formData.append("files", file);
    }

    try {
      const res = await fetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/assignments/${assignmentId}/submissions`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("제출 실패");

      alert("제출이 완료되었습니다.");
      window.location.reload();
    } catch (err) {
      console.error("제출 실패:", err);
      alert("제출 중 오류가 발생했습니다.");
    }
  };


  const f = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  if (!assignment) {
    return <div className="assignments-detail">불러오는 중...</div>;
  }

  return (
    <div className="assignments-detail">

      {/* 상단바 */}
      <div className="top-bar">
        <div className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </div>
      </div>

      <div className="scroll-container">
        {/* 제목 */}
        <div className="info-row">
          <p>• 과제 제목</p>
          <p>{assignment.title}</p>
        </div>

        <hr />

        {/* 내용 */}
        <div className="info-row">
          <p>• 내용</p>
          <p>{assignment.description}</p>
        </div>

        <hr />

        {/* 시작일 */}
        <div className="info-row">
          <p>• 시작 일시</p>
          <p>{f(assignment.startAt)}</p>
        </div>

        <hr />

        {/* 마감일 */}
        <div className="info-row">
          <p>• 마감 일시</p>
          <p>{f(assignment.dueAt)}</p>
        </div>

        <hr />

        {/* 생성일 */}
        <div className="info-row">
          <p>• 생성 일시</p>
          <p>{f(assignment.createAt)}</p>
        </div>

        <hr />

        {/* 첨부파일 */}
        <div className="info-row">
          <p>• 첨부파일</p>
          <div className="file-section">
            {assignment.files?.length > 0 ? (
              assignment.files.map((file, i) => (
                <a key={i} href={file.url} target="_blank" rel="noreferrer">
                  📎 {file.originalName || file.url}
                </a>
              ))
            ) : (
              "첨부파일 없음"
            )}
          </div>
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

          <div className="file-input-wrapper">
            <input
              type="text"
              readOnly
              className="file-display"
              value={file ? file.name : ""}
            />
            <label htmlFor="file-input" className="file-upload-btn">
              <Plus size={22} />
            </label>
            <input
              id="file-input"
              type="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
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

          {assignment.submissions?.length > 0 ? (
            assignment.submissions.map((s) => (
              <div className="submission-item" key={s.id}>
                <div className="profile">
                  <img
                    src={s.submitterProfileUrl || "/img/Group 115.png"}
                    alt="profile"
                  />
                  <div>
                    <div>{s.submitterName || "이름 없음"}</div>
                    <div className="time">{f(s.createdAt)}</div>
                  </div>
                </div>

                <div className="actions">
                  <button
                    onClick={() =>
                      navigate(
                        `/assignments/${studyId}/${assignmentId}/submissions/${s.id}`
                      )
                    }
                  >
                    상세보기
                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        `/assignments/${studyId}/${assignmentId}/submissions/${s.id}/feedbacks`
                      )
                    }
                  >
                    평가목록
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ marginLeft: 10 }}>제출한 사람이 없습니다.</p>
          )}

        </div>
      </div>
    </div>
  );
};

export default AssignmentsDetail;
