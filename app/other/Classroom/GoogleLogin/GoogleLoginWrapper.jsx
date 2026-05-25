"use client";

import GoogleLogin from './GoogleLogin.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleLoginWrapper() {
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
            <GoogleLogin />
        </GoogleOAuthProvider>
    );
}
