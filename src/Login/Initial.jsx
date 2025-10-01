import axios from 'axios';
import './Initial.css';
import {useNavigate} from 'react-router-dom';

/* 로그인 방법 선택하는 컴포넌트 */

let semiTitleStyle={
    fontFamily: 'Yusei Magic, Arial, sans-serif',
    color: '#fff',
    fontSize: 'clamp(20px, 4vw, 24px)',
    fontWeight: '400',
    lineHeight: '1.2',
    textAlign: 'center',
    margin: '0',
}

let passwordFontStyle={
    fontFamily: 'Roboto, Arial, sans-serif',
    color: '#3D348B',
    fontSize: 'clamp(14px, 3vw, 16px)',
    fontWeight: '500',
    lineHeight: '1.2',
    textAlign: 'center',
    margin: '0 0 0 0',
}

let signupFontStyle=(props)=>{
    return({
        fontFamily: 'Roboto, Arial, sans-serif',
        color: `${props.color}`,
        fontSize: 'clamp(14px, 3vw, 16px)',
        fontWeight: `${props.fontWeight}`,
        lineHeight: '1.2',
    })
}

function Initial(){
    let array = ['Google', 'Naver', 'KakaoTalk'];
    let navigate = useNavigate();

    return(
        <>
            <div className='login-container'>
                <h4 style={semiTitleStyle}>로그인</h4>
                
                <button className='id-password' onClick={()=>{
                    navigate('/login')
                }}>
                    <p style={passwordFontStyle}>아이디/비밀번호 입력</p>
                </button>

                <h4 style={semiTitleStyle}>OR</h4>

                <div className='login-button-container'>
                    {
                        array.map(function(a, i){
                            return(
                                <LoginButton array={array} i = {i}key = {i}/>
                            )
                        })
                    }
                </div>

                <div className='signup-container'>
                    <p style={signupFontStyle({color: '#fff', fontWeight: '300'})}>회원이 아니신가요?</p>
                    <p style={signupFontStyle({color: '#F35b04', fontWeight: '500'})}>회원가입</p>
                </div>
            </div>
        </>
        
    )
}

function LoginButton(props){
    let kakao = () => {
        let link = "http://3.39.81.234:8080/oauth2/authorization/kakao";
        window.location.href = link;
    }

    let google = () =>{
        let link = "http://ec2-3-39-81-234.ap-northeast-2.compute.amazonaws.com:8080/oauth2/authorization/google"
        window.location.href = link;
    }

    let naver = () =>{
        let link = "http://3.39.81.234:8080/oauth2/authorization/naver"
        window.location.href = link;
    }


    let font_style={
        fontFamily: 'Yusei Magic, Arial, sans-serif',
        color: '#3D348B',
        fontSize: 'clamp(10px, 2vw, 12px)',
        margin: '2px 0 0 0',
        textAlign: 'center',
    }
    let img_style={
        width: 'clamp(24px, 5vw, 30px)',
        height: 'clamp(24px, 5vw, 30px)',
    }
    
    let loginFun = () =>{
        props.array[props.i] == 'KakaoTalk' && kakao();
        props.array[props.i] == 'Google' && google();
        props.array[props.i] == 'Naver' && naver();
    }

    return(
        <div className='social-login-button' onClick={loginFun}>
            <img 
            src={`/img/login-button/${props.array[props.i]}.png`}
            style={img_style}
            >
            </img>
            <h4 style={font_style}>{props.array[props.i]}</h4>
        </div>
    )
}

/*
    로그인 버튼 지금 배경색 말고 좀 더 밝은 색으로 하면
    소셜 로그인 버튼 배경을 그냥 이미지 색으로 하면 괜찮을듯?
*/


export default Initial;