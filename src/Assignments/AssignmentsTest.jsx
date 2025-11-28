import React, { useState, useEffect } from "react";
import "./AssignmentsTest.css";
import { Home, FileText, Heart, Users, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const AssignmentsTest = () => {
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [assignmentData, setAssignmentData] = useState(null);
  const navigate = useNavigate();
  const { studyId, assignmentId, submissionId } = useParams();

  // 토큰 갱신
  const getRefreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const res = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("리프레시 토큰 갱신 실패");
      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    } catch (err) {
      console.error(err);
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
      return null;
    }
  };

  // 인증 포함 fetch
  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem("accessToken");
    let res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

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

  // 과제 정보 불러오기
  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        const url = `http://3.39.81.234:8080/api/studies/${studyId}/assignments/${assignmentId}/submissions/${submissionId}`;
        const res = await fetchWithAuth(url);

        if (!res.ok) {
          const text = await res.text();
          console.error("서버 응답:", text);
          throw new Error("과제 정보를 불러오지 못했습니다.");
        }

        const data = await res.json();
        console.log("assignmentData:", data);
        setAssignmentData(data);
      } catch (err) {
        console.error("fetchAssignmentData 에러:", err);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchAssignmentData();
  }, [studyId, assignmentId, submissionId]);

  // 평가 제출
  const handleSubmit = async () => {
    const numScore = Number(score);

    if (isNaN(numScore)|| numScore < -5 || numScore > 5) {
      alert("점수를 올바르게 선택해주세요!");
      return;
    }

    const payload = {
      content: feedback.trim() || "",
      score: Number(score),
    };

    console.log("보내는 payload:", payload);

    try {
      const url = `http://3.39.81.234:8080/api/studies/${studyId}/assignments/${assignmentId}/submissions/${assignmentData.id}/feedbacks`;
      const res = await fetchWithAuth(url, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const resText = await res.text();
      console.log("서버 응답:", resText);

      if (!res.ok) {
        throw new Error("피드백 전송 실패");
      }

      alert("피드백이 성공적으로 등록되었습니다!");
      navigate(`/assignmentslist/${studyId}/${assignmentId}/submissions/${submissionId}/feedbacks`);
    } catch (err) {
      console.error("handleSubmit 에러:", err);
      alert("피드백 전송 중 오류가 발생했습니다.");
    }
  };

  if (!assignmentData) return <div className="assignments-detail">불러오는 중...</div>;

  return (
    <div className="assignments-detail">
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#000" />
        </button>
        <span className="title">상세보기</span>
      </div>

      <div className="scroll-container">
        {/* 프로필 */}
        <div className="profile-section">
          <img
            src={assignmentData.submitterProfileUrl || "/img/Group 115.png"}
            alt="profile"
            className="profile-img"
          />
          <div className="profile-info">
            <div className="name">{assignmentData.submitterName || "이름 없음"}</div>
            <div className="time">
              {assignmentData.createAt ? new Date(assignmentData.createAt).toLocaleString() : "-"}
            </div>
          </div>
        </div>

        {/* 첨부파일 */}
        <div className="info-row">
          <p>• 첨부 파일</p>
          {assignmentData.files?.length > 0 ? (
            assignmentData.files.map((file, idx) => (
              <a
                key={idx}
                href={file.url}         
                target="_blank"         
                rel="noreferrer"
                style={{ display: "block", marginTop: "5px", color: "#007bff", textDecoration: "underline" }}
              >
                📎 {file.fileName || "파일"}
              </a>
            ))
          ) : (
            <p>첨부파일 없음</p>
          )}
        </div>

        <hr />

        {/* 과제 내용 */}
        <div className="info-row">
          <p>• 과제 내용</p>
          <textarea className="input-box" value={assignmentData.description || "내용 없음"} readOnly />
        </div>

        <hr />

        {/* 점수 선택 */}
        <div className="info-row">
          <p>• 점수 측정</p>
          <select className="input-box select-box" value={score} onChange={(e) => setScore(e.target.value)}>
            <option value="">선택</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
            <option value="0">0</option>
            <option value="-1">-1</option>
            <option value="-2">-2</option>
            <option value="-3">-3</option>
            <option value="-4">-4</option>
            <option value="-5">-5</option>
          </select>
        </div>

        <hr />

        {/* 피드백 입력 */}
        <div className="info-row">
          <p>• 피드백</p>
          <input
            type="text"
            className="input-box"
            placeholder="피드백을 입력하세요"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        {/* 평가 제출 버튼 */}
        <div className="submit-btn-wrapper">
          <button className="submit-btn" onClick={handleSubmit}>
            평가하기
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

export default AssignmentsTest;
