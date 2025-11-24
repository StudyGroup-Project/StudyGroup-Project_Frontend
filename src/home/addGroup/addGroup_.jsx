import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import './../home_.css';
import './addGroup_.css';
import axios from 'axios';
import HeadCount from './head_count.jsx';
import { CustomSelect } from './category_select.jsx';
import AddressSelect from './address_select.jsx';
import { provinceList, districtList } from './../../data.js';

function addGroup() {
    let navigate = useNavigate();
    let category = ['선택안함', 'IT', '사업', '디자인', '언어', '시험', '공부', '일상',
        '기타'
    ];
    let EngCategory = {
        선택안함: "선택안함",
        IT: 'IT',
        사업: 'BUSINESS',
        디자인: 'DESIGN',
        언어: 'LANGUAGE',
        시험: 'EXAM',
        공부: 'ACADEMICS',
        일상: 'LIFESTYLE',
        기타: 'OTHER'
    };
    let [groupData, setGroupData] = useState({
        title: '',
        maxMemberCount: 0,
        category: [],
        province: '',
        district: '',
        bio: '',
        description: ''
    });
    let [province, setProvince] = useState(provinceList[0]);
    let [district, setDistrict] = useState(districtList[provinceList[0]][0]);

    useEffect(() => {
        setGroupData(prev => ({
            ...prev,
            province: province,
            district: district
        }));
    }, [province, district]);

    async function getAccessToken() {
        try {
            let res = await axios.post('http://3.39.81.234:8080/api/auth/token', {
                refreshToken: localStorage.getItem("refreshToken")
            }, { withCredentials: true });
            localStorage.setItem('accessToken', res.data.accessToken);
        }
        catch (err) {
            console.log(err);
        }
    }

    async function createGroup(data) {
        try {
            const accessToken = localStorage.getItem('accessToken');

            const res = await axios.post(
                'http://3.39.81.234:8080/api/studies',
                data,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`, // 액세스 토큰 인증
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true, // 쿠키 인증을 쓴다면 유지
                }
            );
            
            if(res.status === 200 || res.status === 201) {
                alert("그룹이 생성되었습니다.");
            }
            
        } catch (err) {
            alert("그룹 생성에 실패하였습니다.");
            console.error('그룹 생성 실패:', err.response?.data || err.message);
        }
    }

    let checkEmpty = () => {
        return (
            !groupData.title ||
            !groupData.maxMemberCount === 0 ||
            groupData.category.length === 0 ||
            groupData.province === "선택안함" ||
            !groupData.bio ||
            !groupData.description 
        )
    }

    let [isFull, setIsFull] = useState(false);

    useEffect(() => {
        let check = checkEmpty();
        if(check) setIsFull(true);
        else setIsFull(false);
    }, [groupData]);

    return (
        <div className="home-background">
            <div className='addGroup-web-header'>
                <button className='back-button' onClick={() => window.history.back()}></button>
            </div>

            <div className='addGroup-container'>
                <h4 className='addGroup-info'>그룹명</h4>
                <div className='addGroup-box' >
                    <input className='addGroup-input'
                        type='text'
                        maxLength={20}
                        placeholder='그룹명을 입력해 주세요'
                        onChange={(e) => {
                            setGroupData(prev => ({
                                ...prev,
                                title: e.target.value
                            }));
                        }}
                    />
                </div>

                <div className='head-count-container'>
                    <h4 className='head-count-info'>모집 인원</h4>
                    <HeadCount headCount={groupData.maxMemberCount} setHeadCount={(count) => {
                        setGroupData(prev => ({
                            ...prev,
                            maxMemberCount: count
                        }));
                    }} />
                </div>

                <h4 className='addGroup-info'>카테고리</h4>
                <CustomSelect EngCategory={EngCategory} list={category} setGroupData={setGroupData} />

                <h4 className='addGroup-info'>위치</h4>
                <div className='addGroup-address-container'>
                    <AddressSelect provinceList={provinceList} districtList={districtList} setProvince={setProvince} setDistrict={setDistrict} />
                </div>

                <h4 className='addGroup-info-secondary'>간단한 소개</h4>
                <div className='addGroup-box' >
                    <textarea className='addGroup-input'
                        placeholder='간단한 소개를 입력해 주세요 (30자 이내)'
                        maxLength={30}
                        onChange={(e) => {
                            setGroupData(prev => ({
                                ...prev,
                                bio: e.target.value
                            }));
                        }}
                    />
                </div>

                <h4 className='addGroup-info-third'>그룹 설명</h4>
                <div className='addGroup-box-large' >
                    <textarea className='addGroup-input-large'
                        placeholder='그룹 설명을 입력해 주세요'
                        onChange={(e) => {
                            setGroupData(prev => ({
                                ...prev,
                                description: e.target.value
                            }));
                        }}
                    />
                </div>

                <div className='addGroup-button-container'>
                    <button className='addGroup-button'
                        disabled={isFull}
                        onClick={async () => {
                            await getAccessToken();
                            await createGroup(groupData);
                            navigate('/home');
                        }}
                    >생성</button>
                    <button className='addGroup-button'
                        onClick={() => {
                            navigate('/home');
                        }}
                    >취소</button>
                </div>
            </div>
        </div>
    )
}

export default addGroup;