import './group_profile.css';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

function GroupProfile() {
    let { id } = useParams();

    // 서버로부터 받아와야할 정보
    let [groupData, setGroupData] = useState({
        title: '그룹 이름',
        maxMemberCount: 6,
        memberCount: 6,
        bio: 'UI/UX, 그래픽 디자인에 관심 있는 사람들과 실제 프로젝트나 모의 과제를 함께 풀며 디자인 감각을 키우는 스터디입니다.\n'
            + '🎨 디자인 툴을 막 배우기 시작했는데, 꾸준히 연습하고 싶은 분\n'
            + '🖌️ UI/UX나 그래픽 포트폴리오를 준비하는 분\n'
            + '✍️ 혼자 공부하기 지치고, 피드백이 필요한 분\n',
        category: ['IT'],
        province: '경상북도',
        district: '경산시',
        recruitStatus: 'OPEN',
        trustScore: 0,
        applicationStatus: 'SUBMITTED',
        canApply: '',
        leader: {
            id: 0,
            nickname: '홍길동',
            profileImageUrl: '/img/main-assets/default_profile.png',
        }
    });
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
                        {groupData.bio}
                    </h4>
                    <h4 className='group-profile-catalog-address'>활동 지역</h4>
                    <h4 className='group-profile-text'>{groupData.province} {groupData.district}</h4>
                    <h4 className='group-profile-catalog-category'>카테고리</h4>
                    <Category selected={groupData.category} setUserData={setGroupData} />
                </div>
                {
                    groupData.recruitStatus === 'OPEN' ?
                        (groupData.applicationStatus === 'SUBMITTED' ?
                            <button className='group-profile-waiting-button'>
                                승인 대기
                            </button>
                            :
                            <button className='group-profile-button'>
                                지원하기
                            </button>)
                        :
                        <button className='group-profile-button'
                            disabled={true}>
                            모집 마감
                        </button>
                }
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