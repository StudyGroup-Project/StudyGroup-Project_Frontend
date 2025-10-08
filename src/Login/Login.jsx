import './../profile/profile.css';
import './Login.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

function Login(){
    let img_style={
        width: 'clamp(21px, 5vw, 21px)',
        height: 'clamp(20px, 5vw, 20px)',
    }

    let eye_style={
        width: 'clamp(13px, 5vw, 13px)',
        height: 'clamp(13px, 5vw, 13px)',
    }

    let eyeOpen_style={
        width: 'clamp(14px, 5vw, 14px)',
        height: 'clamp(11px, 5vw, 11px)',
    }

    let [id, setId] = useState('');
    let [pw, setPw] = useState('');
    let [id_ph, setId_ph] = useState('enter_your_id_here');
    let [pw_ph, setPw_ph] = useState('enter_your_password_here');
    let [showPw, setShowPw] = useState(false);
    let [token, setToken] = useState(null);

    let [Ann, setAnn] = useState({});

    let checkEmpty=()=>{
        return(
            !id ||
            !pw
        )
    }

    async function loginFun(){
        try{
            let res = await axios.post("http://3.39.81.234:8080/api/auth/login", {
                loginId : `${id}`,
                password: `${pw}` 
            },{withCredentials: true});
            res.data.title;
    } catch(err){
        console.log(err);
    }
    }

    useEffect(()=>{
        if(token){
            console.log(token);
        }
    }, [token]);

    // function loginFun(){
    //     window.location.href="http://3.39.81.234:8080/api/auth/login";
    // }

    return(
        <div className='main'>
            <div className='web-header'>
                <button className='back-button' onClick={() => window.history.back()}>
                </button>
                <h1 className='web-title'>Focus</h1>
            </div>
            <h2 className='text-title'>로그인</h2>
            <>
                <div className='login-box-container'>
                    <img style={img_style} className='login-box-image' src='/img/login/login_id.png'></img>
                    <h4 className='login-box-font'>
                        아이디
                    </h4>
                    <input className='login-box-input' 
                    placeholder={id_ph}
                    onChange={(e)=>{
                        setId(e.target.value);
                    }}
                    onFocus={()=>{
                        setId_ph('');
                    }}
                    onBlur={()=>{
                        id=='' && setId_ph('enter_your_id_here');
                    }}
                    ></input>
                    <span className='login-box-line'></span>
                </div>
            </>      
            <>
                <div className='login-box-container'>
                    <img style={img_style} className='login-box-image' src='/img/login/login_password.png'></img>
                    <h4 className='login-box-password-font'>
                        비밀번호
                    </h4>
                    <input className='login-box-input' 
                    placeholder={pw_ph}
                    type={showPw? 'text' : 'password'}
                    onChange={(e)=>{
                        setPw(e.target.value);
                    }}
                    onFocus={()=>{
                        setPw_ph('');
                    }}
                    onBlur={()=>{
                        pw=='' && setPw_ph('enter_your_password_here');
                    }}
                    ></input>
                    <img src={showPw ? '/img/login/login_eyeOpen.png' : '/img/login/login_Closed.png'} 
                    onClick={()=>{
                        setShowPw(!showPw);   
                    }}  
                    className='login-box-eye'
                    style={showPw ? eyeOpen_style : eye_style}
                    ></img>
                    <span className='login-box-line'></span>
                </div>
            </>
            <div className='login-button-container'>
                <button className='login-button' 
                disabled={checkEmpty()}
                onClick={()=>{
                    loginFun();
                }}
                >
                    로그인
                </button>
            </div>
        </div>
    )
}

export default Login;