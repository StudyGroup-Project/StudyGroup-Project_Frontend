import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import './../home_.css';
import './addGroup_.css';
import axios from 'axios';
import HeadCount from './head_count.jsx';
import { CustomSelect } from './category_select.jsx';
import AddressSelect from './address_select.jsx';
import { provinceList, districtList } from './../../data.js';

function addGroup() {
    let navigate = useNavigate();
    let category = ['IT', '사업', '디자인', '언어', '시험', '공부', '일상',
        '기타'
    ]
    let [groupData, setGroupData] = useState({
        title: '',
        maxMemberCount: 0,
        category: [],
        province: '',
        district: '',
        bio: '',
        description: ''
    });
    let [province, setProvince] = useState(provinceList[0]);
    let [district, setDistrict] = useState(districtList[provinceList[0]][0]);

    useEffect(() => {
        setGroupData(prev => ({
            ...prev,
            province: province,
            district: district
        }));
    }, [province, district]);

    return (
        <div className="home-background">
            <div className='addGroup-web-header'>
                <button className='back-button' onClick={() => window.history.back()}></button>
            </div>

            <div className='addGroup-container'>
                <h4 className='addGroup-info'>그룹명</h4>
                <div className='addGroup-box' >
                    <input className='addGroup-input'
                        type='text'
                        placeholder='그룹명을 입력해 주세요'
                        onChange={(e) => {
                            setGroupData(prev => ({
                                ...prev,
                                title: e.target.value
                            }));
                        }}
                    />
                </div>

                <div className='head-count-container'>
                    <h4 className='head-count-info'>모집 인원</h4>
                    <HeadCount headCount={groupData.maxMemberCount} setHeadCount={(count) => {
                        setGroupData(prev => ({
                            ...prev,
                            maxMemberCount: count
                        }));
                    }} />
                </div>

                <h4 className='addGroup-info'>카테고리</h4>
                <CustomSelect list={category} setGroupData={setGroupData} />

                <h4 className='addGroup-info'>위치</h4>
                <div className='addGroup-address-container'>
                    <AddressSelect provinceList={provinceList} districtList={districtList} setProvince={setProvince} setDistrict={setDistrict} />
                </div>

                <h4 className='addGroup-info-secondary'>간단한 소개</h4>
                <div className='addGroup-box' >
                    <textarea className='addGroup-input'
                        placeholder='간단한 소개를 입력해 주세요 (30자 이내)'
                        maxLength={30}
                        onChange={(e) => {
                            setGroupData(prev => ({
                                ...prev,
                                bio: e.target.value
                            }));
                        }}
                    />
                </div>

                <h4 className='addGroup-info-third'>그룹 설명</h4>
                <div className='addGroup-box-large' >
                    <textarea className='addGroup-input-large'
                        placeholder='그룹 설명을 입력해 주세요'
                        onChange={(e) => {
                            setGroupData(prev => ({
                                ...prev,
                                description: e.target.value
                            }));
                        }}
                    />
                </div>

                <div className='addGroup-button-container'>
                    <button className='addGroup-button'
                        onClick={() => {
                            //서버에 보내기
                            navigate('/home');
                        }}
                    >생성</button>
                    <button className='addGroup-button'
                        onClick={() => {
                            navigate('/home');
                        }}
                    >취소</button>
                </div>
            </div>
        </div>
    )
}

export default addGroup;