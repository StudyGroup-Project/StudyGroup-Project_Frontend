import './../home/home_.css';
import './../Bookmarked/bookmarked_.css';
import './../common/CommonStyle.css';
import { useState } from 'react';
import { HomeIcon, FileText, Heart, Users } from 'lucide-react';
import { useNavigate} from "react-router-dom";
import { useLocation } from "react-router-dom";

function MyGroup(){
    let location = useLocation();
    let page = location.pathname.split('/')[1];
    
    let navigate = useNavigate();

    let [groupData, setGroupData] = useState(
        [
            {
                id: 1,
                title: '백엔드 스터디',
                maxMemberCount: 10,
                memberCount: 5,
                bookmarkCount: 31,
                bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
                category: ['디자인', 'IT'],
                trustScore: 82,
                bookmarked: true
            },
            {
                id: 2,
                title: '프론트엔드 스터디',
                maxMemberCount: 6,
                memberCount: 3,
                bookmarkCount: 23,
                bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
                category: ['디자인', 'IT'],
                trustScore: 82,
                bookmarked: false
            },
            {
                id: 3,
                title: '프론트엔드 스터디',
                maxMemberCount: 6,
                memberCount: 3,
                bookmarkCount: 23,
                bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
                category: ['디자인', 'IT'],
                trustScore: 82,
                bookmarked: false
            },
            {
                id: 4,
                title: '프론트엔드 스터디',
                maxMemberCount: 6,
                memberCount: 3,
                bookmarkCount: 23,
                bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
                category: ['디자인', 'IT'],
                trustScore: 82,
                bookmarked: false
            },
            {
                id: 5,
                title: '프론트엔드 스터디',
                maxMemberCount: 6,
                memberCount: 3,
                bookmarkCount: 23,
                bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
                category: ['디자인', 'IT'],
                trustScore: 82,
                bookmarked: false
            },
            {
                id: 6,
                title: '프론트엔드 스터디',
                maxMemberCount: 6,
                memberCount: 3,
                bookmarkCount: 23,
                bio: '동해물과 백두산이 마르고 닳도록, 하느님이 보우하사 우리나라 만세',
                category: ['디자인', 'IT'],
                trustScore: 82,
                bookmarked: false
            }
        ]
    );
    //서버에서 받오와야할 그룹 목록들

    return(
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <h1 className='bookmarked-title-text'>내 그룹</h1>
            </div>

            {/* 그룹 리스트 서버에서 가져와야함. */}
            {
            groupData.map((group, i) => (
                //group -> 받아온 groupData의 각 그룹객체 하나하나
                <div className='bookmarked-group-container' key={group.id}>
                    <h4 className='bookmarked-group-title'>{group.title}</h4>
                    {group.category.map((cat, j) => (
                        <div className='bookmarked-group-category' key={j}>
                            <h4># {cat}</h4>
                        </div>
                    ))}
                    <h4 className='bookmarked-group-bio'>{group.bio}</h4>
                    <div className='bookmarked-group-Curmember-container'>
                        <h4 className='bookmarked-group-member-count'>{group.memberCount}</h4>
                        <h4 className='bookmarked-group-member-text'>{'현재인원'}</h4>
                    </div>
                    <h4 className='bookmarked-group-member-bar'>/</h4>
                    <div className='bookmarked-group-Maxmember-container'>
                        <h4 className='bookmarked-group-member-count'>{group.maxMemberCount}</h4>
                        <h4 className='bookmarked-group-member-text'>{'전체인원'}</h4>
                    </div>
                    <button className='bookmarked-group-bookmark-button'
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
                        )
                        //이때 post로 group의 객체 정보 다시 전송해야함.
                    }}
                    >
                        <img 
                        className={
                            group.bookmarked 
                            ? 'bookmarked-group-heart' 
                            : 'bookmarked-group-emptyHeart'} 
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

export default MyGroup;