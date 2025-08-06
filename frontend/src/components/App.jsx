import { createCookie, MemoryRouter, Route, Routes } from 'react-router-dom'
import LoginForm from './pages/LoginForm.jsx';
import RegisterForm from './pages/RegisterForm.jsx';
import ChatPage from './pages/ChatPage.jsx';
import PrivateRoute from './PrivateRoute';
import { setAxiosCSRF, getCSRF } from '../utils/RequestUtils.js';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie'
import { userContext } from '../globals.js'
import { broker_url } from '../utils/WebsocketUtils.js';
import { useStompClient, withStompClient, useSubscription, StompSessionProvider } from 'react-stomp-hooks'

function App() {

  let [cookies, setCookies, removeCookies] = useCookies()
  let [user, setUser] = useState(cookies.user || "")
  let [csrf , setCSRF ] = useState("")

  useEffect(() => {
    (async () => { setCSRF(setAxiosCSRF(await getCSRF()) )})()
  }, [])


  let setUserCallback = (username) => {
    setUser(username)
    setCookies("user", username)
  }
  let logoutCallback = () => {
    setUser("")
    removeCookies("user")
  }


  return < userContext.Provider value={[user, setUser]}>
    <MemoryRouter>
      <Routes>
        <Route element={<PrivateRoute auth={user} />} >
          <Route element={
            csrf && <StompSessionProvider connectHeaders={{ "X-CSRF-TOKEN": csrf }} enabled={false} brokerURL={broker_url}  >
              <ChatPage logoutCallback={logoutCallback} />
            </StompSessionProvider>} path='/' />
        </Route>
        <Route element={<LoginForm setUserCallback={setUserCallback} />} path='/login' />
        <Route element={<RegisterForm setUserCallback={setUserCallback} />} path='/register' />
      </Routes>
    </MemoryRouter>
  </userContext.Provider>;

}

export default App;
