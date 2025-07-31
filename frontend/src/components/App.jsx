import { createCookie, MemoryRouter, Route, Routes } from 'react-router-dom'
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ChatWindow from './ChatWindow';
import PrivateRoute from './PrivateRoute';
import { setAxiosCSRF , getCSRF} from '../utils/RequestUtils.js';
import { useEffect, useContext, useState } from 'react';

import { userContext, csrfContext } from '../globals.js'

function App() {

  let [user, setUser] = useState(``)
  let [csrf, setCsrf] = useState("")

  useEffect(() => {
    (async ()  => { setCsrf(setAxiosCSRF(await getCSRF())) })()
  }, [])


  return < userContext.Provider value={[user, setUser]}>
    <csrfContext.Provider value={[csrf, setCsrf]}>
      <MemoryRouter>
        <Routes>
          <Route element={<PrivateRoute auth={user} />} >
            <Route element={<ChatWindow />} path='/' />
          </Route>
          <Route element={<LoginForm />} path='/login' />
          <Route element={<RegisterForm />} path='/register' />
        </Routes>
      </MemoryRouter>
    </csrfContext.Provider>
  </userContext.Provider>;

}

export default App;
