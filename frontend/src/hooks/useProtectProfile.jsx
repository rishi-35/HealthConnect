import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const useProtectProfile = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
   
    useEffect(() => {
        if (user && !user.isProfileComplete) {
            navigate("/edit-profile"); // Redirect to edit profile page
        }
    }, [user, navigate]);
};

export default useProtectProfile;
