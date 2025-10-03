import './my_profile.css';
import './../home/home_.css';
import './../common/CommonStyle.css';
import { useState } from 'react';
import { HomeIcon, FileText, Heart, Users } from 'lucide-react';
import { useNavigate} from "react-router-dom";
import { useLocation } from "react-router-dom";


function myProfile(props){

    let [userData, setUserData] = useState({
        "id": 123,
        "nickname": "홍길동",
        "province": "경상북도",
        "district": "경산시",
        "birthDate": "1999-07-15",
        "job": "STUDENT",
        "preferredCategory": "IT",
    })
    //서버로부터 받아오는 데이터


    let navigate = useNavigate();
    let location = useLocation();
    let page = location.pathname.split('/')[1];

    let category = ['IT', '사업', '디자인', '언어', '시험', '공부', '일상',
        '기타'
    ]

    return(
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <h1 className='bookmarked-title-text'>내 정보</h1>
            </div>

            <div className='myprofile-container'>
                <img className='myprofileImg' src='/img/main-assets/default_profile.png'/>
                <>
                    <h4 className='myprofile-info'>닉네임</h4>
                    <div className='myprofile-box' >
                        <h5>{userData.nickname}</h5>
                    </div>
                </>
                <>
                    <h4 className='myprofile-info'>주소 </h4>
                    <div className='myprofile-address-container'>
                        <div className='myprofile-address-box'>
                            <h5>{userData.province}</h5>
                        </div>
                        <div className='myprofile-address-box'>
                            <h5>{userData.district}</h5>
                        </div>
                    </div>
                </>
                <>
                    <h4 className='myprofile-info'>생년월일</h4>
                    <div className='myprofile-birth-wrapper'>    
                        <div className='myprofile-birth-box'>
                            <h5>{userData.birthDate.split('-')[0]}</h5>
                        </div>
                        <span>년</span>

                        <div className='myprofile-birth-box'>
                            <h5>{userData.birthDate.split('-')[1]}</h5>
                        </div>
                        <span>월</span>

                        <div className='myprofile-birth-box'>
                            <h5>{userData.birthDate.split('-')[2]}</h5>
                        </div>
                        <span>일</span>
                    </div>
                </>
                <>
                    <h4 className='myprofile-info'>직업</h4>
                    <div className='myprofile-box'>
                        <h5>{userData.job}</h5>
                    </div>
                </>
                <>
                    <h4 className='myprofile-info'>선호 카테고리</h4>
                    <Category category={category}></Category>
                </>
            </div>

            <div className="under-bar-container">
                <button className={
                    page === 'home' ? 'under-bar-icon' : 'under-bar-icon-disabled'
                }
                onClick={()=>{
                    navigate('/home');
                }}
                >
                        <HomeIcon size={24} />
                        <h4>홈</h4>
                </button>
                <button className={
                    page === 'mygroup' ? 'under-bar-icon' : 'under-bar-icon-disabled'
                }
                onClick={()=>{
                    navigate('/mygroup');
                }}
                >
                        <FileText size={24} />
                        <h4>내 그룹</h4>
                </button>
                <button className={
                    page === 'bookmarked' ? 'under-bar-icon' : 'under-bar-icon-disabled'
                }
                onClick={()=>{
                    navigate('/bookmarked');
                }}
                >
                        <Heart size={24} />
                        <h4>찜 목록</h4>
                </button>
                <button className={
                    page === 'profile' ? 'under-bar-icon' : 'under-bar-icon-disabled'
                }
                onClick={()=>{
                    navigate('/myprofile');
                }}
                >
                        <Users size={24} />
                        <h4>내 정보</h4>
                </button>
            </div>
        </div>
    )
}

function Category(props){
    let category = props.category;

    return(
        <div className='myprofile-category-card'>
            {  
                category.map(function(a, i){
                    return(
                        <div key={i} className='myprofile-categories'>
                            <span>{category[i]}</span>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default myProfile;