import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import './home_.css';
import '../common/CommonStyle.css';
import { HomeIcon, FileText, Heart, Users } from 'lucide-react';
import axios from 'axios';

function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const page = location.pathname.split('/')[1];

    const [search, setSearch] = useState('그룹을 검색해보세요!');
    const [userData, setUserData] = useState({});
    const [groupData, setGroupData] = useState([]);
    const [groupProfileData, setGroupProfileData] = useState({});

    function getGaugeColorClass(score) {
        if (score >= 70) {
            return 'gauge-high'; // 70점 이상: 초록색
        }
        if (score >= 30) {
            return 'gauge-medium'; // 30점 ~ 69점: 주황색
        }
        return 'gauge-low'; // 30점 미만: 빨간색
    }

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
            const res = await axios.get('http://3.39.81.234:8080/api/home', {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true,
            });
            setUserData(res.data.user);
            setGroupData(res.data.topStudies);
        } catch (err) {
            console.log(err);
        }
    }

    async function toggleBookmark(studyId, currentlyBookmarked) {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (currentlyBookmarked) {
                await axios.delete(`http://3.39.81.234:8080/api/studies/${studyId}/bookmark`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    withCredentials: true,
                });
            } else {
                await axios.post(`http://3.39.81.234:8080/api/studies/${studyId}/bookmark`, {}, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    withCredentials: true,
                });
            }
        } catch (err) {
            console.error('북마크 토글 실패:', err.response?.data || err.message);
            throw err;
        }
    }

    async function handleGroupClick(studyId) {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const res = await axios.get(`http://3.39.81.234:8080/api/studies/${studyId}?t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true,
            });

            setGroupProfileData(res.data);
            console.log(res.data);
            if (res.data.leaderCheck === true) {
                navigate(`/groupscreenhost/${studyId}`)
            }
            else if (res.data.applicationStatus !== 'ACCEPTED') {
                navigate(`/groupprofile/${studyId}`, { state: { groupProfileData: res.data } });
            } else {
                // navigate(각자 그룹화면으로 이동);
            }

        } catch (err) {
            console.error('그룹 상세 데이터 가져오기 실패:', err.response?.data || err.message);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await getAccessToken();
            await getUserData();
        };
        fetchData();
    }, []);

    return (
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}></button>
                <img className='address-image' src="/img/main-assets/location.png" />
                <h4 className='address-text'>{userData.province} {userData.district}</h4>
            </div>

            <div className='user-container'>
                <img className='user-image' src={userData.profileImageUrl} />
                <h4 className='user-text--greeting'>안녕하세요!</h4>
                <h4 className='user-text--nickname'>{userData.nickname}</h4>
                <button className='plus-button' onClick={() => navigate('/addGroup')}>
                    <img src="/img/main-assets/plus.png" />
                </button>
            </div>

            <div className='search-container'>
                <img src="/img/main-assets/search.png" className='search-icon' />
                <input className='search-input' type='text'
                    placeholder={search}
                    onFocus={() => { setSearch(''); navigate('/search'); }}
                    onBlur={() => setSearch('그룹을 검색해보세요!')}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className='active-group-text-container'>
                <h4 className='active-group-text'>현재 활발히 활동중인 그룹들 🔥</h4>
            </div>

            {groupData.map(group => (
                <div className='active-group-container' key={group.id}
                    onClick={async () => {
                        await getAccessToken();
                        await handleGroupClick(group.id);
                    }}>
                    <h4 className='active-group-title'>{group.title}</h4>
                    {group.category.map((cat, j) => (
                        <div className='active-group-category' key={j}><h4># {cat}</h4></div>
                    ))}
                    <h4 className='active-group-bio'>{group.bio}</h4>
                    <div className='active-group-Curmember-container'>
                        <h4 className='active-group-member-count'>{group.memberCount}</h4>
                        <h4 className='active-group-member-text'>현재인원</h4>
                    </div>
                    <h4 className='active-group-member-bar'>/</h4>
                    <div className='active-group-Maxmember-container'>
                        <h4 className='active-group-member-count'>{group.maxMemberCount}</h4>
                        <h4 className='active-group-member-text'>전체인원</h4>
                    </div>

                    <div className="trust-score-container">
                        <div className="gauge-background">
                            <div
                                className={`gauge-bar ${getGaugeColorClass(group.trustScore)}`}
                                style={{ width: `${group.trustScore}%` }}
                            >
                            </div>
                        </div>
                    </div>

                    <button
                        className='active-group-bookmark-button'
                        onClick={async (e) => {
                            e.stopPropagation();
                            setGroupData(prev => prev.map(g => g.id === group.id ? { ...g, bookmarked: !g.bookmarked } : g));
                            try {
                                await toggleBookmark(group.id, group.bookmarked);
                            } catch (err) {
                                setGroupData(prev => prev.map(g => g.id === group.id ? { ...g, bookmarked: !g.bookmarked } : g));
                            }
                        }}
                    >
                        <img
                            className={group.bookmarked ? 'active-group-heart' : 'active-group-emptyHeart'}
                            src={group.bookmarked ? "/img/main-assets/heart.png" : "/img/main-assets/empty_heart.png"} />
                    </button>
                </div>
            ))}

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
                <button className={page === 'profile' ? 'under-bar-icon' : 'under-bar-icon-disabled'} onClick={() => navigate('/myprofile')}>
                    <Users size={24} /><h4>내 정보</h4>
                </button>
            </div>
        </div>
    );
}

export default Home;
