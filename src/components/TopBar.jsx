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

  return (
    <div className="bg-[#4A4947] text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Scholarship Disbursement System</h1>

      <div className="flex items-center space-x-4">
        <div className="relative" ref={bellDropdownRef}>
          {props.isNotification ? (
            <BellDot
              color="#3e9392"
              className="cursor-pointer"
              onClick={toggleBellDropdown}
            />
          ) : (
            <Bell
              color="#3e9392"
              className="cursor-pointer"
              onClick={toggleBellDropdown}
            />
          )}
          {isBellDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-black z-10">
              <div className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                Notifications 1
              </div>
              <div className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                Notifications 2
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