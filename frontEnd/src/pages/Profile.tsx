import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogOut, ChevronDown } from 'lucide-react';
import { API_BASE } from '../utils/api';

interface User {
  name: string;
  organisation: string;
}
interface ProfileProps {
  setInstructor: React.Dispatch<React.SetStateAction<string>>;
}


const Profile: React.FC<ProfileProps> = ({ setInstructor }) => {

  const [user, setUser] = useState<User>({ name: '', organisation: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token'); // or sessionStorage if you use that
        if (!token) {
          toast.error('No token found. Please login.');
          return;
        }
        const response = await fetch(`${API_BASE}/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('User data:', data);
          const updatedUser = {
            name: data.username,
            organisation: data.organisation
          };
          setUser(updatedUser);
          setInstructor(updatedUser.organisation);
        }
      } catch (error) {
        toast.error('Failed to fetch user data');
      }
    };
    fetchUser();
  }, []);

  // Logout logic
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const [showDropdown, setShowDropdown] = useState(false);
  const handleDropDown = () => {
    setShowDropdown(!showDropdown);
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleDropDown}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 group"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full flex items-center justify-center transition-all duration-300 group-hover:shadow-lg">
          {/* Replace <User /> with an icon or avatar as needed */}
          <span className="h-6 w-6 text-white font-bold text-lg uppercase">{user.name ? user.name[0] : ''}</span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.organisation}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}

    </div>
  );
};

export default Profile;
