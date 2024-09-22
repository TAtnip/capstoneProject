import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown } from 'flowbite-react';
import '../styles/Navbar.css';

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
      <div className="dropdown">
        <Dropdown label={<img src="/dropdownbutton.png" alt="Menu Icon" className="menu-icon" />}
          inline={true}
          arrowIcon={false} /* Hides the default arrow icon */>
          <Dropdown.Item><Link to="/Plan" className="dropdown-item" >Plan</Link></Dropdown.Item>
          <Dropdown.Item><Link to="/Track" className="dropdown-item" >Track</Link></Dropdown.Item>
          <Dropdown.Item><Link to="/Analyze" className="dropdown-item" >Analyze</Link></Dropdown.Item>
          <Dropdown.Item onClick={Logout}>Logout</Dropdown.Item>
        </Dropdown>
      </div>

    </nav>
  );
};

export default Navbar