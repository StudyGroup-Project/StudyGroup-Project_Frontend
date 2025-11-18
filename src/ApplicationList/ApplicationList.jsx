import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Home, FileText, Heart, Users, ArrowLeft } from "lucide-react";
import "./ApplicationList.css";

export default function ApplicationList() {
  const navigate = useNavigate();
  const { studyId, applicationId } = useParams();

  const [groupName, setGroupName] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationDetail, setApplicationDetail] = useState(null);

  /* ------------------------------------------------
        🟣 토큰 갱신 함수
  ------------------------------------------------ */
  async function getRefreshToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return null;

      const res = await fetch("http://3.39.81.234:8080/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("refresh 실패");

      const data = await res.json();
      localStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  /* ------------------------------------------------
        🟣 인증 포함 fetch
  ------------------------------------------------ */
  async function authFetch(url, options = {}) {
    let token = localStorage.getItem("accessToken");

    let newOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    };

    let res = await fetch(url, newOptions);

    if (res.status === 401) {
      const newToken = await getRefreshToken();
      if (!newToken) return res;

      newOptions.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, newOptions);
    }

    return res;
  }

  /* ------------------------------------------------
        🟣 로그인 체크
  ------------------------------------------------ */
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      alert("로그인이 필요합니다!");
      navigate("/login");
    }
  }, [navigate]);

  /* ------------------------------------------------
        🟣 그룹명 불러오기
  ------------------------------------------------ */
  useEffect(() => {
    async function fetchGroupInfo() {
      try {
        const res = await authFetch(
          `http://3.39.81.234:8080/api/studies/${studyId}/home`
        );
        const data = await res.json();
        setGroupName(data.title || "그룹명");
      } catch (err) {
        console.error(err);
        setGroupName("그룹 정보 없음");
      }
    }
    fetchGroupInfo();
  }, [studyId]);

  /* ------------------------------------------------
        🟣 지원서 목록 불러오기
  ------------------------------------------------ */
  useEffect(() => {
    async function fetchApplications() {
      try {
        const res = await authFetch(
          `http://3.39.81.234:8080/api/studies/${studyId}/applications`
        );
        const data = await res.json();

        // 📌 DTO 구조: { applications: [...] }
        setApplications(data || []);
      } catch (err) {
        console.error(err);
        alert("지원서 목록을 불러오는데 실패했습니다.");
      }
    }

    fetchApplications();
  }, [studyId]);

  /* ------------------------------------------------
        🟣 지원서 상세 정보 불러오기
  ------------------------------------------------ */
  async function fetchApplicationDetail(appId) {
    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/applications/${appId}`
      );

      const data = await res.json();
      // DTO: { content: "내용" }
      setApplicationDetail(data);
    } catch (err) {
      console.error(err);
      alert("지원서 상세 정보를 가져오지 못했습니다.");
    }
  }

  /* ------------------------------------------------
        🟣 URL 파라미터에 applicationId 있으면 자동 모달 열기
  ------------------------------------------------ */
  useEffect(() => {
    if (applicationId) {
      setSelectedApplication({ applicationId: Number(applicationId) });
      fetchApplicationDetail(applicationId);
    }
  }, [applicationId]);

  /* ------------------------------------------------
        🟣 승인 / 거절 처리
  ------------------------------------------------ */
  async function handleDecision(appId, status) {
    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}/applications/${appId}`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error("지원서 처리 실패");

      alert(status === "ACCEPTED" ? "승인되었습니다." : "거절되었습니다.");

      // 목록에서 제거
      setApplications((prev) =>
        prev.filter((app) => app.applicationId !== appId)
      );

      setSelectedApplication(null);
      setApplicationDetail(null);

      navigate(`/studies/${studyId}/applications`, { replace: true });
    } catch (err) {
      console.error(err);
      alert("지원서 처리 중 문제가 발생했습니다.");
    }
  }

  /* ------------------------------------------------
        🟣 렌더링
  ------------------------------------------------ */
  return (
    <div className="applicationListPage">
      {/* 상단 헤더 */}
      <div className="header">
        <span className="backBtn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} strokeWidth={2} />
        </span>

        <h2>{groupName}</h2>
      </div>

      {/* 지원서 목록 */}
      <div className="memberList">
        {applications.map((item) => (
          <div
            key={item.applicationId}
            className="memberItem"
            onClick={() => {
              setSelectedApplication(item);
              fetchApplicationDetail(item.applicationId);

              navigate(
                `/studies/${studyId}/applications/${item.applicationId}`,
                { replace: true }
              );
            }}
          >
            <img
              src={item.profileImageUrl}
              alt="profile"
              className="profileIcon"
            />

            <div className="memberInfo">
              <span className="name">{item.nickname}</span>

              {/* 📌 createdAt → createAt으로 수정 */}
              <span className="date">
                {new Date(item.createAt).toLocaleString("ko-KR")}
              </span>
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <p className="noMembers">신청한 멤버가 없습니다.</p>
        )}
      </div>

      {/* 지원서 상세 모달 */}
      {selectedApplication && applicationDetail && (
        <div className="overlay" onClick={() => setSelectedApplication(null)}>
          <div
            className="modalBox"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>지원서 내용</h3>

            <p className="applicationText">{applicationDetail.content}</p>

            <div className="modalBtns">
              <button
                className="approveBtn"
                onClick={() =>
                  handleDecision(selectedApplication.applicationId, "ACCEPTED")
                }
              >
                승인
              </button>

              <button
                className="rejectBtn"
                onClick={() =>
                  handleDecision(selectedApplication.applicationId, "REJECTED")
                }
              >
                거절
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 탭바 */}
      <div className="tabbar">
        <div className="tabItem" onClick={() => navigate("/home")}>
          <Home size={24} />
          <span>홈</span>
        </div>
        <div className="tabItem" onClick={() => navigate("/mygroup")}>
          <FileText size={24} />
          <span>내 그룹</span>
        </div>
        <div className="tabItem" onClick={() => navigate("/bookmarked")}>
          <Heart size={24} />
          <span>찜 목록</span>
        </div>
        <div className="tabItem" onClick={() => navigate("/myprofile")}>
          <Users size={24} />
          <span>내 정보</span>
        </div>
      </div>
    </div>
  );
}
