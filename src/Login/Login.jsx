import './../profile/profile.css';
import './Login.css';
import { useState } from 'react';
import axios from 'axios';

function Login() {
    let img_style = {
        width: 'clamp(21px, 5vw, 21px)',
        height: 'clamp(20px, 5vw, 20px)',
    };

    let eye_style = {
        width: 'clamp(13px, 5vw, 13px)',
        height: 'clamp(13px, 5vw, 13px)',
    };

    let eyeOpen_style = {
        width: 'clamp(14px, 5vw, 14px)',
        height: 'clamp(11px, 5vw, 11px)',
    };

    let [id, setId] = useState('');
    let [pw, setPw] = useState('');
    let [id_ph, setId_ph] = useState('아이디를 입력해 주세요.');
    let [pw_ph, setPw_ph] = useState('비밀번호를 입력해 주세요.');
    let [showPw, setShowPw] = useState(false);

    let checkEmpty = () => {
        return !id || !pw;
    };

    async function loginFun() {
    try {
        let res = await axios.post(
            "http://3.39.81.234:8080/api/auth/login",
            {
                loginId: id,
                password: pw
            },
            {
                withCredentials: true
            }
        );

        const { accessToken, refreshToken, profileExists, redirectUrl } = res.data;

        // 토큰 저장
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);

        // redirectUrl 검사
        if (!redirectUrl) {
            alert("로그인 성공! 하지만 redirectUrl이 없습니다.");
            return;
        }

        // 1) 홈으로 이동하는 경우 → API 호출 먼저
        if (redirectUrl.includes("/home")) {
            // Bearer 토큰 포함해서 API 요청
            try {
                const homeRes = await axios.get(
                    "http://3.39.81.234:8080/api/home",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        withCredentials: true
                    }
                );

                console.log("Home 데이터:", homeRes.data);

                // 성공하면 홈 페이지로 이동
                window.location.href = redirectUrl;

            } catch (apiErr) {
                console.log("Home API 호출 실패:", apiErr);
                alert("홈 데이터를 가져오는 중 오류가 발생했습니다.");
            }
        } 
        // 2) 프로필 설정 페이지로 이동하는 경우 → 단순 이동
        else if (redirectUrl.includes("/profile")) {
            window.location.href = redirectUrl;
        }
        // 3) 기타 URL도 그냥 이동
        else {
            window.location.href = redirectUrl;
        }

    } catch (err) {
        console.log(err);
        alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
}


    return (
        <div className='main'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}></button>
                <h1 className='web-title'>Focus</h1>
            </div>

            <h2 className='text-title'>로그인</h2>

            <div className='login-box-container'>
                <img style={img_style} className='login-box-image' src='/img/login/login_id.png' />
                <h4 className='login-box-font'>아이디</h4>
                <input
                    className='login-box-input'
                    value={id}
                    placeholder={id_ph}
                    onChange={(e) => setId(e.target.value)}
                    onFocus={() => setId_ph('')}
                    onBlur={() => {
                        id === '' && setId_ph('아이디를 입력해 주세요.');
                    }}
                />
                <span className='login-box-line'></span>
            </div>

            <div className='login-box-container'>
                <img style={img_style} className='login-box-image' src='/img/login/login_password.png' />
                <h4 className='login-box-password-font'>비밀번호</h4>

                <input
                    className='login-box-input'
                    value={pw}
                    type={showPw ? 'text' : 'password'}
                    placeholder={pw_ph}
                    onChange={(e) => setPw(e.target.value)}
                    onFocus={() => setPw_ph('')}
                    onBlur={() => {
                        pw === '' && setPw_ph('비밀번호를 입력해 주세요.');
                    }}
                />

                <img
                    src={showPw ? '/img/login/login_eyeOpen.png' : '/img/login/login_Closed.png'}
                    onClick={() => setShowPw(!showPw)}
                    className='login-box-eye'
                    style={showPw ? eyeOpen_style : eye_style}
                />
                <span className='login-box-line'></span>
            </div>

            <div className='login-button-container'>
                <button
                    className='login-button'
                    disabled={checkEmpty()}
                    onClick={loginFun}
                >
                    로그인
                </button>
            </div>
        </div>
    );
}

export default Login;
