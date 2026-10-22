
import { Toaster } from 'sonner'; // בשביל התראות
import Navbar from './Component/Navbar/Navbar';// סרגל כלים עליון
import { AuthProvider } from './Context/AuthContext'; //בשביל המשתמש מחובר
import Providers from './providers'; //בשביל הבקשה לקטגוריות
import NetworkWidget from './Component/NetworkWidget/NetworkWidget';//אייקון שמראה פינג ומצב אינטרנט של המשתמש
import Footer from './Component/Footer/Footer'; // פוטר פשוט עם מידע וקישורים
import ChatAssistant from './Component/ChatAssistant/ChatAssistant'; // עוזר צ'אט שמופיע בפינה

import './globals.css'; // סגנונות גלובליים של Tailwind CSS

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@100..900&display=swap" rel="stylesheet" />{/* טעינת פונט Heebo */}
        {/* <script src="https://cdn.tailwindcss.com"></script>טעינת Tailwind דרך CDN */}
      </head>
      <body className="bg-gray-950 text-white pt-20">
        <Providers> {/* React Query הכי חיצוני */}
          <AuthProvider> {/* נותן את נתוני המשתמש */}
            <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <ChatAssistant />
            {<Footer />}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </Providers>
        <NetworkWidget />
      </body>
    </html >
  );
}


