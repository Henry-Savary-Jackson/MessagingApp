import { createCookie, MemoryRouter, Route, Routes } from 'react-router-dom'
import LoginForm from './pages/LoginForm.jsx';
import RegisterForm from './pages/RegisterForm.jsx';
import ChatPage from './pages/ChatPage.jsx';
import PrivateRoute from './PrivateRoute';
import { setAxiosCSRF, getCSRF } from '../utils/RequestUtils.js';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie'
import { userContext, userIdContext } from '../globals.js'
import { broker_url } from '../utils/WebsocketUtils.js';
import { useStompClient, withStompClient, useSubscription, StompSessionProvider } from 'react-stomp-hooks'
import ProfilePage from './pages/ProfilePage.jsx';

function App() {

  let [cookies, setCookies, removeCookies] = useCookies()
  let [user, setUser] = useState(cookies.user || "")
  let [user_id, setUserId] = useState(cookies.user_id || "")
  let [csrf, setCSRF] = useState("")

  useEffect(() => {
    (async () => { setCSRF(setAxiosCSRF(await getCSRF())) })()
  }, [])


  let setUserCallback = (username, user_id) => {
    setUser(username)
    setUserId(user_id)
    setCookies("user", username)
    
    setCookies("user_id", user_id)
  }
  let logoutCallback = () => {
    setUser("")
    removeCookies("user")
    removeCookies("user_id")
  }


  return < userContext.Provider value={[user, setUser]}>
    <userIdContext.Provider value={[user_id, setUserId]}>
      <MemoryRouter>
        <Routes>
          <Route element={<PrivateRoute auth={user} />} >
            <Route element={
              <ChatPage logoutCallback={logoutCallback} />
            } path='/' />
          </Route>
          <Route element={<PrivateRoute auth={user} />} >
            <Route element={
              <ProfilePage />
            } path='/profile' />
          </Route>
          <Route element={<LoginForm setUserCallback={setUserCallback} />} path='/login' />
          <Route element={<RegisterForm setUserCallback={setUserCallback} />} path='/register' />
        </Routes>
      </MemoryRouter>
    </userIdContext.Provider>
  </userContext.Provider>;

}

export default App;
