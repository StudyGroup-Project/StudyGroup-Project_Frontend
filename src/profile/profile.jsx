import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './profile.css';
import { CustomSelect } from './../common/CustomSelect.jsx'
import { useCookies } from 'react-cookie';
import JobSelect from './JobList.jsx';
import ProfileAddressList from './profile_address_list.jsx';
import { provinceList, districtList } from './../data.js';

function Profile() {
    let [userData, setUserData] = useState({
        nickName: '',
        address: {
            province: '',
            district: ''
        },
        job: '',
        category: []
    })

    let [userBirth, setUserBirth] = useState({
        month: '',
        date: '',
        year: ''
    })

    useEffect(() => {
        const params = new URLSearchParams(window.location.href);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }, []);

    let checkEmpty = () => {
        return (
            !userData.nickName ||
            userData.address.province === '선택안함' ||
            !userBirth.month ||
            !userBirth.date ||
            !userBirth.year ||
            userData.job === '선택안함' ||
            userData.category.length === 0
        )
    }

    return (
        <div>
            <ProfileInput checkEmpty={checkEmpty} userData={userData} setUserData={setUserData}
                userBirth={userBirth} setUserBirth={setUserBirth}
            ></ProfileInput>
        </div>
    )
}

function ProfileInput(props) {
    let category = ['선택안함', 'IT', '사업', '디자인', '언어', '시험', '공부', '일상',
        '기타'
    ]

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
    }

    let job = ['선택안함', '학생', '회사원', '프리랜서', '취업준비생', '기타']
    let EngJob = {
        선택안함: '선택안함',
        학생: 'STUDENT',
        회사원: 'OFFICE_WORKER',
        프리랜서: 'FREELANCER',
        취업준비생: 'JOB_SEEKER',
        기타: 'OTHER'
    }

    let navigate = useNavigate();

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

    async function postUserData() {
        try {
            let accessToken = localStorage.getItem("accessToken")
            let res = await axios.post('http://3.39.81.234:8080/api/users/me/profile/basic', {
                nickname: props.userData.nickName,
                province: props.userData.address.province,
                district: props.userData.address.district,
                birthDate: `${props.userBirth.year}-${props.userBirth.month}-${props.userBirth.date}`,
                job: props.userData.job,
                preferredCategory: props.userData.category
            },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                });
            if (res.status === 200 || res.status === 201) {
                alert("프로필 설정이 완료되었습니다.")
                navigate('/profileImage');
            }
        }
        catch (err) {
            alert("프로필 설정을 다시 시도해주세요.")
            console.log(err);
        }
    }

    return (
        <div className='main'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <h1 className='web-title'>프로필 설정</h1>
            </div>
            <div className='profile-input-container'>
                <>
                    <h4 className='profile-info'>닉네임</h4>
                    <input className='profile-input-box'
                        type='text' placeholder='홍길동'
                        onChange={(e) => {
                            props.setUserData(prev => ({
                                ...prev,
                                nickName: `${e.target.value}`
                            }));
                        }} />
                </>
                <>
                    <h4 className='profile-info'>주소 </h4>
                    <div className='address-input-container'>
                        <ProfileAddressList
                            setUserData={props.setUserData}
                            provinceList={provinceList}
                            districtList={districtList} />
                    </div>
                </>
                <>
                    <h4 className='profile-info'>생년월일</h4>
                    <div className='birth-inputs-wrapper'>
                        <input className='profile-birth-box'
                            type='text' placeholder='1999'
                            onChange={(e) => {
                                props.setUserBirth(prev => ({
                                    ...prev,
                                    year: `${e.target.value}`
                                }))
                            }} />
                        <span>년</span>

                        <input className='profile-birth-box'
                            type='text' placeholder='09'
                            onChange={(e) => {
                                props.setUserBirth(prev => ({
                                    ...prev,
                                    month: `${e.target.value.padStart(2, "0")}`
                                }))
                            }}
                        />
                        <span>월</span>

                        <input className='profile-birth-box'
                            type='text' placeholder='19'
                            onChange={(e) => {
                                props.setUserBirth(prev => ({
                                    ...prev,
                                    date: `${e.target.value.padStart(2, "0")}`
                                }))
                            }}
                        />
                        <span>일</span>
                    </div>
                </>
                <>
                    <h4 className='profile-info'>직업</h4>
                    <JobSelect EngJob={EngJob} setUserData={props.setUserData} list={job} />
                </>
                <>
                    <h4 className='profile-category-info'>선호 카테고리</h4>
                    <CustomSelect EngCategory={EngCategory} setUserData={props.setUserData} list={category}></CustomSelect>
                </>
            </div>

            {
                props.checkEmpty() && <h4 className='next-warning'>모든 칸을 기입해주세요!</h4>
            }
            <div className='profile-button-container'>
                <button
                    className='next-button'
                    disabled={props.checkEmpty()}
                    onClick={async () => {
                        await getAccessToken();
                        await postUserData();
                    }}
                >다음
                </button>
            </div>
        </div>
    )
}

export default Profile;