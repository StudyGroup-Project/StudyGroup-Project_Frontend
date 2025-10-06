import './my_profile.css';
import './../home/home_.css';
import './../common/CommonStyle.css';
import { useState, useRef } from 'react';
import { HomeIcon, FileText, Heart, Users } from 'lucide-react';
import { useNavigate} from "react-router-dom";
import { useLocation } from "react-router-dom";

// 신뢰점수 추가하기


function myProfile(props){

    let [userData, setUserData] = useState({
        "id": 123,
        "nickname": "홍길동",
        "province": "경상북도",
        "district": "경산시",
        "birthDate": "1999-07-15",
        "job": "STUDENT",
        "preferredCategory": ["IT"],
        "profileImageUrl": "/img/main-assets/default_profile.png",
        "trustScore": 82
    })
    //서버로부터 받아오는 데이터
    //useEffect를 사용해서 이 페이지 진입시에 받아와야함.

    let [profileImg, setProfileImg] = useState(userData.profileImageUrl);
    let [newProfileImg, setNewProfileImg] = useState(null);
    let imgRef = useRef(null);

    function saveImgFile(){
        let file = imgRef.current.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setNewProfileImg(reader.result);
        }
        //서버에 변경된 사진 보내기 추가해야함.
    }

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
                <img className='myprofileImg' src={newProfileImg ? newProfileImg : profileImg}/>
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
                        <button onClick={()=>{
                            navigate('/newnickname', {state: {nickname: userData.nickname}})
                            }}
                            className='myprofile-button'>
                        </button>
                    </h4>
                    <div className='myprofile-box' >
                        <h5>{userData.nickname}</h5>
                    </div>
                </>
                <>
                    <h4 className='myprofile-info'>주소
                        <button onClick={()=>{
                            navigate('/newaddress', {state: {address: userData.province + ' ' + userData.district}})
                            }}
                            className='myprofile-button'>    
                        </button>
                    </h4>
                    <div className='myprofile-box'>
                        <h5>{userData.province + ' ' + userData.district}</h5>
                    </div>
                </>
                <>
                    <h4 className='myprofile-info'>생년월일
                    </h4>    
                    <div className='myprofile-box'>
                        <h5>{userData.birthDate.split('-')[0]
                            + '. ' + userData.birthDate.split('-')[1]
                            + '. ' + userData.birthDate.split('-')[2]}</h5>
                    </div>
                </>
                <>
                    <h4 className='myprofile-info'>직업
                        <button onClick={()=>{
                            navigate('/newjob', {state: {job: userData.job}})
                        }}
                        className='myprofile-button'></button>
                    </h4>
                    <div className='myprofile-box'>
                        <h5>{userData.job}</h5>
                    </div>
                </>
                <>
                    <h4 className='myprofile-info'>선호 카테고리
                        <button onClick={()=>{
                            navigate('/newcategory')
                        }}
                        className='myprofile-button'></button>
                    </h4>
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