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

    let navigate = useNavigate();

    async function handleSearch() {
        try {
            // 검색어 없으면 결과 숨김
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

    // 페이지 넘기기
    const handlePageClick = (pageNum) => {
        setCurrentPage(pageNum);
    };

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
                            <div className='active-group-container' key={group.id}>
                                <h4 className='active-group-title'>{group.title}</h4>

                                {/* category는 문자열 */}
                                <div className='active-group-category'>
                                    <h4># {group.category}</h4>
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

