"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CloudSun, Search, LocateFixed, Thermometer, Droplets, Wind, Activity } from 'lucide-react';
import './WeatherApp.css';

// תמונת מסך פתיחה
const imgBackground = "/imges/Applications/WeatherApp/images/background.png";

// מפתחות API (מומלץ להעביר ל- .env בעתיד)
const weather_api_key = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const weather_url = "https://api.openweathermap.org/data/2.5/weather";
const config = {
    cUrl: "https://api.countrystatecity.in/v1/countries",
    ckey: process.env.NEXT_PUBLIC_COUNTRYSTATECITY_API_KEY
};
const headers = { "X-CSCAPI-KEY": config["ckey"] };

// פונקציית עזר להמרת טקסט לאייקון
const getWeatherEmoji = (description = '') => {
    if (description.includes("rain") || description.includes("גשם")) return "🌧️";
    if (description.includes("cloud") || description.includes("ענן")) return "☁️";
    if (description.includes("clear") || description.includes("בהיר")) return "☀️";
    if (description.includes("snow") || description.includes("שלג")) return "❄️";
    return "🌤️";
};

export default function WeatherApp() {
    // --- ניהול מצבים (States) ---
    const [isAppReady, setIsAppReady] = useState(false); // קובע אם מציגים את התמונה או את האפליקציה
    const [statusText, setStatusText] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // נתוני מיקומים מ-API
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // בחירות משתמש
    const [selectedCountry, setSelectedCountry] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [manualCity, setManualCity] = useState("");

    // נתוני מזג אוויר ועיצוב
    const [currentWeather, setCurrentWeather] = useState(null);
    const [dailyForecast, setDailyForecast] = useState([]);
    const [graphData, setGraphData] = useState(null);
    const [expandedDay, setExpandedDay] = useState(null); // זוכר איזה יום פתוח כרגע
    const [wifiEnabled, setWifiEnabled] = useState(false);

    // --- טעינה ראשונית מקומית ---
    useEffect(() => {
        const lastCity = localStorage.getItem("weatherapp_last_city");
        if (lastCity) setManualCity(lastCity);
    }, []);

    // --- 1. מסך פתיחה וטעינת מדינות ---
    const startAppAndLoadCountries = async () => {
        if (isLoading) return;
        setStatusText('מתחבר ללווייני מזג האוויר...');
        setIsLoading(true);
        try {
            const response = await fetch(config["cUrl"], { headers: headers });
            if (response.ok) {
                const data = await response.json();
                setCountries(data.map(c => ({ name: c.name, iso2: c.iso2 })));
                setTimeout(() => {
                    setIsAppReady(true);
                    setStatusText('');
                }, 1000);
            }
        } catch (e) {
            setStatusText("שגיאה בטעינת נתונים, נסה שוב.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- 2. לוגיקת בחירת מיקומים ---
    const loadStates = async (countryCode) => {
        try {
            const res = await fetch(`${config['cUrl']}/${countryCode}/states`, { headers });
            const data = await res.json();
            setStates(data.map(s => ({ name: s.name, iso2: s.iso2 })));
        } catch (e) { setStates([]); }
    };

    const loadCities = async (countryCode, stateCode) => {
        try {
            const res = await fetch(`${config['cUrl']}/${countryCode}/states/${stateCode}/cities`, { headers });
            const data = await res.json();
            setCities(data.map(c => c.name));
        } catch (e) { setCities([]); }
    };

    const handleCountrySelect = (e) => {
        const cName = e.target.value;
        setSelectedCountry(cName);
        const cObj = countries.find(c => c.name === cName);
        if (cObj) {
            loadStates(cObj.iso2);
            setSelectedState(""); setCities([]); setManualCity("");
        }
    };

    const handleStateSelect = (e) => {
        const sName = e.target.value;
        setSelectedState(sName);
        const cObj = countries.find(c => c.name === selectedCountry);
        const sObj = states.find(s => s.name === sName);
        if (cObj && sObj) {
            loadCities(cObj.iso2, sObj.iso2);
            setManualCity("");
        }
    };

    // --- 3. משיכת נתוני מזג אוויר ---
    const fetchCurrentWeather = async (city) => {
        try {
            const res = await fetch(`${weather_url}?q=${city}&appid=${weather_api_key}&units=metric&lang=he`);
            const data = await res.json();
            if (data.cod === 200) return data;
            return null;
        } catch (e) { return null; }
    };

    const fetchForecast = async (city) => {
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weather_api_key}&units=metric&lang=he`);
            const data = await res.json();
            if (data.cod !== "200") return null;
            return data.list;
        } catch (e) { return null; }
    };

    // --- 4. כפתור חיפוש ראשי ---
    const executeSearch = async (e) => {
        if (e) e.preventDefault();
        if (!manualCity) return;
        
        setIsLoading(true);
        setGraphData(null); // איפוס גרף
        setExpandedDay(null); // סגירת כרטיסיות
        
        const currentData = await fetchCurrentWeather(manualCity);
        const forecastList = await fetchForecast(manualCity);
        
        if (currentData && forecastList) {
            setCurrentWeather(currentData);
            processWeeklyForecast(forecastList);
            localStorage.setItem("weatherapp_last_city", manualCity);
            setStatusText("");
        } else {
            setStatusText("לא מצאנו את העיר הזו, נסה לבדוק איות.");
        }
        setIsLoading(false);
    };

    // --- 5. עיבוד תחזית שבועית (קבץ לפי ימים) ---
    const processWeeklyForecast = (list) => {
        const dailyObj = {};
        list.forEach(item => {
            const date = item.dt_txt.split(" ")[0];
            if (!dailyObj[date]) {
                dailyObj[date] = { temps: [], humidity: [], rain: [], wind: [], desc: item.weather[0].description };
            }
            dailyObj[date].temps.push(item.main.temp);
            dailyObj[date].humidity.push(item.main.humidity);
            dailyObj[date].rain.push((item.pop || 0) * 100);
            dailyObj[date].wind.push(item.wind.speed);
        });

        const processed = Object.keys(dailyObj).map(date => {
            const avg = arr => arr.reduce((a,b)=>a+b,0)/arr.length;
            const t = dailyObj[date].temps;
            return {
                date,
                weekday: new Date(date).toLocaleDateString('he-IL', { weekday: 'long' }),
                tempAvg: Math.round(avg(t)),
                tempMin: Math.round(Math.min(...t)),
                tempMax: Math.round(Math.max(...t)),
                humidity: Math.round(avg(dailyObj[date].humidity)),
                rain: Math.round(avg(dailyObj[date].rain)),
                wind: Math.round(avg(dailyObj[date].wind)),
                desc: dailyObj[date].desc
            };
        }).slice(0, 5); // 5 ימים קדימה
        
        setDailyForecast(processed);
    };

    // --- 6. פתיחת גרף ליום ספציפי ---
    const loadGraphForDay = async (date) => {
        if (!manualCity) return;
        const list = await fetchForecast(manualCity);
        if (!list) return;

        const relevantData = list.filter(item => item.dt_txt.includes(date));
        const chartData = relevantData.map(item => ({
            time: item.dt_txt.split(" ")[1].substring(0, 5),
            temp: Math.round(item.main.temp)
        }));
        
        setGraphData({ date, data: chartData });
        
        // גלילה חלקה למטה לגרף
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    // --- 7. מיקום לפי GPS ---
    const useDeviceLocation = () => {
        if (!navigator.geolocation) {
            setStatusText("הדפדפן שלך לא תומך במיקום.");
            return;
        }
        setWifiEnabled(true);
        setStatusText("מחפש את המיקום שלך...");
        
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${weather_api_key}`);
                const data = await res.json();
                if (data && data[0]) {
                    const foundCity = data[0].local_names?.he || data[0].name;
                    setManualCity(foundCity);
                    // כאן נעשה חיפוש אוטומטי
                    setTimeout(() => document.getElementById("search-btn").click(), 100);
                }
            } catch(e) { setStatusText("שגיאה בזיהוי מיקום"); }
            setWifiEnabled(false);
        }, () => {
            setStatusText("גישה למיקום נדחתה.");
            setWifiEnabled(false);
        });
    };

    return (
        <section className="WeatherApp-page-wrapper">
            <div className="app-container">
                
                {/* --- מסך פתיחה --- */}
                {!isAppReady ? (
                    <div className="welcome-screen">
                        <h1 className="text-3xl font-bold mb-6 text-cyan-300 drop-shadow-md">מוכן לגלות את מזג האוויר?</h1>
                        <div className="image-wrapper">
                            <img 
                                className="background-fade" 
                                src={imgBackground} 
                                alt="התחל" 
                                onClick={startAppAndLoadCountries} 
                            />
                        </div>
                        <p className="text-slate-300 mt-4">{statusText || "לחץ על התמונה כדי להתחיל"}</p>
                    </div>
                ) : (
                    
                /* --- האפליקציה המרכזית --- */
                <div className="animate-fade-in">
                    {/* כותרת אנושית ומזמינה */}
                    <div className="mb-8 text-center sm:text-right">
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-200 mb-4 shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                            <CloudSun size={18} />
                            מערכת אקלים חכמה
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black leading-tight tracking-tight text-white drop-shadow-lg">
                            החלון שלך <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-400 to-blue-500">למזג האוויר של מחר</span>.
                        </h1>
                        <p className="mt-4 text-lg text-slate-300 font-medium">
                            חפש עיר, בדוק את המצב כרגע, ותכנן את השבוע שלך בדיוק מקסימלי.
                        </p>
                    </div>

                    {/* אזור השליטה והחיפוש (משולב) */}
                    <form onSubmit={executeSearch} className="controls-grid">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-cyan-200 font-bold">מדינה (אופציונלי):</label>
                            <select onChange={handleCountrySelect} value={selectedCountry}>
                                <option value="">בחר...</option>
                                {countries.map(c => <option key={c.iso2} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-cyan-200 font-bold">אזור:</label>
                            <select onChange={handleStateSelect} value={selectedState} disabled={!selectedCountry}>
                                <option value="">בחר...</option>
                                {states.map(s => <option key={s.iso2} value={s.name}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 relative">
                            <label className="text-sm text-cyan-200 font-bold">הקלד עיר לחקר:</label>
                            <div className="flex gap-2">
                                <input 
                                    value={manualCity} 
                                    onChange={(e) => setManualCity(e.target.value)} 
                                    placeholder="למשל: תל אביב"
                                    className="font-bold placeholder:font-normal"
                                />
                            </div>
                        </div>

                        {/* כפתורי פעולה מודרניים */}
                        <div className="flex gap-2 items-end sm:col-span-full md:col-span-1">
                             <button 
                                id="search-btn"
                                type="submit" 
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold h-[45px] rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 border border-cyan-400/50"
                            >
                                <Search size={18} /> {isLoading ? 'טוען...' : 'חפש'}
                            </button>
                            <button 
                                type="button" 
                                onClick={useDeviceLocation}
                                className={`w-[45px] h-[45px] flex justify-center items-center rounded-xl border border-white/20 transition-all ${wifiEnabled ? 'bg-cyan-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                                title="השתמש במיקום הנוכחי"
                            >
                                <LocateFixed size={20} className={wifiEnabled ? "animate-pulse" : ""} />
                            </button>
                        </div>
                    </form>
                    
                    {statusText && <div className="mt-4 text-center text-amber-300 font-bold bg-amber-900/30 py-2 rounded-lg border border-amber-500/30">{statusText}</div>}

                    {/* --- מסגרת "עכשיו" (מבוסס על קובץ 2 עם Tailwind/CSS מעורב) --- */}
                    {currentWeather && (
                        <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-8 border-t-cyan-500/30">
                            <div className="text-center sm:text-right">
                                <h2 className="text-3xl font-black text-white drop-shadow-md">{currentWeather.name || manualCity}</h2>
                                <p className="text-xl text-cyan-200 capitalize mt-1 font-medium">{currentWeather.weather[0].description}</p>
                                <p className="text-slate-400 mt-2 font-medium">{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="block text-slate-300 font-bold text-lg mb-[-10px]">עכשיו</span>
                                    <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 drop-shadow-xl">{Math.round(currentWeather.main.temp)}°</span>
                                </div>
                                <div className="text-7xl sm:text-8xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-bounce" style={{animationDuration: '3s'}}>
                                    {getWeatherEmoji(currentWeather.weather[0].description)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- תחזית שבועית נגללת חכמה --- */}
                    {dailyForecast.length > 0 && (
                        <div className="forecast-container">
                            {dailyForecast.map((day) => {
                                const isExpanded = expandedDay === day.date;
                                return (
                                    <div 
                                        key={day.date} 
                                        className={`day-card ${isExpanded ? 'active' : ''}`}
                                        onClick={() => setExpandedDay(isExpanded ? null : day.date)}
                                    >
                                        <div className="date-title">{day.weekday}</div>
                                        <div className="day-icon">{getWeatherEmoji(day.desc)}</div>
                                        <div className="day-temp-avg">{day.tempAvg}°</div>
                                        <div className="text-sm text-slate-400 font-medium capitalize mt-1">{day.desc}</div>
                                        
                                        {/* מידע שמוסתר ומופיע רק בלחיצה */}
                                        <div className="expanded-content">
                                            <div className="stats-grid">
                                                <span className="flex items-center gap-1"><Thermometer size={14} className="text-amber-400"/> {day.tempMin}° - {day.tempMax}°</span>
                                                <span className="flex items-center gap-1"><Droplets size={14} className="text-blue-400"/> לחות {day.humidity}%</span>
                                                <span className="flex items-center gap-1"><Wind size={14} className="text-cyan-200"/> {day.wind} קמ"ש</span>
                                                <span className="flex items-center gap-1"><CloudSun size={14} className="text-slate-300"/> גשם {day.rain}%</span>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); loadGraphForDay(day.date); }}
                                                className="w-full mt-2 py-2 rounded-lg bg-white/10 hover:bg-cyan-500 hover:text-white border border-white/20 hover:border-cyan-400 transition-all font-bold text-sm flex justify-center items-center gap-2 text-cyan-200"
                                            >
                                                <Activity size={16} /> הצג מגמת טמפרטורה
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* --- אזור הגרף --- */}
                    {graphData && (
                        <div className="graphic-frame">
                            <h3 className="text-center font-bold text-xl text-cyan-300 mb-6 drop-shadow-md">
                                התפתחות טמפרטורה - {new Date(graphData.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={graphData.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="time" stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                                        <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid #00d2ff', borderRadius: '10px', color: '#fff' }}
                                            itemStyle={{ color: '#00d2ff', fontWeight: 'bold' }}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="temp" 
                                            name="טמפרטורה (°C)" 
                                            stroke="#00d2ff" 
                                            strokeWidth={3} 
                                            dot={{ r: 4, fill: '#0f172a', stroke: '#00d2ff', strokeWidth: 2 }} 
                                            activeDot={{ r: 8, fill: '#00d2ff', stroke: '#fff', strokeWidth: 2 }} 
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
                )}
            </div>
        </section>
    );
}