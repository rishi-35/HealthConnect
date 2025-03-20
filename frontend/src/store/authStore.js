import axios from "axios";
import {create} from 'zustand';
import toast from 'react-hot-toast';
import { User } from "lucide-react";

export const useAuthStore= create((set)=>({
    user:null,
    isSigningUp:false,
    isCheckingAuth:true,
    isLogingout:false,
    isLoging:false,
    signUp:async (credentials) => {
        set({isSigningUp:true});
        try {
            const {role}= credentials;
            const response = await axios.post(`http://localhost:5000/api/auth/${role}/register`,credentials,{ withCredentials: true } );
            set({user:response.data.user,isSigningUp:false})
            console.log("response :"+response.data);
            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response.data.message || "SignUp failed");
            set({isSigningUp:false,user:null})
        }
    },
    login: async (credentials) => {
        set({isLoging:true});
        try {
            const {role}= credentials;
            const response=await axios.post(`http://localhost:5000/api/auth/${role}/login`,credentials,{ withCredentials: true } );
            set({user:response.data.user,isLoging:false})
            toast.success("Login successfull");
        } catch (error) {
            toast.error(error.response.data.message || "Login failed");
            set({isLoging:false,user:null})
        }
    },
    logout: async (req,res) => {
        set({isLogingout:true})
        try {
            const role= req.specialization?'doctor':'patient';
             await axios.post(`http://localhost:5000/api/auth/${role}/logout`,{},{ withCredentials: true } )
            set({isLogingout:false,user:null})
            toast.success("Logout is Successfull");
        } catch (error) {
            set({isLogingout:false})
            toast.error(error.response.data.message || "logout is failed");
        }
    },
    authCheck: async () => {
        set({isCheckingAuth:true});
        try {
            const response=await axios.get('http://localhost:5000/api/auth/authcheck',{ withCredentials: true } );
            set({user:response.data.user,isCheckingAuth:false})
            // console.log("testing ",JSON.stringify(response.data.user));
        } catch (error) {
            console.log("error occured in store in authcheck function"+error.message);
            set({user:null,isCheckingAuth:false})
        }
    },
}))