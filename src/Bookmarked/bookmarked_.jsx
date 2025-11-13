import './bookmarked_.css';
import '../home/home_.css';
import { HomeIcon, FileText, Heart, Users } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import axios from 'axios';

function Bookmarked() {
    let location = useLocation();
    let page = location.pathname.split('/')[1];

    let navigate = useNavigate();
    let [groupData, setGroupData] = useState([]);

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

    async function getMyBookmarked() {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const res = await axios.get('http://3.39.81.234:8080/api/studies/bookmarks', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                withCredentials: true
            });
            setGroupData(res.data.studies || []);
        } catch (err) {
            console.error('내 그룹 스터디 가져오기 실패:', err.response?.data || err.message);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await getAccessToken();
            await getMyBookmarked();
        };
        fetchData();
    }, []);

    return (
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <h1 className='bookmarked-title-text'>찜 목록</h1>
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
                            onClick={() => {
                                let copy = [...groupData];
                                setGroupData(copy.filter(g => g.id !== group.id));
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
                                        : "/img/main-assets/empty_heart.png"} />
                        </button>
                    </div>
                ))
            }

            <div className="under-bar-container">
                <button className={
                    page === 'home' ? 'under-bar-icon' : 'under-bar-icon-disabled'
                }
                    onClick={() => {
                        navigate('/home');
                    }}
                >
                    <HomeIcon size={24} />
                    <h4>홈</h4>
                </button>
                <button className={
                    page === 'mygroup' ? 'under-bar-icon' : 'under-bar-icon-disabled'
                }
                    onClick={() => {
                        navigate('/mygroup');
                    }}
                >
                    <FileText size={24} />
                    <h4>내 그룹</h4>
                </button>
                <button className={
                    page === 'bookmarked' ? 'under-bar-icon' : 'under-bar-icon-disabled'
                }
                    onClick={() => {
                        navigate('/bookmarked');
                    }}
                >
                    <Heart size={24} />
                    <h4>찜 목록</h4>
                </button>
                <button className={
                    page === 'profile' ? 'under-bar-icon' : 'under-bar-icon-disabled'
                }
                    onClick={() => {
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


export default Bookmarked;