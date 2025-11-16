import './group_profile.css';
import { useParams, useLocation } from 'react-router-dom';
import { useState } from 'react';
import ApplicationModal from '../common/GroupRegisterForm.jsx';

function GroupProfile() {
    let { studyId } = useParams();
    let location = useLocation();

    let [groupData, setGroupData] = useState(location.state?.groupProfileData || {});
    let [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className='home-background'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
            </div>

            <div className='group-profile-container'>
                <div className='group-profile-top-container'>
                    <img src="/img/groupProfile/groupProfile_title.png"
                        className='group-profile-title-image'
                    />
                    <h4 className='group-profile-title-text'>{groupData.title}</h4>
                    <img src={groupData.leader.profileImageUrl} className='group-profile-host-image' />
                    <div className='group-profile-host-name-container'>
                        <h4 className='group-profile-host-name-text'>방장</h4>
                        <h5 className='group-profile-host-name'>{groupData.leader.nickname}</h5>
                    </div>
                    <div className='group-profile-Curmember-container'>
                        <h4 className='group-profile-member-count'>{groupData.memberCount}</h4>
                        <h5 className='group-profile-member-text'>현재인원</h5>
                    </div>
                    <h4 className='group-profile-member-bar'>/</h4>
                    <div className='group-profile-Maxmember-container'>
                        <h4 className='group-profile-member-count'>{groupData.maxMemberCount}</h4>
                        <h5 className='group-profile-member-text'>전체인원</h5>
                    </div>
                </div>

                <div className='group-profile-bottom-container'>
                    <h4 className='group-profile-catalog-introduction'>그룹 소개</h4>
                    <h4 className='group-profile-text' style={{ whiteSpace: 'pre-line' }}>
                        {groupData.description}
                    </h4>
                    <h4 className='group-profile-catalog-address'>활동 지역</h4>
                    <h4 className='group-profile-text'>{groupData.province} {groupData.district}</h4>
                    <h4 className='group-profile-catalog-category'>카테고리</h4>
                    <Category selected={groupData.category} setUserData={setGroupData} />
                </div>
                {
                    (groupData.recruitStatus === 'CLOSED') ?
                        <button className='group-profile-button' disabled={true}>
                            모집 마감
                        </button>

                        : (groupData.applicationStatus === 'SUBMITTED') ?
                            <button className='group-profile-waiting-button' disabled={true}>
                                승인 대기
                            </button>

                            :
                            <button
                                className='group-profile-button'
                                onClick={() => setIsModalOpen(true)}
                                disabled={groupData.canApply === false}
                            >
                                지원하기
                            </button>
                }

                {isModalOpen && (
                    <ApplicationModal
                        studyId={studyId}
                        onClose={() => setIsModalOpen(false)}
                        onSubmitSuccess={() => {
                            setIsModalOpen(false);
                        }}
                    />
                )}
            </div>
        </div>
    )
}

function Category(props) {
    let selected = props.selected;
    let setUserData = props.setUserData;

    return (
        <div className='group-profile-category-card'>
            {
                selected.map(function (a, i) {
                    return (
                        <div key={i} className='group-profile-categories'>
                            <span>{`# ${selected[i]}`}</span>
                            <span style={{ cursor: 'pointer', color: 'red' }}
                                onClick={() => {
                                    let copy = [...selected];
                                    let arr = copy.filter((item) => item != selected[i]);
                                    setUserData(prev => ({
                                        ...prev,
                                        category: [...arr]
                                    }));
                                }}
                            ></span>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default GroupProfile;