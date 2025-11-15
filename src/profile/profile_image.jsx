import './profile_image.css';
import './profile.css';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProfileImage() {

    let [profileImg, setProfileImg] = useState(null);
    let imgRef = useRef(null);
    let navigate = useNavigate();

    function saveImgFile() {
        let file = imgRef.current.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setProfileImg(reader.result);
        }
    }

    async function getAccessToken() {
        try {
            let res = await axios.post('http://3.39.81.234:8080/api/auth/token', {
                refreshToken: localStorage.getItem("refreshToken")
            }, { withCredentials: true });
            localStorage.setItem('accessToken', res.data.accessToken);
        }
        catch (err) {
            console.log(err);
        }
    }

    async function uploadProfileImage() {
        const formData = new FormData();

        let file = imgRef.current?.files[0];

        if (!file) {
            const defaultImgUrl = '/img/main-assets/default_profile.png';
            const response = await fetch(defaultImgUrl);
            const blob = await response.blob();
            file = new File([blob], 'default_profile.png', { type: blob.type });
        }

        formData.append('file', file);

        try {
            const accessToken = localStorage.getItem('accessToken'); // JWT가 필요하면
            const res = await axios.post(
                'http://3.39.81.234:8080/api/users/me/profile/image',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${accessToken}` // JWT 필요 시
                    },
                    withCredentials: true // 쿠키 기반 인증이 필요하면
                }
            );
            console.log(res.data);
        } catch (err) {
            console.error(err.response?.data || err);
        }
    }


    return (
        <div className='main'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}></button>
            </div>

            <h1 className='title-text'>프로필 설정</h1>
            <img className='profileImg' src={profileImg ? profileImg : '/img/main-assets/default_profile.png'} />
            <label className="profileImg-label" htmlFor="profileImg">프로필 이미지 추가</label>
            <input
                className="profileImg-input"
                type="file"
                accept="image/*"
                id="profileImg"
                ref={imgRef}
                onChange={saveImgFile}
            />
            <div className='profileimage-button-container'>
                <button
                    className='profileimage-next-button'
                    onClick={async () => {
                        await getAccessToken();
                        await uploadProfileImage();
                        navigate('/home');
                    }}
                >{profileImg ? '다음' : '건너뛰기'}
                </button>
            </div>
        </div>
    )
}

export default ProfileImage;
