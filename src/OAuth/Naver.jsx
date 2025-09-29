import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Profile from './../profile/profile.jsx'

function Naver(props){
    let navigate = useNavigate();
    let code = new URL(window.location.href).searchParams.get('code');

    // let data = {
    //     "accessToken"new URL(window.location.href).searchParams.get('code');
    // }
    // 만약 data에 담아서 보내달라고 하면, data를 써야함

    // 확인용
    // console.log(code);
    let [isNewUser, setIsNewUser] = useState(false);

    let headers = {
        "Content-Type": "application/x-www-form-urlencoded", //헤더
    }

    useEffect(()=> {
        // axios.post(`서버주소${code}`).then((res)=>{
        //     const accessToken = res.data.accessToken;
        //     localStorage.setItem('accessToken', accessToken);

        // })
    }, []);

    return(
        // navigate('/')
        // 신규 유저가 아니면, 서버에서 사용자 정보 받아와서 메인화면으로.
        <div>  
            {
                (isNewUser==true) && navigate('/profile')
                //이것도 <Profile>로 이동할 게 아니고, navigate를 통해서 Profile로 이동하게끔
            }
        </div>
    )
}

export default Naver;