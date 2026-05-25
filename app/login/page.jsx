"use client";
import { useAuth } from '../Context/AuthContext'; 
import { authService } from '../../services/client/authService'; // שימוש ב-Service
import { toast } from 'sonner'
import { useState } from "react";
import "./FlipCard.css";
import ContainerflipCard from './ContainerflipCard';
import Video from '../Component/Video/Video';

const image1 = "/imges/sign-up.png";
const image2 = "/imges/sign-in2.png";

export default function FlipCard() {
    const { login: updateGlobalUser } = useAuth(); 

    const [isFlipped, setIsFlipped] = useState(false);
    const [showFrontForm, setShowFrontForm] = useState(false);
    const [showBackForm, setShowBackForm] = useState(false);
    const [isLoginSuccess, setIsLoginSuccess] = useState(false);
    const [isSignupSuccess, setIsSignupSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    // הרשמה
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

    // התחברות
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
                                
                                {/* שכבת הטופס שצפה מעל */}
                                {showFrontForm && (
                                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-center p-8 animate-in fade-in duration-300 z-20">
                                        <form onSubmit={handleRegister} className="space-y-4">
                                            <h3 className="text-white text-xl font-bold mb-4 text-center">Create Account</h3>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-all">
                                                {isLoading ? "Processing..." : "Start Journey"}
                                            </button>
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
                                            <input
                                                type="text"
                                                placeholder="Email or Username"
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-left"
                                                required
                                                value={loginIdentifier}
                                                onChange={(e) => setLoginIdentifier(e.target.value)}
                                            />
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-white outline-none focus:ring-2 focus:ring-blue-500 text-left"
                                                required
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                            />
                                            <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-all">
                                                {isLoading ? "Connecting..." : "Continue Journey"}
                                            </button>
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