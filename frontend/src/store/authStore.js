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
            
            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response.data.message || "SignUp failed");
            set({isSigningUp:false,user:null})
        }
    },
    login: async (credentials) => {
        set({isLoging:true});
        try {
            const {role, email, password} = credentials;
            const response = await axios.post(
                `http://localhost:5000/api/auth/${role}/login`,
                {email, password},
                { 
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
            set({user:response.data.user, isLoging:false});
            
            toast.success("Login successful");
        } catch (error) {
            const errorMessage = error.response?.data?.message|| "Login failed";
            toast.error(errorMessage);
            console.error("Error manual: ", errorMessage);
            set({isLoging:false, user:null});
        }
    },
    logout: async (req,res) => {
        set({isLogingout:true})
        try {
             await axios.post(`http://localhost:5000/api/auth/logout`,{},{ withCredentials: true } )
            set({isLogingout:false,user:null})
            toast.success("Logout is Successfull");
        } catch (error) {
            set({isLogingout:false})
            toast.error(error.response.data?.message || "logout is failed");
        }
    },
    authCheck: async () => {
        set({isCheckingAuth:true});
        try {
            const response=await axios.get('http://localhost:5000/api/auth/authcheck',{ withCredentials: true } );
            set({user:response.data.user,isCheckingAuth:false})
            
        } catch (error) {
            console.log("error occured in store in authcheck function"+error.message);
            set({user:null,isCheckingAuth:false})
        }
    },
}))