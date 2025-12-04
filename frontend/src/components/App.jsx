import { createCookie, MemoryRouter, Route, Routes } from 'react-router-dom'
import LoginForm from './pages/LoginForm.jsx';
import RegisterForm from './pages/RegisterForm.jsx';
import ChatPage from './pages/ChatPage.jsx';
import PrivateRoute from './PrivateRoute';
import { setAxiosCSRF, getCSRF, setSignedPrekey } from '../utils/RequestUtils.js';
import { useContext, useEffect, useState } from 'react';
import { csrf_context, identity_context } from '../globals.js'
import { updateSignedPrekey, useIdentityInformation } from '../utils/StorageUtils.js';
import { useIndexedDB } from '../utils/StorageUtils.js';
import { broker_url } from '../utils/WebsocketUtils.js';
import { StompSessionProvider } from 'react-stomp-hooks'
import ProfilePage from './pages/ProfilePage.jsx';
import LoadingLogin from './pages/LoadingLogin.jsx';

function App() {

  let [csrf, setCSRF] = useState("")

  let { db, loading } = useIndexedDB()
  let [ident_info, set_ident_info] = useIdentityInformation(db, user_id)
  let [logged_in, set_logged_in ] = useState(false)

  async function set_csrf() {
    let new_token = setAxiosCSRF(await getCSRF());
    setCSRF(new_token)
    return new_token
  }

  async function do_signed_prekey_update(){
      let new_prekey_info =await updateSignedPrekey(db)
      await setSignedPrekey(...new_prekey_info)

  }

  useEffect(() => {
    set_csrf()
  }, [])

  useEffect(() => {
    if (new Date().getTime() > ident_info.expiration) {
      do_signed_prekey_update()
    }

  }, [ident_info])

  useEffect(()=>{
    
  }, [ident_info])


  let setUserCallback = (username, user_id) => {
  }
  let logoutCallback = () => {
  }


  return <identity_context.Provider value={[ident_info, set_ident_info]}>
      <csrf_context.Provider value={[csrf, setCSRF]}>
        <MemoryRouter>
          <Routes>
            <Route element={<PrivateRoute auth={ident_info} />} >
              <Route element={
                logged_in  ?  <StompSessionProvider connectHeaders={{ "X-CSRF-TOKEN": csrf }} url={broker_url}>
                  <ChatPage logoutCallback={logoutCallback} />
                </StompSessionProvider> : <LoadingLogin set_logged_in={set_logged_in} />
              } path='/' />
            </Route>
            <Route element={<PrivateRoute auth={user} />} >
              <Route element={
                <ProfilePage />
              } path='/profile' />
            </Route>
            <Route element={<LoginForm />} path='/login' />
            <Route element={<RegisterForm />} path='/register' />
          </Routes>
        </MemoryRouter>
      </csrf_context.Provider>
  </identity_context.Provider>
    ;

}

export default App;
