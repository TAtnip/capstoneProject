import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {useEffect} from 'react';
import { Dropdown } from 'flowbite-react';
import '../styles/Navbar.css';

//This navbar is rendered across the application by it's addition in the App.jsx file

const Navbar = () => {
  const navigate = useNavigate();

  const Logout = () => {
    localStorage.clear();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="main-logo">
        <Link to="/"><img src ="/logo.png" className="navbar-logo"/></Link>
      </div>
      <div className="plan-track-analyze">
        <b><Link to="/buildmeso" className="nav-link">Plan</Link>
        <Link to="/sessionbuilder/1" className="nav-link">Track</Link>
        <Link to="/visuals/" className="nav-link">Analyze</Link>
        </b>
      </div>
      <div className="dropdown">
        <Dropdown label={<img src="/dropdownbutton.png" alt="Menu Icon" className="menu-icon" />}
          inline={true}
          arrowIcon={false}
          placement="bottom" /* Hides the default arrow icon */>
            <div className="dropdown-container"><Dropdown.Item onClick={Logout} className="dropdown-item">Logout</Dropdown.Item></div>

        </Dropdown>
      </div>

    </nav>
  );
};

export default Navbar