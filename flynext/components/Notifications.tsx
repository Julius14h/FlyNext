"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  userId: number;
  bookingId: number | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setIsAuthenticated(true);
          fetchUnreadNotifications(token);
          const interval = setInterval(() => fetchUnreadNotifications(token), 30000);
          return () => clearInterval(interval);
        } catch (error) {
          console.error("Error parsing token:", error);
          setIsAuthenticated(false);
          setLoading(false);
        }
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const fetchUnreadNotifications = async (token: string) => {
    try {
      setError(null);
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.user;

      const unreadResponse = await fetch(`/api/protected/users/${userId}/notifications/unread`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!unreadResponse.ok) throw new Error("Failed to fetch unread count");
      const unreadData = await unreadResponse.json();
      setUnreadCount(unreadData.unreadCount);

      const notificationsResponse = await fetch(`/api/protected/users/${userId}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!notificationsResponse.ok) throw new Error("Failed to fetch notifications");
      const notificationsData = await notificationsResponse.json();

      const notificationsArray = notificationsData[0]?.notifications || [];
      if (Array.isArray(notificationsArray)) {
        setNotifications(notificationsArray);
      } else {
        throw new Error("Invalid notifications data format");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications. Please try again.");
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationStatus = async (notificationId: number, action: "read" | "unread") => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.user;

      const response = await fetch(`/api/protected/users/${userId}/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error("Failed to update notification status");

      const isRead = action === "read";
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead } : n))
      );
      setUnreadCount((prev) => (isRead ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.user;

      const response = await fetch(`/api/protected/users/${userId}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete notification");

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-teal-400 hover:text-gray-900 dark:hover:text-teal-300 focus:outline-none transition-colors duration-300"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {isAuthenticated && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && isAuthenticated && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-100 ${
                    notification.isRead ? "bg-gray-100 text-gray-400" : "bg-white text-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {notification.isRead ? (
                        <button
                          onClick={() => updateNotificationStatus(notification.id, "unread")}
                          className="text-blue-600 hover:text-blue-800"
                          title="Mark as unread"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => updateNotificationStatus(notification.id, "read")}
                          className="text-blue-600 hover:text-blue-800"
                          title="Mark as read"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete notification"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}