import React from 'react';
import logo from '../assests/logo5.png';

type Props = {
  className?: string;
};

const Logo: React.FC<Props> = ({ className }) => (
  <nav className="w-auto flex items-center justify-center">
    <img src={logo} alt="Logo" className={className ?? 'h-[180px] w-auto'} />
  </nav>
);

export default Logo;
