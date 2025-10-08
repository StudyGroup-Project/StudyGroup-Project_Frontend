import { useState, useEffect } from 'react';
import './home_.css';
import './search_.css';
import { useNavigate } from 'react-router-dom';
import SearchAddress from './search_address.jsx';
import SearchCategory from './search_category.jsx';
import SearchSort from './search_sort.jsx';
import { provinceList, districtList } from './../data.js';

function Search(){
    let category = ['카테고리', 'IT', '사업', '디자인', '언어', '시험', '공부', '일상',
        '기타'
    ]

    let [newCategory, setNewCategory] = useState('카테고리');
    let [newProvince, setNewProvince] = useState('시/도');
    let [newDistrict, setNewDistrict] = useState('시/군/구');

    let [isSuccess, setIsSuccess] = useState(false);
    let [searchText, setSearchText] = useState('');

    let [searchResult, setSearchResult] = useState([]); //studies
    // let [resultInfo, setResultInfo] = useState(''); //meta
    let resultInfo = {
        "meta": {
            "page": 1,            // 현재 페이지 번호
            "limit": 10,          // 페이지당 아이템 수
            "totalCount": 42,     // 전체 아이템 개수
            "totalPages": 5,      // 전체 페이지 수 (ceil(totalCount / limit))
            "sort": "TRUST_SCORE_DESC"
          }
    }
    let [currentPage, setCurrentPage] = useState(1);
    let limit = 10;
    
    let sortList = ['최신순', '신뢰도순'];
    let [sortType, setSortType] = useState('');
    // sort 종류는 LATEST, TRUST_SCORE_DESC 두 개

    let navigate = useNavigate();

    useEffect(()=>{
        // 서버에 선택된 카테고리, 시/도, 시/군/구와 함께 계속 보내기.
        // 받은 결과를 searchResult에 담고, 이게 만약 null일 때
        // isSuccess를 false로 바꾸고, 아래에 모달창으로 결과를 띄우기.
        // newCategory가 '카테고리'일 때는 카테고리를 제외하고 보내기.
        // newProvince가 '시/도'일 때는 시/도를 제외하고 보내기.
        // newDistrict가 '시/군/구'일 때는 시/군/구를 제외하고 보내기.
        // searchText가 ''일때는 당연히 보내지 않기.
    }, [searchText]);

    return(
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
            </div>
            
            <div className='search-ing-container'>
                <div className='search-category-container'>
                    <SearchCategory category={category} setNewCategory={setNewCategory}/>
                    <span className='search-ing-line'></span>
                    <input className='search-ing-input' type='text'  
                    onChange={(e)=>{
                        setSearchText(e.target.value);
                    }}               
                    />
                </div>
                <div className='search-type-container'>
                    <div className='search-address-container'>
                    <SearchAddress provinceList={provinceList} districtList={districtList}
                    newProvince={newProvince} setNewProvince={setNewProvince}
                    newDistrict={newDistrict} setNewDistrict={setNewDistrict}
                />
                    </div>
                    <div className='search-sort-container'>
                        <img src='/img/main-assets/sort.png' className='search-sort-icon'/>
                        <SearchSort sortList={sortList} setSortType={setSortType}/>
                    </div>
                </div>
            </div>
            
            <div className='search-result-container'>
                {
                    isSuccess != null && 
                    (isSuccess ?             
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
                        : <div className='search-result-fail-container'>
                            <img src = "/img/main-assets/search_fail.png"/>
                            <h4>
                                검색 결과가 없습니다.<br />
                            </h4>
                            <h5>입력하신 검색에 대한 결과가 없습니다.<br />
                                오타를 수정하시거나, 다시 검색해주세요.
                            </h5>
                        </div>)
                }
            </div>

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
    )
}

export default Search;

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import './home_.css';
// import './search_.css';
// import { useNavigate } from 'react-router-dom';
// import SearchAddress from './search_address.jsx';
// import SearchCategory from './search_category.jsx';
// import SearchSort from './search_sort.jsx';
// import { provinceList, districtList } from './../data.js';

// function Search() {
//     let category = ['카테고리', 'IT', '사업', '디자인', '언어', '시험', '공부', '일상', '기타'];

//     let [searchPh, setSearchPh] = useState('검색어를 입력하세요');

//     // 검색 조건
//     let [newCategory, setNewCategory] = useState('카테고리');
//     let [newProvince, setNewProvince] = useState('시/도');
//     let [newDistrict, setNewDistrict] = useState('시/군/구');
//     let [isSuccess, setIsSuccess] = useState(null);
//     let [searchText, setSearchText] = useState('');

//     let [groupData, setGroupData] = useState([]);   // 받아온 스터디 리스트
//     let [resultInfo, setResultInfo] = useState(null); // meta 정보

//     let [sortType, setSortType] = useState('');
//     let [currentPage, setCurrentPage] = useState(1);
//     let limit = 10;

//     let navigate = useNavigate();

//     //🔸 검색 또는 페이지 변경 시 서버에 요청
//     useEffect(() => {
//         const fetchStudies = async () => {
//             try {
//                 const response = await axios.get('/api/studies', {
//                     params: {
//                         keyword: searchText || undefined,
//                         category: newCategory !== '카테고리' ? newCategory : undefined,
//                         province: newProvince !== '시/도' ? newProvince : undefined,
//                         district: newDistrict !== '시/군/구' ? newDistrict : undefined,
//                         page: currentPage,
//                         limit: limit,
//                         sort: sortType === '최신순' ? 'LATEST' : 'TRUST_SCORE_DESC',
//                     },
//                 });

//                 const data = response.data;

//                 if (data && data.studies) {
//                     setGroupData(data.studies); // 해당 페이지의 10개 데이터
//                     setResultInfo(data.meta);   // meta 저장
//                     setIsSuccess(true);
//                 } else {
//                     setIsSuccess(false);
//                 }
//             } catch (error) {
//                 console.error(error);
//                 setIsSuccess(false);
//             }
//         };

//         fetchStudies();
//     }, [searchText, newCategory, newProvince, newDistrict, sortType, currentPage]);

//     // 🔹 페이지 버튼 클릭 시 페이지 변경
//     const handlePageClick = (pageNum) => {
//         setCurrentPage(pageNum);
//     };

//     return (
//         <div className='home-background'>
//             <div className='web-header'>
//                 <button className='back-button' onClick={() => window.history.back()}></button>
//             </div>

//             <div className='search-ing-container'>
//                 <div className='search-category-container'>
//                     <SearchCategory category={category} setNewCategory={setNewCategory} />
//                     <span className='search-ing-line'></span>
//                     <input
//                         className='search-ing-input'
//                         type='text'
//                         placeholder={searchPh}
//                         onFocus={() => {
//                             setSearchPh('');
//                         }}
//                         onBlur={() => {
//                             setSearchPh('검색어를 입력하세요');
//                         }}
//                         onChange={(e) => {
//                             setSearchText(e.target.value);
//                             setCurrentPage(1); // 검색 변경 시 1페이지로 초기화
//                         }}
//                     />
//                 </div>
//                 <div className='search-type-container'>
//                     <div className='search-address-container'>
//                         <SearchAddress
//                             provinceList={provinceList}
//                             districtList={districtList}
//                             newProvince={newProvince}
//                             setNewProvince={setNewProvince}
//                             newDistrict={newDistrict}
//                             setNewDistrict={setNewDistrict}
//                         />
//                     </div>
//                     <div className='search-sort-container'>
//                         <img src='/img/main-assets/sort.png' className='search-sort-icon' />
//                         <SearchSort sortList={['최신순', '신뢰도순']} setSortType={setSortType} />
//                     </div>
//                 </div>
//             </div>

//             <div className='search-result-container'>
//                 {isSuccess != null &&
//                     (isSuccess ? (
//                         groupData.map((group) => (
//                             <div className='active-group-container' key={group.id}>
//                                 <h4 className='active-group-title'>{group.title}</h4>
//                                 {group.category.map((cat, j) => (
//                                     <div className='active-group-category' key={j}>
//                                         <h4># {cat}</h4>
//                                     </div>
//                                 ))}
//                                 <h4 className='active-group-bio'>{group.bio}</h4>
//                                 <div className='active-group-Curmember-container'>
//                                     <h4 className='active-group-member-count'>{group.memberCount}</h4>
//                                     <h4 className='active-group-member-text'>현재인원</h4>
//                                 </div>
//                                 <h4 className='active-group-member-bar'>/</h4>
//                                 <div className='active-group-Maxmember-container'>
//                                     <h4 className='active-group-member-count'>{group.maxMemberCount}</h4>
//                                     <h4 className='active-group-member-text'>전체인원</h4>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <div>검색 결과가 없습니다.</div>
//                     ))}
//             </div>

//             {/* 🔸 페이지네이션 */}
//             {resultInfo && resultInfo.totalPages > 1 && (
//                 <div className='pagination'>
//                     {Array.from({ length: resultInfo.totalPages }, (_, i) => (
//                         <button
//                             key={i + 1}
//                             className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
//                             onClick={() => handlePageClick(i + 1)}
//                         >
//                             {i + 1}
//                         </button>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Search;
