import { useState, useEffect } from 'react'
import './index.css'
import './App.css'
import Initial from './Login/Initial.jsx';
import Profile from './profile/profile.jsx';
import Login from './Login/Login.jsx';
import Register from './Login/Register.jsx';
import ProfileImage from './profile/profile_image.jsx';
import { Routes, Route } from 'react-router-dom';
import Kakao from './OAuth/Kakao.jsx';
import Google from './OAuth/Google.jsx';
import Naver from './OAuth/Naver.jsx';  
import Home from './home/home.jsx';
import Notification from './notification/notification.jsx';
import Home from './home/home_.jsx';
import Bookmarked from './Bookmarked/bookmarked_.jsx';
import MyGroup from './MyGroup/my_group.jsx';
import MyProfile from './profile/my_profile.jsx';
import {ChangeNickname, ChangeAddress, ChangeJob, ChangeCategory} from './profile/my_profile_settings.jsx';
import Search from './home/search_.jsx';


function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 3초 후 로딩 완료
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    //잠시 0.5초로 설정하고 추후 3초로 변경

    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Routes>
        <Route path='/' element={
          <div className="initial">
            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <h4 className="logo">
                  Focus
                </h4>
              </div>
            ) : (
              <>
                <h4 className="logo">
                  Focus
                </h4>
                <div className='login-container'>
                  <Initial/>
                </div>
              </>
            )
          }
          </div>}
        />
        <Route path='home' element={<Home/>}/>
        <Route path='oauth/kakao' element={<Kakao/>}/>
        <Route path='oauth/google' element={<Google/>}/>
        <Route path='oauth/naver' element={<Naver/>}/>
        <Route path='profile' element={<Profile/>}/>
        <Route path='profileimage' element={<ProfileImage/>}/>
        <Route path='login' element={<Login/>}/>
        <Route path='register' element={<Register/>}/>
        <Route path='bookmarked' element={<Bookmarked/>}/>
        <Route path='mygroup' element={<MyGroup/>}/>
        <Route path='myprofile' element={<MyProfile/>}/>
        <Route path='newnickname' element={<ChangeNickname/>}/>
        <Route path='newaddress' element={<ChangeAddress/>}/>
        <Route path='newjob' element={<ChangeJob/>}/>
        <Route path='newcategory' element={<ChangeCategory/>}/>
        <Route path='search' element={<Search/>}/>
        {/* <Route path='oauth/google' element={<Google/>}/>
        <Route path='oauth/naver' element={<Naver/>}/> */}
        <Route path='notification' element={<Notification/>}/>
      </Routes>
    </>
  )
}



export default App
