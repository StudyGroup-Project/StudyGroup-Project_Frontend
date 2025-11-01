import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './profile.css';
import { CustomSelect } from './../common/CustomSelect.jsx'
import { useCookies } from 'react-cookie';

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
            !userData.address ||
            !userBirth.month ||
            !userBirth.date ||
            !userBirth.year ||
            !userData.job ||
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
    let category = ['IT', '사업', '디자인', '언어', '시험', '공부', '일상',
        '기타'
    ]

    let navigate = useNavigate();
    // let [cookies, setCookies] = useCookies(['refresh_token']);

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
            console.log(accessToken);
            let res = await axios.post('http://3.39.81.234:8080/api/users/me/profile/basic', {
                nickname: props.userData.nickName,
                province: props.userData.address.province,
                district: props.userData.address.district,
                birthDate: props.userBirth.year + '-' + props.userBirth.month + '-' + props.userBirth.date,
                job: props.userData.job,
                // preferredCategory: props.userData.category
                preferredCategory: category[0]
            },
                {
                    // 2. headers 객체에 Authorization 추가
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true // 기존 설정 유지
                });
            navigate('/profileImage');
        }
        catch (err) {
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
                        <input className='address-input-box'
                            type='text' placeholder='경상북도'
                            onChange={(e) => {
                                props.setUserData(prev => ({
                                    ...prev,
                                    address: {
                                        ...prev.address,
                                        province: `${e.target.value}`
                                    }
                                }))
                            }}
                        />
                        <input className='address-input-box'
                            type='text' placeholder='경산시'
                            onChange={(e) => {
                                props.setUserData(prev => ({
                                    ...prev,
                                    address: {
                                        ...prev.address,
                                        district: `${e.target.value}`
                                    }
                                }))
                            }}
                        />
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
                                    month: `${e.target.value}`
                                }))
                            }}
                        />
                        <span>월</span>

                        <input className='profile-birth-box'
                            type='text' placeholder='19'
                            onChange={(e) => {
                                props.setUserBirth(prev => ({
                                    ...prev,
                                    date: `${e.target.value}`
                                }))
                            }}
                        />
                        <span>일</span>
                    </div>
                </>
                <>
                    <h4 className='profile-info'>직업</h4>
                    <input className='profile-input-box'
                        type='text' placeholder='학생'
                        onChange={(e) => {
                            props.setUserData(prev => ({
                                ...prev,
                                job: `${e.target.value}`
                            }))
                        }}
                    />
                </>
                <>
                    <h4 className='profile-info'>선호 카테고리</h4>
                    <CustomSelect setUserData={props.setUserData} list={category}></CustomSelect>
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
                        console.log(props.userData);
                        console.log(props.userBirth);
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