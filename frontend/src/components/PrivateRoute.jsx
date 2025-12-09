
import {Outlet, Navigate, useLocation} from 'react-router-dom'


export default ({auth: authenticated, redirect_route="/login"}) => {
    return  authenticated? <Outlet/> : <Navigate to={redirect_route} replace state={{from:useLocation()}} />

}