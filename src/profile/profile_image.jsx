import './profile_image.css';
import './profile.css';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileImage(){

    let [profileImg, setProfileImg] = useState(null);
    let imgRef = useRef(null);
    let navigate = useNavigate();

    function saveImgFile(){
        let file = imgRef.current.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setProfileImg(reader.result);
        }
    }

    return(
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
                        onClick={()=>{
                            //다음 누르면 프로필 이미지 서버에 전송
                            //다시 로그인으로 이동
                            navigate('/login');
                        }}
                        >{profileImg ? '다음' : '건너뛰기'}
                    </button>
                </div>
        </div>
    )    
}

export default ProfileImage;