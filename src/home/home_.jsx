import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate} from "react-router-dom";
import './home_.css';
import '../common/CommonStyle.css';
import { HomeIcon, FileText, Heart, Users } from 'lucide-react';
import axios from 'axios';


function Home(){
    // let userData = {
    //     nickname: "홍길동",
    //     profileImage: "/img/main-assets/default_profile.png",
    //     province: "경상북도",
    //     district: "경산시",
    // }

    // let [groupData, setGroupData] = useState(
    //     [
    //         {
    //             id: 1,
    //             title: '백엔드 스터디',
    //             maxMemberCount: 10,
    //             memberCount: 5,
    //             bookmarkCount: 31,
    //             bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
    //             category: ['디자인', 'IT'],
    //             trustScore: 82,
    //             bookmarked: true
    //         },
    //         {
    //             id: 2,
    //             title: '프론트엔드 스터디',
    //             maxMemberCount: 6,
    //             memberCount: 3,
    //             bookmarkCount: 23,
    //             bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
    //             category: ['디자인', 'IT'],
    //             trustScore: 82,
    //             bookmarked: false
    //         },
    //         {
    //             id: 3,
    //             title: '프론트엔드 스터디',
    //             maxMemberCount: 6,
    //             memberCount: 3,
    //             bookmarkCount: 23,
    //             bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
    //             category: ['디자인', 'IT'],
    //             trustScore: 82,
    //             bookmarked: false
    //         },
    //         {
    //             id: 4,
    //             title: '프론트엔드 스터디',
    //             maxMemberCount: 6,
    //             memberCount: 3,
    //             bookmarkCount: 23,
    //             bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
    //             category: ['디자인', 'IT'],
    //             trustScore: 82,
    //             bookmarked: false
    //         },
    //         {
    //             id: 5,
    //             title: '프론트엔드 스터디',
    //             maxMemberCount: 6,
    //             memberCount: 3,
    //             bookmarkCount: 23,
    //             bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
    //             category: ['디자인', 'IT'],
    //             trustScore: 82,
    //             bookmarked: false
    //         },
    //         {
    //             id: 6,
    //             title: '프론트엔드 스터디',
    //             maxMemberCount: 6,
    //             memberCount: 3,
    //             bookmarkCount: 23,
    //             bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
    //             category: ['디자인', 'IT'],
    //             trustScore: 82,
    //             bookmarked: false
    //         }
    //     ]
    // );

    let navigate = useNavigate();

    let [search, setSearch] = useState('그룹을 검색해보세요!');

    let [userData, setUserData] = useState({});
    let [groupData, setGroupData] = useState([]);

    let location = useLocation();
    let page = location.pathname.split('/')[1];

    async function getUserData(){
        try{
            let res = await axios.get('http://3.39.81.234:8080/api/home', {
                withCredentials: true
            });
            setUserData(res.data.user);
            setGroupData(res.data.topStudies);
        }
        catch(err){
            console.log(err);
        }
    }
    // 서버랑 APi 연결해볼때 사용 할 것
    // 사용자 정보, 그룹 리스트 가져와야함.
    
    useEffect(()=>{
        getUserData();
    }, []);

    return(
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <img className='address-image' src ="/img/main-assets/location.png"/>
                <h4 className='address-text'>{userData.province} {userData.district}</h4>
            </div>

            <div className='user-container'>
                <img className='user-image' src ={userData.profileImage}/>
                <h4 className='user-text--greeting'
                >안녕하세요!</h4>
                <h4 className='user-text--nickname'>{userData.nickname}</h4>
                <button className='plus-button' 
                onClick={()=>{
                    //과제 생성
                }}>
                    <img src="/img/main-assets/plus.png"/>
                </button>
            </div>
            
            <div className='search-container'>
                <img src="/img/main-assets/search.png" className='search-icon'/>
                <input className='search-input' type='text' 
                placeholder={search}
                onFocus={()=>{
                    setSearch('');
                    navigate('/search');
                }}
                onBlur={()=>{
                    setSearch('그룹을 검색해보세요!');
                }}
                onChange={(e)=>{
                    setSearch(e.target.value);
                    //이 데이터 서버로 넘기고 결과를 리스트로 받아야함.
                }}
                />
            </div>

            <div className='active-group-text-container'>
                <h4 className='active-group-text'>현재 활발히 활동중인 그룹들 🔥</h4>
            </div>

            {/* 그룹 리스트 서버에서 가져와야함. */}
            {/* 신뢰점수 추가해야함 */}
            {
            groupData.map((group, i) => (
                //group -> 받아온 groupData의 각 그룹객체 하나하나
                <div className='active-group-container' key={group.id}>
                    <h4 className='active-group-title'>{group.title}</h4>
                    {group.category.map((cat, j) => (
                        <div className='active-group-category' key={j}>
                            <h4># {cat}</h4>
                        </div>
                    ))}
                    <h4 className='active-group-bio'>{group.bio}</h4>
                    <div className='active-group-Curmember-container'>
                        <h4 className='active-group-member-count'>{group.memberCount}</h4>
                        <h4 className='active-group-member-text'>{'현재인원'}</h4>
                    </div>
                    <h4 className='active-group-member-bar'>/</h4>
                    <div className='active-group-Maxmember-container'>
                        <h4 className='active-group-member-count'>{group.maxMemberCount}</h4>
                        <h4 className='active-group-member-text'>{'전체인원'}</h4>
                    </div>
                    <button className='active-group-bookmark-button'
                    onClick={()=>{
                        setGroupData(prev=>
                            //prev -> 이전 groupData 즉, 그룹 객체를 저장하고 있던 배열
                            prev.map(function(g, i){
                                //객체 하나하나를 순회하는 반복문
                                //g -> 객체 하나하나
                                return(
                                    //g는 모든 객체 하나하나를 순회
                                    //group은 현재 이벤트가 발생한 그룹 객체
                                    g.id == group.id ? {...g, bookmarked: !g.bookmarked} : g
                                );
                            })
                            //이때 post로 group의 객체 정보 다시 전송해야함.
                    )}}
                    >
                        <img 
                        className={
                            group.bookmarked 
                            ? 'active-group-heart' 
                            : 'active-group-emptyHeart'} 
                        src={
                            group.bookmarked 
                            ? "/img/main-assets/heart.png" 
                            : "/img/main-assets/empty_heart.png"}/>
                    </button>
                </div>
                ))
            }
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

export default Home;