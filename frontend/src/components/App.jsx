import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import LoginForm from './pages/LoginForm.jsx';
import RegisterForm from './pages/RegisterForm.jsx';
import ChatPage from './pages/ChatPage.jsx';
import PrivateRoute from './PrivateRoute';
import { setAxiosCSRF, getCSRF, setSignedPrekey } from '../utils/RequestUtils.js';
import { useEffect, useState } from 'react';
import { username_context, user_id_context, csrf_context, identity_context } from '../globals.js'
import useIdentityInformation from '../hooks/useIdentityInformation.js';
import { updateSignedPrekey } from '../utils/StorageUtils.js';
import { useCookies } from 'react-cookie'
import { broker_url } from '../utils/MessagingUtils.js';
import { StompSessionProvider } from 'react-stomp-hooks'
import ProfilePage from './pages/ProfilePage.jsx';
import LoadingLogin from './pages/LoadingLogin.jsx';

function App() {

  let [csrf, setCSRF] = useState("")

  // use cookies to store last message received
  let [cookies, setCookies, removeCookies] = useCookies()

  let [ident_info, set_ident_info] = useIdentityInformation()
  let [user_id, set_user_id] = useState(cookies.user_id || "")
  let [username, set_username] = useState(cookies.username || "")

  async function do_signed_prekey_update() {
    let new_prekey_info = await updateSignedPrekey(user_id)
    await setSignedPrekey(...new_prekey_info)
  }

  useEffect(() => {
    let ignore = false
    async function do_csrf_update() {
      let new_csrf = await getCSRF();
      if (!ignore) {
        setCSRF(setAxiosCSRF(new_csrf))
      }
    }
    do_csrf_update()
    return () => { ignore = true }
  }, [user_id, ident_info])

  useEffect(() => {
    if (ident_info && new Date().getTime() > ident_info.expiration) {
      do_signed_prekey_update()
    }

  }, [ident_info])

  let setUserCallback = (username, user_id) => {
    set_username(username)
    set_user_id(user_id)
    setCookies("username", username)
    setCookies("user_id", user_id)
  }
  let logoutCallback = () => {
    set_username("")
    set_user_id("")
    removeCookies("username")
    removeCookies("user_id")
  }

  return <identity_context.Provider value={[ident_info, set_ident_info]}>
    <username_context.Provider value={[username, set_username]}>
      <user_id_context.Provider value={[user_id, set_user_id]}>
        <csrf_context.Provider value={[csrf, async ()=>{setCSRF(setAxiosCSRF(await getCSRF()))}]}>
          <MemoryRouter>
            <Routes>
              <Route element={<PrivateRoute auth={user_id && ident_info} redirect_route='/' />} >
                <Route element={
                  <ProfilePage />
                } path='/profile' />
              </Route>
              <Route element={<PrivateRoute auth={user_id && ident_info} redirect_route="/" />}>
                <Route element={user_id && ident_info && < StompSessionProvider
                  url={broker_url} >
                  <ChatPage ident_info={ident_info} set_ident_info={set_ident_info} logoutCallback={logoutCallback} />
                </StompSessionProvider >} path='/chat' />
              </Route>
              <Route element={<LoginForm setUserCallback={setUserCallback} />} path='/login' />
              <Route element={<RegisterForm setUserCallback={setUserCallback} />} path='/register' />
              <Route element={<LoadingLogin setUserCallback={setUserCallback} />} path='/' />
            </Routes>
          </MemoryRouter>
        </csrf_context.Provider>
      </user_id_context.Provider>
    </username_context.Provider>
  </identity_context.Provider>

}

export default App;
