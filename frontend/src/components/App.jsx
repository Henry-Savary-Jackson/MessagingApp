import { createCookie, MemoryRouter, Route, Routes } from 'react-router-dom'
import LoginForm from './pages/LoginForm.jsx';
import RegisterForm from './pages/RegisterForm.jsx';
import ChatPage from './pages/ChatPage.jsx';
import PrivateRoute from './PrivateRoute';
import { setAxiosCSRF , getCSRF} from '../utils/RequestUtils.js';
import { useEffect, useState } from 'react';

import { userContext } from '../globals.js'

function App() {

  let [user, setUser] = useState("")

  useEffect(() => {
    (async ()  => { setAxiosCSRF(await getCSRF()) })()
  }, [])


  return < userContext.Provider value={[user, setUser]}>
      <MemoryRouter>
        <Routes>
          <Route element={<PrivateRoute auth={user} />} >
            <Route element={<ChatPage />} path='/' />
          </Route>
          <Route element={<LoginForm />} path='/login' />
          <Route element={<RegisterForm />} path='/register' />
        </Routes>
      </MemoryRouter>
  </userContext.Provider>;

}

export default App;
