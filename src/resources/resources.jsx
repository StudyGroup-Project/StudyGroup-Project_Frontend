import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./resources.css";
import {
  ArrowLeft,
  PlusCircle,
  Home,
  FileText,
  Heart,
  Users,
  User,
} from "lucide-react";

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const studyId = 1; // 실제 스터디 ID로 교체 필요
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
      console.log("🔄 accessToken 재발급 성공");
    } catch (err) {
      console.error("accessToken 재발급 실패:", err.response?.data || err);
    }
  }

  // 사용자 기본 프로필 등록 (예시용)
  async function postUserData() {
    try {
      const res = await axios.post(
        "http://3.39.81.234:8080/api/users/me/profile/basic",
        {
          nickName: "tester",
          province: "대구광역시",
          district: "중구",
          birth: "2000-01-01",
          job: "학생",
          preferredCategory: "IT",
        },
        { withCredentials: true }
      );
      console.log("✅ 사용자 정보 업데이트 완료:", res.data);
    } catch (err) {
      console.error("사용자 정보 업데이트 실패:", err.response?.data || err);
    }
  }

  // 자료 목록 조회 (GET)
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        const res = await fetch(`${baseUrl}/${studyId}/resources`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
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
  }, [navigate]);

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="resources-container">
      {/* Header */}
      <div className="resources-header">
        <button className="header-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <span className="header-title">그룹명</span>

        {/* 버튼 클릭 시 access token & user data 전송 */}
        <button
          className="add-button"
          onClick={() => {
            getRefreshToken();
            postUserData();
            navigate("/resourcescreate");
          }}
        >
          <PlusCircle size={20} />
        </button>
      </div>

      {/* 자료 리스트 */}
      <div className="resource-list">
        {resources.length === 0 ? (
          <p>자료가 없습니다.</p>
        ) : (
          resources.map((res) => (
            <div key={res.id} className="resource-item">
              <span className="resource-title">
                {res.title ? res.title : "제목 없음"}
              </span>
              <div className="resource-author">
                <User size={16} />
                <span>{res.author ? res.author : "작성자 미상"}</span>
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



