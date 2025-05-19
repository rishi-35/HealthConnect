import React, { useState } from "react";
import { motion } from "framer-motion";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-blue-800 h-64 flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1585435557343-3b0929fb0483?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-blue-900/60"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Get in Touch</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            We're here to assist you with any questions or concerns. Reach out today!
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-blue-100/50 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-blue-900 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="peer w-full px-4 py-3 rounded-lg border border-blue-200 bg-blue-50/50 text-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      placeholder=" "
                    />
                    <label
                      htmlFor="name"
                      className="absolute left-4 top-3 text-blue-600 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm"
                    >
                      Full Name
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="peer w-full px-4 py-3 rounded-lg border border-blue-200 bg-blue-50/50 text-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      placeholder=" "
                    />
                    <label
                      htmlFor="email"
                      className="absolute left-4 top-3 text-blue-600 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm"
                    >
                      Email Address
                    </label>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="peer w-full px-4 py-3 rounded-lg border border-blue-200 bg-blue-50/50 text-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder=" "
                  />
                  <label
                    htmlFor="subject"
                    className="absolute left-4 top-3 text-blue-600 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm"
                  >
                    Subject
                  </label>
                </div>
                <div className="relative">
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="peer w-full px-4 py-3 rounded-lg border border-blue-200 bg-blue-50/50 text-blue-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    placeholder=" "
                  />
                  <label
                    htmlFor="message"
                    className="absolute left-4 top-3 text-blue-600 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-6 peer-focus:text-sm peer-focus:text-blue-500 peer-valid:-top-6 peer-valid:text-sm"
                  >
                    Your Message
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="col-span-1"
          >
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-lg p-8 border border-blue-100/50">
              <h2 className="text-2xl font-semibold text-blue-900 mb-8">Contact Information</h2>
              <div className="space-y-8">
                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <PhoneIcon className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Phone</p>
                    <p className="text-blue-700 hover:text-blue-500 transition-colors">
                      <a href="tel:+911234567890">+91 123-456-7890</a>
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <EnvelopeIcon className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Email</p>
                    <p className="text-blue-700 hover:text-blue-500 transition-colors">
                      <a href="mailto:support@healthcare.com">support@healthcare.com</a>
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <MapPinIcon className="w-6 h-6 text-blue-600 mr-4 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Address</p>
                    <p className="text-blue-700">
                      123 Health Street, Wellness City, India
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;