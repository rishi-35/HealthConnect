import { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaRobot,
  FaUserMd,
  FaQuoteLeft,
  FaStar,
} from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navitage = useNavigate();
  return (
    <div className="bg-blue-50 min-h-screen font-sans">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-[#E3F2FD] to-[#BBDEFB] text-black pt-24 px-5 flex items-center justify-center overflow-hidden">
        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center justify-between relative z-10 gap-12 md:gap-20">
          {/* Left Side - Text Content */}
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-5xl font-extrabold mb-6 drop-shadow-lg leading-tight text-gray-900">
              Book Appointment With{" "}
              <span className="text-blue-600">Trusted Doctors</span>
            </h1>
            <p className="text-lg mb-6 text-gray-700">
              Browse through our extensive list of expert doctors and schedule
              your appointment hassle-free.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 font-semibold rounded-full shadow-lg hover:bg-blue-700 transition flex items-center gap-2">
              Book Appointment →
            </button>
          </div>

          {/* Right Side - Image */}
          <div className="md:w-1/2 flex justify-center items-end relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#BBDEFB] opacity-50 md:hidden"></div>
            <img
              src="/relationbg.png"
              className="w-full max-w-md md:max-w-lg drop-shadow-2xl rounded-lg opacity-90 mix-blend-overlay object-bottom"
              alt="Doctors"
            />
          </div>
        </div>

        {/* Decorative Abstract Blur Effects */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 opacity-40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400 opacity-30 rounded-full blur-3xl"></div>
      </header>

      {/* Features Section with Live Counters */}
      <section className="py-16 px-5 text-center bg-white">
        <h2 className="text-3xl font-bold text-blue-600 mb-10">
          Why Choose Us?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<FaCalendarCheck />}
            title="Easy Appointments"
            text="Book and manage appointments seamlessly."
            countStart={50000}
            countEnd={100000}
          />
          <FeatureCard
            icon={<FaRobot />}
            title="AI Assistance"
            text="Get instant AI-driven medical guidance."
            countStart={1000}
            countEnd={5000}
          />
          <FeatureCard
            icon={<FaUserMd />}
            title="Trusted Doctors"
            text="Find top-rated doctors near you."
            countStart={200}
            countEnd={500}
          />
        </div>
      </section>

      {/* Reviews Section - Now with 6 Reviews & Uniform Box Sizes */}
      <section className="bg-blue-50 py-16 px-5">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-10">
          What Our Users Say
        </h2>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          pagination={{ clickable: true }}
          navigation
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={30}
          slidesPerView={1} // Only 1 review at a time
          className="max-w-4xl mx-auto"
        >
          <SwiperSlide>
            <ReviewCard
              index={0}
              name="Dr. Sharma"
              role="Doctor"
              text="This platform has helped me connect with more patients than ever!"
            />
          </SwiperSlide>
          <SwiperSlide>
            <ReviewCard
              index={1}
              name="Ravi Patel"
              role="Patient"
              text="The AI assistant helped me understand my symptoms before my appointment."
            />
          </SwiperSlide>
          <SwiperSlide>
            <ReviewCard
              index={2}
              name="Priya Mehta"
              role="Patient"
              text="Booking an appointment was super easy and fast!"
            />
          </SwiperSlide>
          <SwiperSlide>
            <ReviewCard
              index={3}
              name="Dr. Verma"
              role="Doctor"
              text="A great platform for doctors to manage their appointments."
            />
          </SwiperSlide>
          <SwiperSlide>
            <ReviewCard
              index={4}
              name="Ananya Singh"
              role="Patient"
              text="I found the best doctor for my health concerns through this app!"
            />
          </SwiperSlide>
          <SwiperSlide>
            <ReviewCard
              index={5}
              name="Dr. Gupta"
              role="Doctor"
              text="A seamless experience for both doctors and patients alike!"
            />
          </SwiperSlide>
        </Swiper>
      </section>

      {/* Call-to-Action Section */}
      <section className="flex items-center justify-center bg-[#E3F2FD] bg-white py-24 px-8">
        <div className="relative bg-[#BBDEFB] text-black rounded-2xl flex flex-col md:flex-row items-center m-auto w-[90vw] h-[350px] lg:h-[400px] p-12 md:p-16 shadow-2xl overflow-visible">
          {/* Text Content */}
          <div className="md:w-[70%] text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Book Appointment <br /> With{" "}
              <span className="text-blue-600">100+ Trusted Doctors</span>
            </h2>
            <button
              className="mt-8 bg-white text-blue-600 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:bg-blue-100 transition"
              onClick={() => navitage("/login")}
            >
              Create Account
            </button>
          </div>

          {/* Doctor Image Positioned Inside Box */}
          <div className="md:w-1/3 flex justify-center md:justify-end hidden sm:block">
            <img
              src="/footerdoc.png"
              alt="Doctor"
              className="absolute md:right-0 lg:right-5 bottom-0 max-w-[220px] md:max-w-[350px] lg:max-w-[410px] object-contain z-30"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// Live Counter Component
function LiveCounter({ start, end, duration }) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime = Date.now();
    const updateCounter = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      setCount(Math.floor(start + (end - start) * progress));
      if (progress < 1) requestAnimationFrame(updateCounter);
    };
    requestAnimationFrame(updateCounter);
  }, [start, end, duration]);

  return <span className="font-bold text-2xl text-blue-600">{count}+</span>;
}

// Feature Card Component
function FeatureCard({ icon, title, text, countStart, countEnd }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center transition-transform transform hover:scale-105">
      <div className="w-16 h-16 bg-blue-100 flex items-center justify-center rounded-full mb-4">
        <div className="text-blue-500 text-4xl">{icon}</div>
      </div>
      <h3 className="text-xl font-bold text-blue-600">{title}</h3>
      <p className="text-gray-600 mt-2">{text}</p>
      <div className="mt-4 text-lg text-gray-800">
        <LiveCounter start={countStart} end={countEnd} duration={3000} />
      </div>
    </div>
  );
}

// Review Card Component with Large Images & Responsive Layout
function ReviewCard({ name, role, text, index }) {
  const isPatient = role.toLowerCase() === "patient";
  const imageType = isPatient ? "patient" : "doc";
  const imageName = `/${imageType}${index + 1}.png`;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-6 max-w-3xl mx-auto">
      {/* Left Side - Image */}
      <div className="flex flex-col items-center">
        <img
          src={imageName}
          alt={name}
          className={`w-32 h-40 rounded-lg border-4 border-blue-500 shadow-md object-cover 
            ${isPatient ? "px-2 pt-3" : ""}`} // Extra padding for patients
        />
        <div className="mt-4 text-center">
          <h3 className="font-semibold text-xl text-blue-700">{name}</h3>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>

      {/* Right Side - Review */}
      <div className="flex-1 text-left">
        <FaQuoteLeft className="text-blue-500 text-3xl mb-3" />
        <p className="text-gray-700 italic text-lg leading-relaxed">“{text}”</p>
        <div className="flex mt-3 text-yellow-500">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Call to Action Button
function Button({ children }) {
  return (
    <button className="bg-white text-blue-500 px-6 py-3 font-semibold rounded-md shadow-lg hover:bg-blue-100 transition">
      {children}
    </button>
  );
}
