import React, { useEffect, useState } from "react";
import "./AssignmentsTestList.css";
import { Home, FileText, Heart, Users, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const AssignmentsTestList = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { studyId, assignmentId, submissionsId } = useParams();

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

  // 인증 포함 fetch 함수
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

  // 서버에서 평가 목록 불러오기
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다!");
      navigate("/login");
      return;
    }

    const fetchFeedbackList = async () => {
      try {
        const res = await fetchWithAuth(
          `http://3.39.81.234:8080/api/studies/${studyId}/assignments/${assignmentId}/submissions/${submissionId}feedbacks`
        );
        if (!res.ok) throw new Error("피드백 목록 불러오기 실패");

        const data = await res.json();
        setFeedbackList(data);
      } catch (err) {
        console.error(err);
        alert("목록을 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchFeedbackList();
  }, [studyId, assignmentId, submissionsId]);

  // 평가하기 화면에서 navigate()로 전달된 데이터 반영
  useEffect(() => {
    if (location.state) {
      setFeedbackList((prev) => [...prev, location.state]);
    }
  }, [location.state]);

  return (
    <div className="assignments-testlist">
      {/* 상단 */}
      <div className="top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#000" />
        </button>
        <span className="title">평가목록</span>
      </div>

      {/* 평가 리스트 */}
      <div className="feedback-list">
        {feedbackList.length === 0 ? (
          <p className="empty-text">아직 평가가 없습니다.</p>
        ) : (
          feedbackList.map((item) => (
            <div key={item.id} className="feedback-item">
              <div className="left">
                <img
                  src={item.evaluatorProfileUrl || "/img/Group 115.png"}
                  alt="profile"
                  className="profile-img"
                />
                <div>
                  <div className="name">{item.evaluatorName}</div>
                  <div className="time">
                    {item.evaluatedAt
                      ? new Date(item.evaluatedAt).toLocaleString()
                      : "날짜 없음"}
                  </div>
                  <div className="comment">{item.feedback || "-"}</div>
                </div>
              </div>
              <div className="score">{item.score >= 0 ? item.score : 0}점</div>
            </div>
          ))
        )}
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

export default AssignmentsTestList;
