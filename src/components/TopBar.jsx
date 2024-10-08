import React, { useState, useEffect, useRef } from "react";
import { Bell, BellDot } from "lucide-react";

const TopBar = (props) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBellDropdownOpen, setIsBellDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const bellDropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleBellDropdown = () => {
    setIsBellDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellDropdownRef.current &&
        !bellDropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
        setIsBellDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    // Implement login action, e.g., redirect to login page
    console.log("Login clicked");
  };

  const handleRegister = () => {
    // Implement registration action, e.g., redirect to registration page
    console.log("Register clicked");
  };

  return (
    <div className="bg-[#000000FF] text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">Scholarship Disbursement System</h1>

      <div className="flex items-center space-x-6">
        {/* Applicant Login Button */}
        <button
          onClick={handleLogin}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
        >
          Applicant Login
        </button>
        
        {/* New Registration Button */}
        <button
          onClick={handleRegister}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          New Registration
        </button>

        {/* Notification Icon */}
        <div className="relative" ref={bellDropdownRef}>
          {props.isNotification ? (
            <BellDot
              color="#3e9392"
              className="cursor-pointer hover:scale-110 transition-transform"
              onClick={toggleBellDropdown}
              size={24}
            />
          ) : (
            <Bell
              color="#3e9392"
              className="cursor-pointer hover:scale-110 transition-transform"
              onClick={toggleBellDropdown}
              size={24}
            />
          )}
          {isBellDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 text-black z-10">
              <div className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                Notification 1
              </div>
              <div className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                Notification 2
              </div>
              <div className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-t border-gray-200">
                View All Notifications
              </div>
            </div>
          )}
        </div>

        {/* Avatar with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center cursor-pointer"
            onClick={toggleDropdown}
          >
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold">S</span>
            </div>
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-black z-10">
              <div className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                Settings
              </div>
              <div className="px-4 py-2 cursor-pointer hover:bg-gray-100 border-t border-gray-200">
                Log Out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
