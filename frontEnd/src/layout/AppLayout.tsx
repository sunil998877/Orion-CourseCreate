import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AvatarCropModal from "../components/AvatarCropModal";
import { API_BASE } from "../utils/api";
import Header, { NotificationItem, UserInfo } from "./Header";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import ChangePasswordModal from "./ChangePasswordModal";
import ScrollToTop from "./ScrollToTop";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // Navigation & Drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  // User Profile & Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => localStorage.getItem("avatar"));
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    return username && email ? { username, email } : null;
  });

  // Modal states
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  }, []);

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch(`${API_BASE}/notifications/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Failed to mark notifications as read:", e);
    }
  };

  const removeAllNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch(`${API_BASE}/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
    } catch (e) {
      console.error("Failed to delete notifications:", e);
    }
  };

  // Poll notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const user = await res.json();
          setUserInfo({ username: user.username, email: user.email });
          if (user.avatar) {
            setAvatarUrl(user.avatar);
            localStorage.setItem("avatar", user.avatar);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Avatar upload handler
  const handleAvatarCropped = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/profile/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("avatar", data.avatar);
        setAvatarUrl(data.avatar);
        setAvatarModalOpen(false);
        fetchNotifications();
      }
    } catch (error) {
      console.error("Avatar upload failed", error);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("courseStatus");
    localStorage.removeItem("avatar");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1220] via-[#0a0f1a] to-black text-white">
      {/* Top Header */}
      <Header
        onOpenMobileMenu={() => setMobileOpen(true)}
        userInfo={userInfo}
        avatarUrl={avatarUrl}
        notifications={notifications}
        onOpenAvatarModal={() => setAvatarModalOpen(true)}
        onOpenChangePasswordModal={() => setChangePasswordModalOpen(true)}
        onLogout={handleLogout}
        onMarkAllRead={markAllRead}
        onRemoveAllNotifications={removeAllNotifications}
        onFetchNotifications={fetchNotifications}
      />

      {/* Main Content Area & Desktop Sidebar */}
      <div className="flex pt-16">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 min-w-0 md:ml-64">
          <div className="w-full space-y-8">{children}</div>
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Avatar Cropping Modal */}
      <AvatarCropModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        onCropped={handleAvatarCropped}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />

      {/* Scroll To Top Button */}
      <ScrollToTop />
    </div>
  );
}
