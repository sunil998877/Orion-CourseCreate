import React from 'react';
import logo from '../assests/logo5.png'; // Import as a file


const Header: React.FC = () => (
  <header className="px-6 flex items-center rounded-full">
    <img src={logo} alt="Logo" className="h-20 w-15" />
  </header>
);

export default Header;