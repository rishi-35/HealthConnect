// components/NavigateButton.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";

const NavigateButton = ({ originLat, originLng, destLat, destLng }) => {
  const handleRedirect = () => {
    if (originLat && originLng && destLat && destLng) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;
      window.open(url, "_blank");
      
    } else {
      alert("Unable to determine location for navigation.");
    }
  };

  return (
    <button
      onClick={handleRedirect}
      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-blue-300 hover:bg-blue-100 absolute bottom-4 right-4"
      title="Get Directions"
    >
      <FontAwesomeIcon icon={faLocationArrow} size="lg" />
      <span className="text-base">Navigate</span>
    </button>
  );
};

export default NavigateButton;
