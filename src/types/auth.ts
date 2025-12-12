export interface User {
  _id?: string;
  name: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  bannerColor?:string;
  isVerified: boolean;
  role: string;
  location: string;
website?:string;  
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

export interface CompleteProfileData {
  email: string;
  username: string;
  bio: string;
  avatar?: File;
  bannerColor :string;
}

export interface LoginData {
  email: string;
  password: string;
}