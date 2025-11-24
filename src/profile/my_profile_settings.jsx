import './my_profile_settings.css';
import './../home/home_.css';
import './../common/CommonStyle.css';
import './my_profile.css';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { provinceList, districtList } from './../data.js';
import SelectList from './select_list.jsx';
import { CategoryList } from './category_list.jsx';
import PatchJobList from './patch_job_list.jsx';
import axios from 'axios';


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



function ChangeNickname() {
    let location = useLocation();
    let userData = location.state.userData;

    let [newNickname, setNewNickname] = useState(' ');

    async function patchUserData() {

        if(newNickname === userData.nickname){
            alert("기존 닉네임과 동일합니다.")
            return ;
        }

        try {
            let accessToken = localStorage.getItem("accessToken")
            let res = await axios.patch('http://3.39.81.234:8080/api/users/me/profile', {
                nickname: newNickname,
                province: userData.province,
                district: userData.district,
                birthDate: userData.birthDate,
                job: userData.job,
                preferredCategory: userData.preferredCategory
            },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                });
            if (res.status === 200) {
                alert("변경이 완료되었습니다");
            }
        }
        catch (err) {
            alert("변경에 실패하였습니다. 다시 시도해 주세요.");
            console.log(err);
        }
    }

    return (
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <h1 className='bookmarked-title-text'>닉네임 변경</h1>
            </div>

            <div className='change-your-nickname'>
                <h1 className='change-your-nickname-text'>
                    변경할 닉네임을 입력해 주세요.</h1>
            </div>

            <div className='change-nickname-input-container'>
                <h4>닉네임</h4>
                <input className='change-nickname-input-box'
                    type='text' placeholder={userData.nickname}
                    onChange={(e) => {
                        setNewNickname(e.target.value);
                    }}
                />
                <span className='change-nickname-input-line'></span>
            </div>

            <div className='change-nickname-button-container'>
                <button className='change-nickname-button'
                    onClick={async () => {
                        await getAccessToken();
                        await patchUserData();
                    }}
                    // disabled={newNickname === userData.nickname}
                >
                    변경
                </button>
            </div>
        </div>
    )
}

function ChangeAddress() {
    let location = useLocation();
    let userData = location.state.userData;
    let province = userData.province;
    let district = userData.district;

    let [newProvince, setNewProvince] = useState(' ');
    let [newDistrict, setNewDistrict] = useState(' ');

    async function patchUserData() {

        if(userData.province === newProvince && 
            userData.district === newDistrict
        ){
            alert("기존 주소와 동일합니다.");
            return ;
        }

        try {
            let accessToken = localStorage.getItem("accessToken")
            let res = await axios.patch('http://3.39.81.234:8080/api/users/me/profile', {
                nickname: userData.nickname,
                province: newProvince,
                district: newDistrict,
                birthDate: userData.birthDate,
                job: userData.job,
                preferredCategory: userData.preferredCategory
            },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                });
            if (res.status === 200) {
                alert("변경이 완료되었습니다");
            }
        }
        catch (err) {
            alert("변경에 실패하였습니다. 다시 시도해 주세요.");
            console.log(err);
        }
    }

    return (
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <h1 className='bookmarked-title-text'>주소 변경</h1>
            </div>

            <div className='change-your-nickname'>
                <h1 className='change-your-nickname-text'>
                    변경할 주소지를 선택해 주세요.</h1>
            </div>

            <div className='change-nickname-input-container'>
                <h4>주소</h4>
                <div className='change-address-container'>
                    <SelectList
                        province={province} district={district}
                        provinceList={provinceList} districtList={districtList}
                        setProvince={setNewProvince} setDistrict={setNewDistrict}
                    ></SelectList>
                </div>
                <span className='change-nickname-input-line'></span>
            </div>

            <div className='change-nickname-button-container'>
                <button className='change-nickname-button'
                    onClick={async () => {
                        await getAccessToken();
                        await patchUserData();
                    }}
                    disabled={newProvince === '선택안함'}>
                    변경
                </button>
            </div>
        </div>
    )
}

function ChangeJob() {
    let location = useLocation();
    let userData = location.state.userData;

    let [newJob, setNewJob] = useState(' ');
    let job = ['선택안함', '학생', '회사원', '프리랜서', '취업준비생', '기타']

    async function patchUserData() {

        if(userData.job === newJob) {
            alert("기존 직업과 동일합니다.");
            return ;
        }

        try {
            let accessToken = localStorage.getItem("accessToken")
            let res = await axios.patch('http://3.39.81.234:8080/api/users/me/profile', {
                nickname: userData.nickname,
                province: userData.province,
                district: userData.district,
                birthDate: userData.birthDate,
                job: newJob,
                preferredCategory: userData.preferredCategory
            },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                });
            if (res.status === 200) {
                alert("변경이 완료되었습니다");
            }
        }
        catch (err) {
            alert("변경에 실패하였습니다. 다시 시도해 주세요.");
            console.log(err);
        }
    }

    return (
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <h1 className='bookmarked-title-text'>직업 변경</h1>
            </div>

            <div className='change-your-nickname'>
                <h1 className='change-your-nickname-text'>
                    변경할 직업을 입력해 주세요.</h1>
            </div>

            <div className='change-nickname-input-container'>
                <h4>직업</h4>
                <PatchJobList list={job} setUserData={setNewJob} />
                <span className='change-nickname-input-line'></span>
            </div>
            <div className='change-nickname-button-container'>
                <button className='change-nickname-button'
                    onClick={async () => {
                        await getAccessToken();
                        await patchUserData();
                    }}
                    disabled={newJob === '선택안함'}
                >
                    변경
                </button>
            </div>
        </div>
    )
}

function ChangeCategory() {
    let category = ['선택안함', 'IT', '사업', '디자인', '언어', '시험', '공부', '일상',
        '기타'
    ]

    let EngCategory = {
        선택안함: '선택안함',
        IT: 'IT',
        사업: 'BUSINESS',
        디자인: 'DESIGN',
        언어: 'LANGUAGE',
        시험: 'EXAM',
        공부: 'ACADEMICS',
        일상: 'LIFESTYLE',
        기타: 'OTHER'
    }

    let location = useLocation();
    let userData = location.state.userData;

    let [newCategory, setNewCategory] = useState([]);

    async function patchUserData() {

        let currentCategory = userData.preferredCategory;
        let sortedCurrent = [...currentCategory].sort();
        let sortedNew = [...newCategory].sort();
        const isSame = (sortedCurrent.length === sortedNew.length) && 
                   sortedCurrent.every((value, index) => value === sortedNew[index]);
        if(isSame) {
            alert("기존 카테고리와 동일합니다.");
            return ;
        }


        try {
            let accessToken = localStorage.getItem("accessToken")
            let res = await axios.patch('http://3.39.81.234:8080/api/users/me/profile', {
                nickname: userData.nickname,
                province: userData.province,
                district: userData.district,
                birthDate: userData.birthDate,
                job: userData.job,
                preferredCategory: newCategory
            },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                });
            if (res.status === 200) {
                alert("변경이 완료되었습니다");
            }
        }
        catch (err) {
            alert("변경에 실패하였습니다. 다시 시도해 주세요.");
            console.log(err);
        }
    }

    return (
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <h1 className='bookmarked-title-text'>카테고리 변경</h1>
            </div>

            <div className='change-your-nickname'>
                <h1 className='change-your-nickname-text'>
                    카테고리를 다시 선택해 주세요.</h1>
            </div>

            <div className='change-nickname-input-container'>
                <h4>선호 카테고리</h4>
                <CategoryList EngCategory={EngCategory} list={category} setUserData={setNewCategory}></CategoryList>
            </div>

            <div className='change-nickname-button-container'>
                <button className='change-nickname-button'
                    onClick={async () => {
                        await getAccessToken();
                        await patchUserData();
                    }}
                    disabled={newCategory.length===0}>
                    변경
                </button>
            </div>
        </div>
    )
}

export { ChangeNickname, ChangeAddress, ChangeJob, ChangeCategory };