import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import "./AssignmentsDetailHost.css";
import { ArrowLeft, MoreHorizontal, Plus, Home, FileText, Heart, Users } from "lucide-react";

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

/* 과제 상세 데이터 가져오기 */
async function fetchAssignmentDetail(studyId, assignmentId, token) {
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
  return res.json();
}

const AssignmentDetailHost = () => {
  const navigate = useNavigate();
  const { studyId, assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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
        const data = await fetchAssignmentDetail(studyId, assignmentId, token);
        setAssignment(data);
        console.log(data);
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      }
    };

    load();
  }, [studyId, assignmentId, navigate]);

  /* 과제 삭제 */
  const deleteAssignment = async () => {
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
        alert("삭제되었습니다.");
        navigate(`/assignments/${studyId}`);
      } else {
        alert("삭제 실패");
      }
    } catch (e) {
      console.error("삭제 오류:", e);
    }
  };

  /* ---- 제출하기 ---- */
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

  /* 날짜 포맷 */
  const f = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="assignments-detail">

      {/* 상단바 */}
      <div className="top-bar">
        <div className="back-btn" onClick={() => window.history.back()}>
          <ArrowLeft size={24} />
        </div>

        <div className="more-btn" onClick={() => setShowMenu((p) => !p)}>
          <MoreHorizontal size={20} />
          {showMenu && (
            <div className="menu-popup">
              <div onClick={() => navigate(`/assignmentsmodify/${studyId}/${assignmentId}`)}>
                수정
              </div>
              <div onClick={() => setModalVisible(true)}>삭제</div>
            </div>
          )}
        </div>
      </div>

      <div className="scroll-container" style={{ paddingBottom: "70px" }}>
        {/* 제목 */}
        <div className="info-row">
          <p>• 과제 제목</p>
          <p>{assignment?.title}</p>
        </div>

        <hr />

        {/* 내용 */}
        <div className="info-row">
          <p>• 내용</p>
          <p>{assignment?.description}</p>
        </div>

        <hr />

        {/* 시작일 */}
        <div className="info-row">
          <p>• 시작 일시</p>
          <p>{f(assignment?.startAt)}</p>
        </div>

        <hr />

        {/* 마감일 */}
        <div className="info-row">
          <p>• 마감 일시</p>
          <p>{f(assignment?.dueAt)}</p>
        </div>

        <hr />

        {/* 생성일 */}
        <div className="info-row">
          <p>• 생성 일시</p>
          <p>{f(assignment?.createAt)}</p>
        </div>

        <hr />

        {/* 첨부파일 */}
        <div className="info-row">
          <p>• 첨부파일</p>
          <div className="file-section">
            {assignment?.files?.length > 0 ? (
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

        {/* --- 방장도 제출 가능한 제출란 --- */}
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
            <button className="submit-btn" onClick={handleSubmit}>제출</button>
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

      {/* 삭제 모달 */}
      {modalVisible &&
        createPortal(
          <div className="modal-overlay">
            <div className="modal">
              <p>⚠ 정말 삭제하시겠습니까?</p>
              <div className="modal-buttons">
                <button onClick={() => setModalVisible(false)}>취소</button>
                <button onClick={deleteAssignment}>삭제</button>
              </div>
            </div>
          </div>,
          document.body
        )}

    </div>
  );
};

export default AssignmentDetailHost;

