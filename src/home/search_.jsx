import { useState, useEffect } from 'react';
import './home_.css';
import './search_.css';
import { useNavigate } from 'react-router-dom';
import SearchAddress from './search_address.jsx';
import SearchCategory from './search_category.jsx';
import SearchSort from './search_sort.jsx';
import { provinceList, districtList } from './../data.js';
import axios from 'axios';

function Search() {
    let category = ['카테고리', 'IT', '사업', '디자인', '언어', '시험', '공부', '일상', '기타'];

    let [newCategory, setNewCategory] = useState('카테고리');
    let [newProvince, setNewProvince] = useState('시/도');
    let [newDistrict, setNewDistrict] = useState('시/군/구');

    let [isSuccess, setIsSuccess] = useState(null);
    let [searchText, setSearchText] = useState('');

    let [searchResult, setSearchResult] = useState([]); // 리스트 데이터
    let [resultInfo, setResultInfo] = useState({});
    let [currentPage, setCurrentPage] = useState(1);
    let limit = 10;

    let [sortType, setSortType] = useState('');
    let sortList = ['최신순', '신뢰도순'];

    let CategoryEngToKor = {
        IT: 'IT',
        BUSINESS: '사업',
        DESIGN: '디자인',
        LANGUAGE: '언어',
        EXAM: '시험',
        ACADEMICS: '공부',
        LIFESTYLE: '일상',
        OTHER: '기타'
    }

    const [groupProfileData, setGroupProfileData] = useState({});

    let navigate = useNavigate();

    async function handleSearch() {
        try {
            if (!searchText.trim()) {
                setIsSuccess(null);
                setSearchResult([]);
                return;
            }

            const accessToken = localStorage.getItem("accessToken");

            const res = await axios.get('http://3.39.81.234:8080/api/studies', {
                params: {
                    keyword: searchText || undefined,
                    category: newCategory !== '카테고리' ? newCategory : undefined,
                    province: newProvince !== '시/도' ? newProvince : undefined,
                    district: newDistrict !== '시/군/구' ? newDistrict : undefined,
                    page: currentPage,
                    limit: 10,
                    sort: sortType || undefined
                },
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true,
            });

            if (res.data && res.data.studies) {
                setSearchResult(res.data.studies);
                setResultInfo(res.data.meta);
                setIsSuccess(true);
            } else {
                setSearchResult([]);
                setIsSuccess(false);
            }

        } catch (err) {
            console.log(err);
            setIsSuccess(false);
        }
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

    useEffect(() => {
        const fetchData = async () => {
            await getAccessToken();
            await handleSearch();
        };
        fetchData();
    }, [searchText, newCategory, newProvince, newDistrict, sortType, currentPage]);

    const handlePageClick = (pageNum) => {
        setCurrentPage(pageNum);
    };

    function getGaugeColorClass(score) {
        if (score >= 70) {
            return 'gauge-high'; // 70점 이상: 초록색
        }
        if (score >= 30) {
            return 'gauge-medium'; // 30점 ~ 69점: 주황색
        }
        return 'gauge-low'; // 30점 미만: 빨간색
    }

    async function handleGroupClick(studyId) {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const res = await axios.get(`http://3.39.81.234:8080/api/studies/${studyId}?t=${Date.now()}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
                withCredentials: true,
            });

            setGroupProfileData(res.data);
            if (res.data.leaderCheck === true) {
                navigate(`/groupscreenhost/${studyId}`)
            }
            else if (res.data.applicationStatus !== 'ACCEPTED') {
                navigate(`/groupprofile/${studyId}`, { state: { groupProfileData: res.data } });
            } else {
                navigate(`/groupscreen/${studyId}`)
            }

        } catch (err) {
            console.error('그룹 상세 데이터 가져오기 실패:', err.response?.data || err.message);
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

    return (
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}></button>
            </div>

            <div className='search-ing-container'>
                <div className='search-category-container'>
                    <SearchCategory category={category} setNewCategory={setNewCategory} />
                    <span className='search-ing-line'></span>

                    <input
                        className='search-ing-input'
                        type='text'
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <div className='search-type-container'>
                    <div className='search-address-container'>
                        <SearchAddress
                            provinceList={provinceList}
                            districtList={districtList}
                            newProvince={newProvince}
                            setNewProvince={setNewProvince}
                            newDistrict={newDistrict}
                            setNewDistrict={setNewDistrict}
                        />
                    </div>

                    <div className='search-sort-container'>
                        <img src='/img/main-assets/sort.png' className='search-sort-icon' />
                        <SearchSort sortList={sortList} setSortType={setSortType} />
                    </div>
                </div>
            </div>

            {/* 검색 결과 */}
            <div className='search-result-container'>
                {isSuccess != null &&
                    (isSuccess ? (
                        searchResult.map((group) => (
                            <div className='active-group-container' key={group.id}
                                onClick={async () => {
                                    await getAccessToken();
                                    await handleGroupClick(group.id);
                                }}>
                                <h4 className='active-group-title'>{group.title}</h4>

                                {/* category는 문자열 */}
                                <div className='active-group-category'>
                                    <h4># {CategoryEngToKor[group.category]}</h4>
                                </div>

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
                                        setSearchResult(prev => prev.map(g => g.id === group.id ? { ...g, bookmarked: !g.bookmarked } : g));
                                        try {
                                            await toggleBookmark(group.id, group.bookmarked);
                                        } catch (err) {
                                            setSearchResult(prev => prev.map(g => g.id === group.id ? { ...g, bookmarked: !g.bookmarked } : g));
                                        }
                                    }}
                                >
                                    <img
                                        className={group.bookmarked ? 'active-group-heart' : 'active-group-emptyHeart'}
                                        src={group.bookmarked ? "/img/main-assets/heart.png" : "/img/main-assets/empty_heart.png"} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className='search-result-fail-container'>
                            <img src="/img/main-assets/search_fail.png" />
                            <h4>검색 결과가 없습니다.</h4>
                            <h5>오타를 수정하시거나, 다시 검색해주세요.</h5>
                        </div>
                    ))}
            </div>

            {/* 페이지네이션 */}
            {resultInfo && resultInfo.totalPages > 1 && (
                <div className='pagination'>
                    {Array.from({ length: resultInfo.totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                            onClick={() => handlePageClick(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Search;

