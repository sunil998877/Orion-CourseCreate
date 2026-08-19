import { useEffect, useState } from 'react';
import { getUserProfile } from '../services/notificationService';

export const useUserProfile = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    localStorage.getItem('avatar')
  );
  const [userInfo, setUserInfo] = useState<{
    username: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    getUserProfile(token)
      .then((user) => {
        setUserInfo({ username: user.username, email: user.email });

        if (user.avatar) {
          setAvatarUrl(user.avatar);
          localStorage.setItem('avatar', user.avatar);
        }
      })
      .catch((error) => console.error('Failed to fetch user profile:', error));
  }, []);

  return { avatarUrl, userInfo, setAvatarUrl, setUserInfo };
};
