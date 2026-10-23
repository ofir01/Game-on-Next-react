"use client";

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleLoginWrapper({ children }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // אם המפתח חסר, מרנדרים את הילדים ללא ה-Provider כדי למנוע קריסה מלאה של הדף
    if (!clientId) {
        console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing!");
        return <>{children}</>;
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}