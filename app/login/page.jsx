"use client";
import { useAuth } from '../Context/AuthContext';
import { authService } from '../../services/client/authService';
import { toast } from 'sonner';
import { useState } from "react";
import { useGoogleLogin } from '@react-oauth/google';
import "./FlipCard.css";
import ContainerflipCard from './ContainerflipCard';
import Video from '../Component/Video/Video';
import GoogleLoginWrapper from '../Component/GoogleLoginWrapper/GoogleLoginWrapper.jsx'; 
const image1 = "/imges/sign-up.png";
const image2 = "/imges/sign-in2.png";

// עוטף את כל הכרטיסייה עם GoogleLoginWrapper כדי לאפשר התחברות עם גוגל
export default function FlipCard() {
    return (
        <GoogleLoginWrapper>
            <FlipCardContent />
        </GoogleLoginWrapper>
    );
}

// רכיב הכרטיסייה עצמו
function FlipCardContent() {
    const { login: updateGlobalUser } = useAuth();// פונקציה לעדכון המשתמש ב-Context לאחר התחברות או הרשמה

    const [isFlipped, setIsFlipped] = useState(false);// מצב ההפיכה של הכרטיסייה
    const [showFrontForm, setShowFrontForm] = useState(false);// מצב הצגת הטופס בצד הקדמי (הרשמה)
    const [showBackForm, setShowBackForm] = useState(false);// מצב הצגת הטופס בצד האחורי (התחברות)
    const [isLoginSuccess, setIsLoginSuccess] = useState(false);// מצב הצלחה בהתחברות
    const [isSignupSuccess, setIsSignupSuccess] = useState(false);// מצב הצלחה בהרשמה
    const [isLoading, setIsLoading] = useState(false);// מצב טעינה של הבקשה לשרת

    // שדות טופס
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginIdentifier, setLoginIdentifier] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const flipCard = () => {
        setIsFlipped(!isFlipped);
        setShowFrontForm(false);
        setShowBackForm(false);
    }

    // --- התחברות עם גוגל ---
    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            // שליחת הטוקן לשרת כדי לבצע את ההתחברות
            try {
                const res = await authService.googleLogin({
                    accessToken: tokenResponse.access_token
                });
                
                // עדכון המשתמש ב-Context לפי מה שהשרת שלנו החזיר
                updateGlobalUser(res.user);
                toast.success("התחברת עם גוגל בהצלחה!");
               
                // נפעיל את האנימציה המתאימה לפי הצד של הכרטיסייה
                if (isFlipped) {
                    setIsLoginSuccess(true);
                } else {
                    setIsSignupSuccess(true);
                }

                setShowFrontForm(false);
                setShowBackForm(false);
            } catch (err) {
                toast.error("שגיאה בהתחברות מול השרת");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => toast.error('שגיאה בתקשורת עם גוגל'),
    });

    // הרשמה רגילה
    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await authService.register({ name, email, password });
            toast.success("נרשמת בהצלחה! בדוק את המייל לאימות");
            setIsSignupSuccess(true);
            setShowFrontForm(false);
            updateGlobalUser(res.user);
        } catch (err) {
            // ה-api-client כבר מקפיץ toast
        } finally {
            setIsLoading(false);
        }
    };

    // התחברות רגילה
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await authService.login({
                email: loginIdentifier,
                password: loginPassword
            });
            toast.success("התחברת בהצלחה!");
            setIsLoginSuccess(true);
            setShowBackForm(false);
            updateGlobalUser(res.user);
        } catch (err) {
            // שגיאה מטופלת ב-client
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flipcard-page-wrapper">
            <div className="card-container">
                <div className={`card-inner ${isFlipped ? "is-flipped" : ""}`}>

                    {/* צד קדמי - הרשמה */}
                    <div className="card-front relative group">
                        {isSignupSuccess ? (
                            <Video srcVideo={"/videos/success-signup.mp4"} />
                        ) : (
                            <>
                                <img className="card-image w-full h-full object-cover" src={image1} alt="sign-up" />

                                {showFrontForm && (
                                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-center p-8 animate-in fade-in duration-300 z-20">
                                        <form onSubmit={handleRegister} className="space-y-4">
                                            <h3 className="text-white text-xl font-bold mb-4 text-center">Create Account</h3>
                                            <input type="text" placeholder="Full Name" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-blue-500" required value={name} onChange={(e) => setName(e.target.value)} />
                                            <input type="email" placeholder="Email Address" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-blue-500" required value={email} onChange={(e) => setEmail(e.target.value)} />
                                            <input type="password" placeholder="Password" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-blue-500" required value={password} onChange={(e) => setPassword(e.target.value)} />
                                            <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-all">{isLoading ? "Processing..." : "Start Journey"}</button>
                                            <button type="button" onClick={() => setShowFrontForm(false)} className="w-full text-slate-400 text-xs hover:text-white">Cancel</button>
                                        </form>
                                    </div>
                                )}

                                {!showFrontForm && (
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 to-transparent">
                                        <ContainerflipCard
                                            flipCard={flipCard}
                                            showForm={showFrontForm}
                                            toggle={() => setShowFrontForm(true)}
                                            titleButton={'START NOW'}
                                            title={'Already have an account?'}
                                            titleSpan={'Log in here'}
                                            onGoogleLogin={handleGoogleLogin} 
                                            isLoading={isLoading}            
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* צד אחורי - התחברות */}
                    <div className="card-back relative group">
                        {isLoginSuccess ? (
                            <Video srcVideo={"/videos/success-login.mp4"} />
                        ) : (
                            <>
                                <img className="card-image w-full h-full object-cover" src={image2} alt="login" />

                                {showBackForm && (
                                    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col justify-center p-8 animate-in fade-in duration-300 z-20">
                                        <form onSubmit={handleLogin} className="space-y-4 text-right" dir="rtl">
                                            <h3 className="text-white text-xl font-bold mb-4 text-center">Welcome Back</h3>
                                            <input type="text" placeholder="Email or Username" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-left" required value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} />
                                            <input type="password" placeholder="Password" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-left" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                                            <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-all">{isLoading ? "Connecting..." : "Continue Journey"}</button>
                                            <button type="button" onClick={() => setShowBackForm(false)} className="w-full text-slate-400 text-xs hover:text-white">Cancel</button>
                                        </form>
                                    </div>
                                )}

                                {!showBackForm && (
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 to-transparent">
                                        <ContainerflipCard
                                            flipCard={flipCard}
                                            showForm={showBackForm}
                                            toggle={() => setShowBackForm(true)}
                                            titleButton={'CONTINUE'}
                                            title={'Don\'t have an account yet?'}
                                            titleSpan={'Sign up here'}
                                            onGoogleLogin={handleGoogleLogin} 
                                            isLoading={isLoading}             
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}