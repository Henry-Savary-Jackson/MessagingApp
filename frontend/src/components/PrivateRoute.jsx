
import {Outlet, Navigate, useLocation} from 'react-router-dom'


export default ({auth: authenticated}) => {
    return  authenticated? <Outlet/> : <Navigate to="/login" replace state={{from:useLocation()}} />

}