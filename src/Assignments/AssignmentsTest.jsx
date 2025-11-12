import React, { useState, useEffect } from "react";
import "./AssignmentsTest.css";
import { Home, FileText, Heart, Users, ChevronUp, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const AssignmentsTest = () => {
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [comments, setComments] = useState([]);
  const [assignmentData, setAssignmentData] = useState(null);
  const navigate = useNavigate();
  const { studyId, assignmentId, submissionId } = useParams();

  // 토큰 갱신 함수 
  const getRefreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("리프레시 토큰 갱신 실패");
      const data = await res.json();
      localStorage.setItem("token", data.accessToken);
      return data.accessToken;
    } catch (err) {
      console.error(err);
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/login");
      return null;
    }
  };

  // API 요청 공통 함수 (자동 토큰 갱신 포함)
  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem("token");
    let res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    // 토큰 만료 시 자동 갱신
    if (res.status === 401) {
      token = await getRefreshToken();
      if (!token) return null;

      res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
    }
    return res;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다!");
      navigate("/login");
      return;
    }

    // 서버에서 과제 정보 불러오기
    const fetchAssignmentData = async () => {
      try {
        const res = await fetchWithAuth(
          `/api/studies/${studyId}/assignments/${assignmentId}/submissions/${submissionId}`
        );
        if (!res.ok) throw new Error("과제 정보를 불러오지 못했습니다.");

        const data = await res.json();
        setAssignmentData(data);
      } catch (err) {
        console.error(err);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchAssignmentData();
  }, [studyId, assignmentId, submissionId, navigate]);

  // 댓글 추가
  const handleAddComment = () => {
    if (feedback.trim() === "") return;
    setComments((prev) => [...prev, feedback]);
    setFeedback("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddComment();
    }
  };

  // 평가하기 버튼
  const handleSubmit = async () => {
    if (!score) {
      alert("점수를 선택해주세요!");
      return;
    }

    try {
      const res = await fetchWithAuth(
        `/api/studies/${studyId}/assignments/${assignmentId}/submissions/${submissionId}/feedbacks`,
        {
          method: "POST",
          body: JSON.stringify({
            content: feedback || "피드백 없음",
            score: Number(score),
          }),
        }
      );

      if (!res.ok) throw new Error("피드백 전송 실패");
      alert("피드백이 성공적으로 등록되었습니다!");
      navigate("/assignmentstestlist");
    } catch (err) {
      console.error(err);
      alert("피드백 전송 중 오류가 발생했습니다.");
    }
  };

  // 로딩 상태
  if (!assignmentData) {
    return <div className="assignments-detail">불러오는 중...</div>;
  }

  return (
    <div className="assignments-detail">
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#000" /> 
        </button>
        <span className="title">상세보기</span>
      </div>

      <div className="scroll-container">
        {/* 프로필 섹션 */}
        <div className="profile-section">
          <img src="/img/Group 115.png" alt="profile" className="profile-img" />
          <div className="profile-info">
            <div className="name">{assignmentData.userName || "이름 없음"}</div>
            <div className="time">
              {assignmentData.submittedAt
                ? new Date(assignmentData.submittedAt).toLocaleString()
                : ""}
            </div>
          </div>
        </div>

        {/* 첨부파일 */}
        <div className="info-row">
          <p>• 첨부 파일</p>
          <input
            className="input-box italic"
            value={assignmentData.fileName || "첨부파일 없음"}
            readOnly
          />
        </div>

        <hr />

        {/* 과제 내용 */}
        <div className="info-row">
          <p>• 과제 내용</p>
          <textarea
            className="input-box"
            value={assignmentData.content || "내용 없음"}
            readOnly
          />
        </div>

        <hr />

        {/* 점수 측정 */}
        <div className="info-row">
          <p>• 점수 측정</p>
          <select
            className="input-box select-box"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          >
            <option value="">선택</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>
        </div>

        {/* 피드백 입력 */}
        <div className="feedback-row">
          <input
            type="text"
            className="feedback-input"
            placeholder="피드백을 입력하세요"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <ChevronUp
            className="feedback-icon"
            onClick={handleAddComment}
            role="button"
          />
        </div>

        {/* 댓글 리스트 */}
        <div className="comment-list">
          {comments.map((comment, idx) => (
            <div key={idx} className="comment-item">
              <img src="/img/Group 115.png" alt="profile" />
              <div className="comment-text">{comment}</div>
            </div>
          ))}
        </div>

        {/* 평가하기 버튼 */}
        <div className="submit-btn-wrapper">
          <button className="submit-btn" onClick={handleSubmit}>
            평가하기
          </button>
        </div>
      </div>

      {/* 하단 탭바 */}
      <div className="tabbar">
        <div className="tabItem">
          <Home size={24} />
          <span>홈</span>
        </div>
        <div className="tabItem">
          <FileText size={24} />
          <span>내 그룹</span>
        </div>
        <div className="tabItem">
          <Heart size={24} />
          <span>찜 목록</span>
        </div>
        <div className="tabItem">
          <Users size={24} />
          <span>내 정보</span>
        </div>
      </div>
    </div>
  );
};

export default AssignmentsTest;

