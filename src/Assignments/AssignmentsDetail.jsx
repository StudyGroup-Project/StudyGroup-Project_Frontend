import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AssignmentsDetail.css";
import { ArrowLeft, Plus, Home, FileText, Heart, Users } from "lucide-react";

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
      headers: { Authorization: `Bearer ${token}` },
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
  const [files, setFiles] = useState([]); // ✅ 다중첨부용 배열

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
    if (!submissionText && files.length === 0) {
      alert("내용 또는 파일 중 하나는 입력해야 합니다.");
      return;
    }

    const formData = new FormData();
    formData.append("description", submissionText || "");
    files.forEach((file) => formData.append("files", file)); // 다중 첨부

    try {
      const token = localStorage.getItem("accessToken");
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
      console.error(err);
      alert("제출 중 오류가 발생했습니다.");
    }
  };

  const f = (dateString) => (dateString ? new Date(dateString).toLocaleString() : "-");

  if (!assignment) return <div className="assignments-detail">불러오는 중...</div>;

  return (
    <div className="assignments-detail">
      {/* 상단바 */}
      <div className="top-bar">
        <div className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </div>
      </div>

      <div className="scroll-container" style={{ paddingBottom: "70px" }}>
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
            {assignment?.files?.length > 0 ? (
              <ul>
                {assignment.files.map((file) => (
                  <li key={file.fileId}>
                    <a href={file.url} rel="noreferrer">
                      📎 {file.fileName}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              "첨부파일 없음"
            )}
          </div>
        </div>

        <hr />

        {/* 제출란 (다중첨부) */}
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
              className="file-display"
              readOnly
              value={files.map((f) => f.name).join(", ")} // 선택한 파일 표시
            />
            <label htmlFor="file-input" className="file-upload-btn">
              <Plus size={22} />
            </label>
            <input
              id="file-input"
              type="file"
              style={{ display: "none" }}
              multiple
              onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])} // ✅ 기존 파일 유지하며 추가
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

          {assignment?.submissions?.length > 0 ? (
            assignment.submissions.map((submission) => {
              const profile = assignment.profileUrls?.find(
                (p) => p.id === submission.submitterId
              );
              const submissionId = submission.id;

              return (
                <div className="submission-item" key={submissionId}>
                  <div className="profile">
                    <img
                      src={
                        profile?.profileImageUrl && profile.profileImageUrl.trim() !== ""
                          ? profile.profileImageUrl
                          : "/img/Group 115.png"
                      }
                      alt="profile"
                    />
                    <div>
                      <div>{profile?.nickname || submission.nickname || "이름 없음"}</div>
                      <div className="time">{f(submission.createdAt)}</div>
                    </div>
                  </div>

                  <div className="actions">
                    <button
                      onClick={() =>
                        navigate(`/assignments/${studyId}/${assignmentId}/submissions/${submissionId}`)
                      }
                    >
                      평가하기
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/assignmentslist/${studyId}/${assignmentId}/submissions/${submissionId}/feedbacks`)
                      }
                    >
                      평가목록
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ marginLeft: 10 }}>제출한 사람이 없습니다.</p>
          )}
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

export default AssignmentsDetail;
