import './my_profile.css';
import './../home/home_.css';
import './../common/CommonStyle.css';
import { useState, useRef, useEffect } from 'react';
import { HomeIcon, FileText, Heart, Users } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from 'axios';

// 신뢰점수 추가하기

function myProfile(props) {

    let [userData, setUserData] = useState({})

    async function getAccessToken() {
        try {
            const res = await axios.post('http://3.39.81.234:8080/api/auth/token', {
                refreshToken: localStorage.getItem("refreshToken")
            }, { withCredentials: true });
            localStorage.setItem('accessToken', res.data.accessToken);
        } catch (err) {
            console.log(err);
        }
    }

    async function getUserData() {
        try {
            const accessToken = localStorage.getItem("accessToken");
            const res = await axios.get('http://3.39.81.234:8080/api/users/me/profile', {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true,
            });
            setUserData(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await getAccessToken();
            await getUserData();
        };
        fetchData();
    }, []);

    let [newProfileImg, setNewProfileImg] = useState(null);
    let imgRef = useRef(null);

    async function uploadProfileImage(file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const accessToken = localStorage.getItem('accessToken');
            const res = await axios.post(
                'http://3.39.81.234:8080/api/users/me/profile/image',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                }
            );
            console.log('이미지 업로드 성공:', res.data);


        } catch (err) {
            console.error('이미지 업로드 실패:', err.response?.data || err);
        }
    }


    async function saveImgFile() {
        let file = imgRef.current.files[0];
        if (!file) return;

        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setNewProfileImg(reader.result);
        }

        try {
            await getAccessToken();
            await uploadProfileImage(file);
        } catch (err) {
            console.log("업로드 과정 중 에러", err);
        }
    }

    function getGaugeColorClass(score) {
        if (score >= 70) {
            return 'gauge-high'; // 70점 이상: 초록색
        }
        if (score >= 30) {
            return 'gauge-medium'; // 30점 ~ 69점: 주황색
        }
        return 'gauge-low'; // 30점 미만: 빨간색
    }

    async function handleLogout() {
        const accessToken = localStorage.getItem('accessToken');
        try {
            const res = await axios.post('http://3.39.81.234:8080/api/auth/logout', {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            })
        } catch (error) {

        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            alert("로그아웃이 완료되었습니다.");
            navigate("/");
        }
    }

    let navigate = useNavigate();
    let location = useLocation();
    let page = location.pathname.split('/')[1];

    let category = ['IT', 'BUSINESS', '디자인', '언어', '시험', '공부', '일상',
        '기타'
    ]

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

    let CategoryEngToKor = {
        IT: 'IT',
        BUSINESS: '사업',
        DESIGN: '디자인',
        LANGUAGE: '언어',
        EXAM: '시험',
        ACADEMICS: '공부',
        LIFESTYLE: '일상',
        OTHER: '기타'
    }

    let job = ['학생', '회사원', '프리랜서', '취업준비생', '기타']

    let EngJob = {
        학생: 'STUDENT',
        회사원: 'OFFICE_WORKER',
        프리랜서: 'FREELANCER',
        취업준비생: 'JOB_SEEKER',
        기타: 'OTHER'
    }

    let JobEngToKor = {
        STUDENT: '학생',
        OFFICE_WORKER: '회사원',
        FREELANCER: '프리랜서',
        JOB_SEEKER: '취업준비생',
        OTHER: '기타'
    }

    return (
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <h1 className='bookmarked-title-text'>내 정보</h1>
            </div>

            <div className='myprofile-container'>
                <img className='myprofileImg'
                    src={newProfileImg ? newProfileImg : userData?.profileImageUrl}
                    alt="프로필 이미지"
                />

                <label className="myprofileImg-label" htmlFor="myprofileImg">프로필 이미지 변경</label>
                <input
                    className="myprofileImg-input"
                    type="file"
                    accept="image/*"
                    id="myprofileImg"
                    ref={imgRef}
                    onChange={saveImgFile}
                />
                <>
                    <h4 className='myprofile-info'>닉네임
                        <button onClick={() => {
                            navigate('/newnickname', { state: { userData: userData } })
                        }}
                            className='myprofile-button'>
                        </button>
                    </h4>
                    <div className='myprofile-box'>
                        <h5>{userData.nickname}</h5>
                    </div>
                    <h4 className='myprofile-info'>주소
                        <button onClick={() => {
                            navigate('/newaddress', { state: { userData: userData } })
                        }}
                            className='myprofile-button'>
                        </button>
                    </h4>
                    <div className='myprofile-box'>
                        <h5>{userData.province} {userData.district}</h5>
                    </div>
                </>
                <>
                    <h4 className='myprofile-info'>생년월일
                    </h4>
                    <div className='myprofile-box'>
                        <h5>{userData.birthDate?.split('-')[0]
                            + '. ' + userData.birthDate?.split('-')[1]
                            + '. ' + userData.birthDate?.split('-')[2]}</h5>
                    </div>
                </>
                <>
                    <h4 className='myprofile-info'>직업
                        <button onClick={() => {
                            navigate('/newjob', { state: { userData: userData } })
                        }}
                            className='myprofile-button'></button>
                    </h4>
                    <div className='myprofile-box'>
                        <h5>{JobEngToKor[userData.job]}</h5>
                    </div>
                </>
                <>
                    <h4 className='myprofile-info'>선호 카테고리
                        <button onClick={() => {
                            navigate('/newcategory', { state: { userData: userData } })
                        }}
                            className='myprofile-button'></button>
                    </h4>
                    <Category category={userData.preferredCategory || []} CategoryEngToKor={CategoryEngToKor} ></Category>
                </>
                <>
                    <h4 className='myprofile-info' style={{ marginTop: '20px' }}>신뢰점수</h4>
                    <div className='myprofile-gauge-box'>
                        <div className="trust-score-label">
                            <span className="score-value">{userData.trustScore || 0}점</span>
                        </div>
                        <div className="gauge-background">
                            <div
                                className={`gauge-bar ${getGaugeColorClass(userData.trustScore || 0)}`}
                                style={{ width: `${userData.trustScore || 0}%` }}
                            >
                            </div>
                        </div>
                    </div>
                </>
                <>
                    <p className='logout-button'
                        onClick={async () => {
                            await handleLogout();
                        }}>로그아웃</p>
                </>
            </div>

            <div className="under-bar-container">
                <button className={page === 'home' ? 'under-bar-icon' : 'under-bar-icon-disabled'} onClick={() => navigate('/home')}>
                    <HomeIcon size={24} /><h4>홈</h4>
                </button>
                <button className={page === 'mygroup' ? 'under-bar-icon' : 'under-bar-icon-disabled'} onClick={() => navigate('/mygroup')}>
                    <FileText size={24} /><h4>내 그룹</h4>
                </button>
                <button className={page === 'bookmarked' ? 'under-bar-icon' : 'under-bar-icon-disabled'} onClick={() => navigate('/bookmarked')}>
                    <Heart size={24} /><h4>찜 목록</h4>
                </button>
                <button className={page === 'myprofile' ? 'under-bar-icon' : 'under-bar-icon-disabled'} onClick={() => navigate('/myprofile')}>
                    <Users size={24} /><h4>내 정보</h4>
                </button>
            </div>
        </div>
    )
}

function Category(props) {
    let category = props.category;
    let CategoryEngToKor = props.CategoryEngToKor;

    return (
        <div className='myprofile-category-card'>
            {
                category.map(function (a, i) {
                    return (
                        <div key={i} className='myprofile-categories'>
                            <span>{CategoryEngToKor[a]}</span>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default myProfile;