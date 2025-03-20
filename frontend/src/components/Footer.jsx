import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r bg-blue-50  py-12 px-8 text-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">

        {/* Left Section - Brand & About */}
        <div className="md:w-1/3 text-center md:text-left">
          <h2 className="text-3xl font-bold text-blue-700">Health Connect</h2>
          <p className="text-gray-600 mt-3">
            Your trusted platform to book appointments with top doctors effortlessly.
          </p>
          {/* Social Icons */}
          <div className="flex justify-center md:justify-start gap-5 mt-4">
            <a href="https://www.facebook.com/" className="text-blue-700 hover:text-blue-900 transition transform hover:scale-110" target="__blank">
              <FaFacebook size={28} />
            </a>
            <a href="https://www.x.com/" className="text-blue-700 hover:text-blue-900 transition transform hover:scale-110" target="__blank">
              <FaTwitter size={28} />
            </a>
            <a href="https://www.instagram.com/" className="text-blue-700 hover:text-blue-900 transition transform hover:scale-110" target="__blank">
              <FaInstagram size={28} />
            </a>
            <a href="https://www.linkedin.com/" className="text-blue-700 hover:text-blue-900 transition transform hover:scale-110" target="__blank">
              <FaLinkedin size={28} />
            </a>
          </div>
        </div>

        {/* Middle Section - Navigation */}
        <div className="md:w-1/3 text-center">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Quick Links</h3>
          <nav className="flex flex-col gap-2 text-gray-600">
            <Link to="/" className="hover:text-blue-700 transition">Home</Link>
            <Link to="/about" className="hover:text-blue-700 transition">About Us</Link>
            <Link to="/services" className="hover:text-blue-700 transition">Services</Link>
            <Link to="/contact" className="hover:text-blue-700 transition">Contact</Link>
          </nav>
        </div>

        {/* Right Section - Contact Info */}
        <div className="md:w-1/3 text-center md:text-right">
          <h3 className="text-xl font-semibold text-gray-700">Contact Us</h3>
          <p className="text-gray-600 mt-2">📧 rishi.dev@gmail.com</p>
          <p className="text-gray-600">📞 9849112277</p>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="text-center text-gray-500 text-sm mt-8 border-t border-gray-300 pt-4">
        © {new Date().getFullYear()} Health Connect. All rights reserved.
      </div>
    </footer>
  );
}
