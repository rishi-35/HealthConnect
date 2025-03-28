import { useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isDoctor, setIsDoctor] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient", // Default role
  });

  const {login, signUp}= useAuthStore();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle authentication
  const handleAuth = (e) => {
    e.preventDefault();
    const dataToSend = { ...formData, role: isDoctor ? "doctor" : "patient" };

    if (isLogin) {
      login(dataToSend); // Call Login function with form data
    } else {
      signUp(dataToSend); // Call signUp function with form data
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-blue-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between border-b pb-2">
          <button
            className={`text-lg font-medium ${
              isLogin ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`text-lg font-medium ${
              !isLogin ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
            }`}
            onClick={() => {
              setIsLogin(false);
              setIsDoctor(false);
            }}
          >
            Register
          </button>
        </div>

        <form className="mt-4" onSubmit={handleAuth}>
          {!isLogin && (
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {isDoctor ? "Doctor Registration" : "Patient Registration"}
            </h2>
          )}

          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}
          {isLogin &&(
           <select
           name="role"
           onChange={(e) => e.target.value === "doctor" ? setIsDoctor(true) : setIsDoctor(false)}
           required
           className="w-full p-2 border rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
         >
           <option value="">Select Role</option>
           <option value="doctor">Doctor</option>
           <option value="Patient">User</option>
         </select>
         
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />

          <button className="w-full bg-blue-600 text-white py-2 rounded mt-2" onClick={handleAuth}>
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        {!isLogin && !isDoctor && (
          <p className="text-center text-sm text-gray-600 mt-3">
            Are you a doctor?{" "}
            <span className="text-blue-600 cursor-pointer" onClick={() => setIsDoctor(true)}>
              Register Here
            </span>
          </p>
        )}
        {!isLogin && isDoctor && (
          <p className="text-center text-sm text-gray-600 mt-3">
            Are you a patient?{" "}
            <span className="text-blue-600 cursor-pointer" onClick={() => setIsDoctor(false)}>
              Register Here
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
