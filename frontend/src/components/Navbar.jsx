import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { User, ChevronDown } from "lucide-react"; // Profile Icon

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Toggle functions
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileMenu = () => setProfileMenuOpen(!isProfileMenuOpen);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-[#E3F2FD] sticky top-0 z-50 px-8 py-2 shadow-md">
      <div className="container flex justify-between items-center">
        {/* Logo (Increased size) */}
        <Link to="/" className="text-black text-xl font-bold no-underline">
          <img src="/logo-bg.png" alt="Health Connect" className="h-14 w-auto" />
        </Link>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex flex-col gap-1 cursor-pointer" onClick={toggleMobileMenu}>
          <span className="w-6 h-0.5 bg-black transition-all"></span>
          <span className="w-6 h-0.5 bg-black transition-all"></span>
          <span className="w-6 h-0.5 bg-black transition-all"></span>
        </div>

        {/* Navigation Links */}
        <ul
          className={`${
            isMobileMenuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row gap-6 md:gap-8 items-center md:static absolute top-16 left-0 right-0 bg-[#E3F2FD] md:bg-transparent p-4 md:p-0`}
        >
          {["Home", "About Us", "Services", "Blog", "Contact"].map((item, index) => (
            <li key={index}>
              <Link
                to={`/${item.toLowerCase().replace(" ", "")}`}
                className="text-black no-underline hover:text-blue-600 transition-all text-lg"
                onClick={toggleMobileMenu}
              >
                {item}
              </Link>
            </li>
          ))}
        </ul>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={toggleProfileMenu}
            className="flex items-center gap-2 text-black hover:bg-gray-200 px-3 py-2 rounded-full transition-all"
          >
            <User className="w-7 h-7" />
            <ChevronDown className="w-4 h-4" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border py-2 transition-all">
              <Link
                to="/profile"
                className="block px-4 py-2 text-black hover:bg-blue-100 transition-all"
                onClick={() => setProfileMenuOpen(false)}
              >
                Edit Profile
              </Link>
              <Link
                to="/settings"
                className="block px-4 py-2 text-black hover:bg-blue-100 transition-all"
                onClick={() => setProfileMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  // Add logout logic here
                }}
                className="w-full text-left px-4 py-2 text-black hover:bg-red-100 transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
