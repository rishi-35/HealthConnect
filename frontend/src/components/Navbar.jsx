import { useState } from "react";
import { Link } from "react-router-dom"; // Assuming you're using React Router for navigation

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-[#E3F2FD] sticky top-0 z-50 mt-0 px-8 py-1">
      <div className="container flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-black text-xl font-bold no-underline">
          <img src="/logo-bg.png" alt="Health Connect" className="h-26 mt-0.5 ml-0" />
        </Link>

        {/* Mobile Menu Toggle Button */}
        <div
          className="md:hidden flex flex-col gap-1 cursor-pointer"
          onClick={toggleMobileMenu}
        >
          <span className="w-6 h-0.5 bg-black"></span>
          <span className="w-6 h-0.5 bg-black"></span>
          <span className="w-6 h-0.5 bg-black"></span>
        </div>

        {/* Navigation Links */}
        <ul
          className={`${
            isMobileMenuOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row gap-6 md:gap-8 items-center md:static absolute top-16 left-0 right-0 bg-[#E3F2FD] md:bg-transparent p-4 md:p-0`}
        >
          <li>
            <Link
              to="/"
              className="text-black no-underline hover:text-[#4EA699] transition-colors text-2xl"
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className="text-black no-underline hover:text-[#4EA699] transition-colors text-2xl"
              onClick={toggleMobileMenu}
            >
              About Us
            </Link>
          </li>
          <li>
            <Link
              to="/services"
              className="text-black no-underline hover:text-[#4EA699] transition-colors text-2xl"
              onClick={toggleMobileMenu}
            >
              Services
            </Link>
          </li>
          <li>
            <Link
              to="/blog"
              className="text-black no-underline hover:text-[#4EA699] transition-colors text-2xl"
              onClick={toggleMobileMenu}
            >
              Blog
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className="text-black no-underline hover:text-[#4EA699] transition-colors text-2xl"
              onClick={toggleMobileMenu}
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              to="/appointment"
              className="bg-blue-500 hover:bg-blue-600 !text-white px-4 py-2 rounded-md no-underline  transition-colors text-2xl"
              onClick={toggleMobileMenu}
            >
              Book Appointment
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}