import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AssignmentsDetail.css";
import { Home, FileText, Heart, Users, Plus, ArrowLeft } from "lucide-react";

// Access token 갱신
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
    console.log("Access token 갱신 완료");
  } catch (err) {
    console.error(err);
  }
}

const AssignmentsDetail = () => {
  const { studyId, assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 로그인 체크 + 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
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

        if (!res.ok) throw new Error("과제 상세 내용 불러오기 실패");

        const data = await res.json();
        setAssignment(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studyId, assignmentId, navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    console.log("제출 내용:", submissionText);
    console.log("첨부 파일:", file);
    // TODO: 실제 제출 로직
  };

  if (loading) return <p>로딩 중...</p>;
  if (!assignment) return <p>과제 정보를 불러오지 못했습니다.</p>;

  return (
    <div className="assignments-detail">
      {/* 상단 바 */}
      <div className="top-bar">
        <div className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </div>
      </div>

      {/* 스크롤 가능한 메인 영역 */}
      <div className="scroll-container">
        <div className="content-card">
          <p>• 과제 이름: {assignment.title}</p>
          <p>• 시작 일시: {assignment.startAt}</p>
          <hr />
          <p>• 마감 일시: {assignment.dueAt}</p>
          <hr />
          <p>• 과제 내용: {assignment.description}</p>
          <hr />

          {/* 첨부파일 */}
          <div className="file-section">
            <p>• 첨부 파일</p>
            {assignment.files.map((f, i) => (
              <a key={i} href={f.url} target="_blank" rel="noopener noreferrer">
                {f.originalName || f.url.split("/").pop()}
              </a>
            ))}
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
                value={file ? file.name : ""}
              />
              <label htmlFor="file-input" className="file-upload-btn">
                <Plus size={22} strokeWidth={2} />
              </label>
              <input
                id="file-input"
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
            <button className="submit-btn" onClick={handleSubmit}>제출</button>
          </div>
          <hr />

          {/* 제출 현황 */}
          <div className="submission-status">
            <p>• 제출 현황</p>
            {assignment.submissions.map((s, i) => (
              <div key={i} className="submission-item">
                <div className="profile">
                  <img
                    src={assignment.profileUrls[i]?.profileImageUrl || "/img/Group 115.png"}
                    alt="profile"
                  />
                  <div>
                    <div>{s.submitterNickname}</div>
                    <div className="time">{new Date(s.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="actions">
                  <button className="link-btn">상세보기</button>
                  <button className="link-btn">평가목록</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 탭바 */}
      <div className="tabbar">
        <div className="tabItem active">
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

export default AssignmentsDetail;
