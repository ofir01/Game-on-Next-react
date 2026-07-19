"use client";
import Link from 'next/link';

export default function ForgotPassword() {
    return (

        <Link
            href="/forgot-password"
            className="text-blue-400/80 hover:text-blue-300 font-medium transition-colors duration-200"
        >
          Forgot Password ?  
        </Link>
    );
}
