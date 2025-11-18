import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./resources.css";
import { ArrowLeft, PlusCircle, Home, FileText, Heart, Users, User } from "lucide-react";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null); // 그룹 정보
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { studyId } = useParams();
  const baseUrl = "http://3.39.81.234:8080/api/studies";

  // access token 재발급
  async function getRefreshToken() {
    try {
      const res = await axios.post(
        "http://3.39.81.234:8080/api/auth/token",
        {
          refreshToken: document.cookie
            .split("; ")
            .find((row) => row.startsWith("refreshToken="))
            ?.split("=")[1],
        },
        { withCredentials: true }
      );
      localStorage.setItem("accessToken", res.data.accessToken);
    } catch (err) {
      console.error("accessToken 재발급 실패:", err.response?.data || err);
    }
  }

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        // 🔹 1. 그룹 정보 가져오기
        const groupRes = await fetch(`${baseUrl}/${studyId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (groupRes.ok) {
          const groupData = await groupRes.json();

          setGroupInfo(groupData);
        }

        // 🔹 2. 자료 목록 가져오기
        const res = await fetch(`${baseUrl}/${studyId}/resources`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();

        if (Array.isArray(data)) setResources(data);
        else console.warn("⚠️ 예상과 다른 응답 형식:", data);
      } catch (error) {
        console.error("자료 목록 불러오기 실패:", error);
        alert("자료를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [studyId, navigate]);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <button className="headerButton" onClick={() => navigate(`/groupScreenhost/${studyId}`)}>
          <ArrowLeft size={20} />
        </button>

        <span className="headerTitle">
          {groupInfo?.title || "그룹명"}
        </span>

        <button
          className="addButton"
          onClick={() => navigate(`/resourcescreate/${studyId}`)}
        >
          <PlusCircle size={20} />
        </button>
      </div>

      {/* 자료 리스트 */}
      <div className="resourceList">
        {resources.length === 0 ? (
          <p>자료가 없습니다.</p>
        ) : (
          resources.map((res, i) => (
            <div
              key={res.resourceId || i}
              className="resourceItem"
              onClick={() => {
                if (!res.resourceId) {
                  console.error("클릭된 자료의 ID가 없습니다:", res);
                  alert("유효하지 않은 자료입니다.");
                  return;
                }
                navigate(`/resourcesdetail/${studyId}/${res.resourceId}`);
              }}
            >
              <span className="resourceTitle">{res.title || "제목 없음"}</span>
              <div className="resourceAuthor">
                <User size={16} />
                <span>
                  {res.userName || "작성자 미상"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tab Bar */}
      <div className="tabbar">
        <div className="tabItem" onClick={() => navigate("/home")}>
          <Home size={24} />
          <span>홈</span>
        </div>
        <div className="tabItem" onClick={() => navigate("/group")}>
          <FileText size={24} />
          <span>내 그룹</span>
        </div>
        <div className="tabItem" onClick={() => navigate("/favorites")}>
          <Heart size={24} />
          <span>찜 목록</span>
        </div>
        <div className="tabItem" onClick={() => navigate("/profile")}>
          <Users size={24} />
          <span>내 정보</span>
        </div>
      </div>
    </div>
  );
}



