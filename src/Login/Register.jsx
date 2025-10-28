import './../profile/profile.css';
import './Register.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register(){
    let eye_style={
        width: 'clamp(13px, 5vw, 13px)',
        height: 'clamp(13px, 5vw, 13px)',
    }

    let eyeOpen_style={
        width: 'clamp(14px, 5vw, 14px)',
        height: 'clamp(11px, 5vw, 11px)',
    }

    let overlapping_style={
        fontSize: '12px',
        color: '#000',
    }

    let [id, setId] = useState('');
    let [pw, setPw] = useState('');
    let [pw_check, setPw_check] = useState('');

    let [id_ph, setId_ph] = useState('아이디를 입력해주세요.');
    let [pw_ph, setPw_ph] = useState('비밀번호를 입력해주세요.');
    let [pw_check_ph, setPw_check_ph] = useState('비밀번호를 다시 입력해주세요.');

    let [showPw, setShowPw] = useState(false);
    let [showPw_check, setShowPw_check] = useState(false);

    let [check, setCheck] = useState(null);
        // check가 true면 사용가능, false이면 사용 불가능
    let [samePw, setSamePw] = useState(null);

    let navigate = useNavigate();

    useEffect(()=>{
        if(pw_check!=''){
            if(pw_check==pw){
                setSamePw(true);
            }
            else{
                setSamePw(false);
            }
        }
    }, [pw_check, pw]);

    let checkNext=()=>{
        return(
            !id ||
            !pw ||
            !samePw
        )
    }

    async function checkOverlapping(){
        try{
            let res = await axios.get(`http://3.39.81.234:8080/api/auth/check-id?loginId=${id}`, {
                withCredentials: true
            });
            setCheck(res.data.available);
            console.log(res.data.available);
        }
        catch(err){
            console.log(err);
        }
    }

    async function RegisterFun(){
        try{
            let res = await axios.post("http://3.39.81.234:8080/api/auth/register", {
                loginId : `${id}`,
                password: `${pw}` 
            },{withCredentials: true});
            navigate('/');
            //console.log(res.data);
    } catch(err){
        console.log(err);
    }
    }

    return(
        <div className='main'>
                <div className='web-header'>
                    <button className='back-button' onClick={() => window.history.back()}>
                    </button>
                    <h1 className='web-title'>Focus</h1>
                </div>
                <h2 className='text-title'>환영합니다!</h2>

                <>
                    <div className='register-box-container'>
                        <h4 className='register-box-font'>아이디 입력</h4>
                        <input className='register-box-input' 
                        placeholder={id_ph}
                        onChange={(e)=>{
                            setId(e.target.value);
                        }}
                        onFocus={()=>{
                            setId_ph('');
                        }}
                        onBlur={()=>{
                            id=='' && setId_ph('아이디를 입력해주세요.');
                        }}
                        ></input>
                        <button className='overlapping-button' onClick={()=>{
                            checkOverlapping();
                        }}>
                            중복확인
                        </button>
                        <div className='overlapping-status'>
                            {
                                (check == false) ? <OverlappingFalse style={overlapping_style}/>
                                : 
                                check!=null && <OverlappingTrue style={overlapping_style}/>
                            }
                        </div>
                    </div>
                </>      

                <>
                    <div className='register-box-container'>
                    <h4 className='register-box-font'>비밀번호 입력</h4>
                        <input className='register-box-input' 
                            placeholder={pw_ph}
                            type={showPw? 'text' : 'password'}
                            onChange={(e)=>{
                                setPw(e.target.value);
                            }}
                            onFocus={()=>{
                                setPw_ph('');
                            }}
                            onBlur={()=>{
                                pw=='' && setPw_ph('비밀번호를 입력해주세요.');
                            }}
                            ></input>
                        <img src={showPw ? '/img/login/login_eyeOpen.png' : '/img/login/login_Closed.png'} 
                        onClick={()=>{
                            setShowPw(!showPw);   
                        }}  
                        className='register-box-eye'
                        style={showPw ? eyeOpen_style : eye_style}
                        ></img>
                    </div>
                </>

                <>
                    <div className='register-box-container'>
                        <h4 className='register-box-font'>비밀번호 확인</h4>
                        <input className='register-box-input' 
                            placeholder={pw_check_ph}
                            type={showPw_check? 'text' : 'password'}
                            onChange={(e)=>{
                                setPw_check(e.target.value);
                            }}
                            onFocus={()=>{
                                setPw_check_ph('');
                            }}
                            onBlur={()=>{
                                pw_check=='' && setPw_check_ph('비밀번호를 다시 입력해주세요.');
                            }}
                            ></input>
                        <img src={showPw_check ? '/img/login/login_eyeOpen.png' : '/img/login/login_Closed.png'} 
                        onClick={()=>{
                            setShowPw_check(!showPw_check);   
                        }}  
                        className='register-box-eye'
                        style={showPw_check ? eyeOpen_style : eye_style}
                        ></img>
                        <div className='same-pw-status'>
                            {
                                (samePw==true) ? <SamePw/> : 
                                samePw!=null && <NotSamePw/>
                            }
                        </div>
                    </div>
                </>

            <div className='register-button-container'>
                <button className='login-button' 
                disabled={checkNext()}
                onClick={()=>{
                    RegisterFun();
                }}
                >
                    완료
                </button>
            </div>
        </div>
    )
}

function OverlappingTrue(){
    return(
        <div>
            <h4 style={{color: 'green'}}>사용 가능한 아이디입니다.</h4>            
        </div>
    )
}

function OverlappingFalse(){
    return(
        <div>
            <h4>중복된 아이디입니다.</h4>
        </div>
    )
}

function SamePw(){
    return(
        <div>
            <h4 style={{color: 'green'}}>비밀번호가 일치합니다.</h4>
        </div>
    )
}   

function NotSamePw(){
    return(
        <div>
            <h4>비밀번호가 일치하지 않습니다.</h4>
        </div>
    )
}


export default Register;