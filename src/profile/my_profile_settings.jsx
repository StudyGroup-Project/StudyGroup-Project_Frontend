import './my_profile_settings.css';
import './../home/home_.css';
import './../common/CommonStyle.css';
import './my_profile.css';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { provinceList, districtList } from './../data.js';
import SelectList from './select_list.jsx';
import { CategoryList } from './category_list.jsx';


function ChangeNickname(){
    let location = useLocation();
    let nickname = location.state.nickname;

    let [newNickname, setNewNickname] = useState(' ');

    return(
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
                    type='text' placeholder={nickname}
                    onChange={(e)=>{
                        setNewNickname(e.target.value);
                    }}
                    />
                <span className='change-nickname-input-line'></span>
            </div>

            <div className='change-nickname-button-container'>
                <button className='change-nickname-button'
                onClick={()=>{
                    //서버에 다시 보내기.
                }}
                disabled={newNickname===nickname}
                >
                    변경
                </button>
            </div>
        </div>
    )
}

function ChangeAddress(){
    let location = useLocation();
    let address = location.state.address;
    let province = address.split(' ')[0];
    let district = address.split(' ')[1];

    let [newProvince, setNewProvince] = useState(' ');
    let [newDistrict, setNewDistrict] = useState(' ');

    return(
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
                onClick={()=>{
                    //서버에 다시 보내기.
                }}
                disabled={newProvince===province && newDistrict===district}>
                    변경
                </button>
            </div>
        </div>
    )
}

function ChangeJob(){
    let location = useLocation();
    let job = location.state.job;

    let [newJob, setNewJob] = useState(' ');

    return(
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
                <input className='change-nickname-input-box' 
                    type='text' placeholder={job}
                    onChange={(e)=>{
                        setNewJob(e.target.value);
                    }}
                    />
                <span className='change-nickname-input-line'></span>
            </div>

            <div className='change-nickname-button-container'>
                <button className='change-nickname-button'
                onClick={()=>{
                    //서버에 다시 보내기.
                }}
                disabled={newJob===job}
                >
                    변경
                </button>
            </div>
        </div>
    )
}

function ChangeCategory(){
    let category = ['IT', '사업', '디자인', '언어', '시험', '공부', '일상',
        '기타'
    ]
    let [ newCategory, setNewCategory] = useState(' ');

    return(
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <h1 className='bookmarked-title-text'>닉네임 변경</h1>
            </div>

            <div className='change-your-nickname'>
                <h1 className='change-your-nickname-text'>
                    카테고리를 다시 선택해 주세요.</h1>
            </div>

            <div className='change-nickname-input-container'>
                <h4>선호 카테고리</h4>
                <CategoryList list={category} setUserData={setNewCategory}></CategoryList>
            </div>

            <div className='change-nickname-button-container'>
                <button className='change-nickname-button'
                onClick={()=>{
                    // newCategory 서버에 다시 보내기.
                }}
                >
                    변경
                </button>
            </div>
        </div>
    )
}

export { ChangeNickname, ChangeAddress, ChangeJob, ChangeCategory };