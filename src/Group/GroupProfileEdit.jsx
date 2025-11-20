import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../home/addGroup/addGroup_.css";
import HeadCount from "../home/addGroup/head_count.jsx";
import { CustomSelect } from "../home/addGroup/category_select.jsx";
import AddressSelect from "../home/addGroup/address_select.jsx";
import { provinceList, districtList } from "./../data.js";

export default function GroupProfileEdit() {
  const navigate = useNavigate();
  const { studyId } = useParams();

  const [groupData, setGroupData] = useState({
    title: "",
    maxMemberCount: 0,
    category: [],
    province: "",
    district: "",
    bio: "",
    description: "",
  });

  let EngCategory = {
        IT: 'IT', 
        사업: 'BUSINESS', 
        디자인: 'DESIGN', 
        언어: 'LANGUAGE', 
        시험: 'EXAM', 
        공부: 'ACADEMICS', 
        일상: 'LIFESTYLE', 
        기타: 'OTHER'
    }
  
  // addGroup_.jsx의 컴포넌트 호환을 위해 별도 state 유지
  const [province, setProvince] = useState(provinceList[0]);
  const [district, setDistrict] = useState(districtList[provinceList[0]][0]);

  /* ---------------------------
      Access Token 자동 갱신 함수 (groupScreenHost.jsx에서 가져옴)
  ---------------------------- */
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

  /* ---------------------------
    Access Token 포함 fetch (groupScreenHost.jsx에서 가져옴)
  ---------------------------- */
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

  /* ---------------------------
    1. (수정) 기존 그룹 정보 불러오기
  ---------------------------- */
  useEffect(() => {
    async function fetchGroupData() {
      try {
        const res = await authFetch(
          `http://3.39.81.234:8080/api/studies/${studyId}`
        );
        if (res.ok) {
          const data = await res.json();
          // 🚨 백엔드에서 주는 데이터 구조에 맞춰 setGroupData를 설정해야 합니다.
          // addGroup_.jsx의 groupData와 동일한 구조로 맞춰줍니다.
          setGroupData({
            title: data.title || "",
            maxMemberCount: data.maxMemberCount || 0,
            category: data.category || [],
            province: data.province || "",
            district: data.district || "",
            bio: data.bio || "",
            description: data.description || "", // 🚨 'description' 필드가 없으면 bio를 사용
          });
          
          // 주소 Select 컴포넌트용 state 업데이트
          setProvince(data.province || provinceList[0]);
          setDistrict(data.district || districtList[data.province || provinceList[0]][0]);
        } else {
          throw new Error("그룹 정보 로드 실패");
        }
      } catch (err) {
        console.error(err);
        alert("그룹 정보를 불러오는데 실패했습니다.");
        navigate(-1); // 이전 페이지로
      }
    }

    fetchGroupData();
  }, [studyId, navigate]);

  /* ---------------------------
    2. (수정) 그룹 정보 수정 제출
  ---------------------------- */
  async function handleUpdateGroup() {
    try {
      const res = await authFetch(
        `http://3.39.81.234:8080/api/studies/${studyId}`,
        {
          method: "PUT", // 👈 '수정'은 PUT 또는 PATCH 사용
          body: JSON.stringify(groupData),
        }
      );

      if (res.ok) {
        alert("그룹 정보가 수정되었습니다.");
        navigate(`/groupScreenhost/${studyId}`); 
      } else {
        const errData = await res.json();
        throw new Error(errData.message || "그룹 수정 실패");
      }
    } catch (err) {
      console.error("그룹 수정 실패:", err);
      alert(err.message);
    }
  }

  // 3. 폼 데이터 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 4. 주소 변경 핸들러 (AddressSelect 컴포넌트용)
  useEffect(() => {
    setGroupData((prev) => ({
      ...prev,
      province: province,
      district: district,
    }));
  }, [province, district]);


  return (
    <div className="home-background">
      <div className="addGroup-web-header">
        <button
          className="back-button"
          onClick={() => window.history.back()}
        ></button>
        {/* 💡 타이틀을 '그룹 수정'으로 변경 */}
        <h2 style={{ color: "white", margin: "auto" }}>그룹 프로필 수정</h2>
      </div>

      <div className="addGroup-container">
        <h4 className="addGroup-info">그룹명</h4>
        <div className="addGroup-box">
          <input
            className="addGroup-input"
            type="text"
            placeholder="그룹명을 입력해 주세요"
            name="title" // 👈 name 속성 추가
            value={groupData.title} // 👈 value 속성 연결
            onChange={handleChange} // 👈 onChange 핸들러 연결
          />
        </div>

        <div className="head-count-container">
          <h4 className="head-count-info">모집 인원</h4>
          <HeadCount
            headCount={groupData.maxMemberCount}
            setHeadCount={(count) => {
              setGroupData((prev) => ({
                ...prev,
                maxMemberCount: count,
              }));
            }}
          />
        </div>

        <h4 className="addGroup-info">카테고리</h4>
        {/* 🚨 CustomSelect가 value를 지원하도록 수정이 필요할 수 있습니다. */}
        <CustomSelect
          list={["IT", "사업", "디자인", "언어", "시험", "공부", "일상", "기타"]}
          selectedCategories={groupData.category} // 👈 기존 카테고리 전달
          setGroupData={setGroupData}
          EngCategory={EngCategory}
        />

        <h4 className="addGroup-info">위치</h4>
        <div className="addGroup-address-container">
          <AddressSelect
            provinceList={provinceList}
            districtList={districtList}
            province={province} // 👈 state 연결
            district={district} // 👈 state 연결
            setProvince={setProvince}
            setDistrict={setDistrict}
          />
        </div>

        <h4 className="addGroup-info-secondary">간단한 소개</h4>
        <div className="addGroup-box">
          <textarea
            className="addGroup-input"
            placeholder="간단한 소개를 입력해 주세요 (30자 이내)"
            maxLength={30}
            name="bio" // 👈 name 속성 추가
            value={groupData.bio} // 👈 value 속성 연결
            onChange={handleChange} // 👈 onChange 핸들러 연결
          />
        </div>

        <h4 className="addGroup-info-third">그룹 설명</h4>
        <div className="addGroup-box-large">
          <textarea
            className="addGroup-input-large"
            placeholder="그룹 설명을 입력해 주세요"
            name="description" // 👈 name 속성 추가
            value={groupData.description} // 👈 value 속성 연결
            onChange={handleChange} // 👈 onChange 핸들러 연결
          />
        </div>

        <div className="addGroup-button-container">
          <button className="addGroup-button" onClick={handleUpdateGroup}>
            수정 완료
          </button>
          <button className="addGroup-button" onClick={() => navigate(-1)}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}