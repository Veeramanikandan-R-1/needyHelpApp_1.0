import React from 'react'
import { Link, Outlet } from "react-router-dom";
import Navbar from '../common/navbar';

const Dashboard = () => {
  return (
    <div>
        <Navbar />
        <Outlet />
    </div>
  )
}

export default Dashboard