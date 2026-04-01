"use client";

import CustomConnectButton from "@/components/custom-connect-button";
import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: "dark",
    notifications: true,
    twoFactor: false,
    apiAccess: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: keyof typeof settings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="scroll-m-20 text-3xl font-bold tracking-tight mb-2">
            Cài đặt
          </h1>
          <p className="text-muted-foreground italic">
            Quản lý tài sản phi tập trung và lịch sử nghiên cứu chuỗi khối.
          </p>
        </div>
        <div className="min-w-52">
          <CustomConnectButton />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
        {/* Theme Setting */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-lg font-semibold">Giao diện</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Chọn giao diện yêu thích của bạn
            </p>
          </div>
          <select
            value={settings.theme}
            onChange={(e) => handleChange("theme", e.target.value)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="light">Sáng</option>
            <option value="dark">Tối</option>
            <option value="auto">Hệ thống</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-lg font-semibold">Thông báo</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Nhận thông báo hệ thống
            </p>
          </div>
          <button
            onClick={() => handleToggle("notifications")}
            className={`relative w-12 h-6 rounded-full transition ${
              settings.notifications ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                settings.notifications ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h2 className="text-lg font-semibold">Xác thực 2 yếu tố</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Tăng cường bảo mật tài khoản
            </p>
          </div>
          <button
            onClick={() => handleToggle("twoFactor")}
            className={`relative w-12 h-6 rounded-full transition ${
              settings.twoFactor ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                settings.twoFactor ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* API Access */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Truy cập API</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Chấp nhận gọi API
            </p>
          </div>
          <button
            onClick={() => handleToggle("apiAccess")}
            className={`relative w-12 h-6 rounded-full transition ${
              settings.apiAccess ? "bg-purple-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                settings.apiAccess ? "right-1" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Save Button */}
        <div className="flex gap-4 pt-6">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            Lưu thay đổi
          </button>
          <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
