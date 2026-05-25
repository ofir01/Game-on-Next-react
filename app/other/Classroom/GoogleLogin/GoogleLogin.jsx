"use client";

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import './GoogleLogin.css';
import SearchMenu from "../SearchMenu/SearchMenu.jsx";

export default function GoogleLogin() {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allCourseName, setAllCourseName] = useState([]);
  const [Error, setError] = useState(false);
  const allstate = ['CREATED', 'TURNED_IN', 'RETURNED', 'NEW', 'RECLAIMED_BY_STUDENT', 'NOT_SUBMITTED'];

  const login = useGoogleLogin({
    flow: 'implicit',
    scope: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly',
    onSuccess: async tokenResponse => {
      const accessToken = tokenResponse.access_token;
      setLoading(true);
      setError(false);
      try {
        // שולח את ה-accessToken לשרת לקבלת הציונים
        const res = await fetch('/api/classroom', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken }),
        });
        setLoading(false);

        if (!res.ok) {
          console.error('Server error', res.status);
          setGrades([]);
          setAllCourseName([]);
          setError(true);
          return;
        }

        const data = await res.json();
        setGrades(data.grades);//כל הקורסים והמשימות והסטטוס

        //כל הקורסים
        const allCourseName = data.courses.map(c => c.name);
        console.log(allCourseName);

        setAllCourseName(allCourseName);
      } catch (err) {
        console.error(err);
      }

    },
    onError: () => console.log('Login Failed'),
  });

  return (
    <div className="GoogleLogin-page-wrapper">
      <div className="classroom-main">
        <div className="classroom-title-wrapper">
          <div className="classroom-icon">C</div>
          <h1 className="classroom-title">gradesClass</h1>
          <button className="login-btn" onClick={() => login()}> התחבר עם Google</button>
        </div>

        {loading && <LoadingAnimation />}
        {Error && <div className="classroom-icon">שגיאה</div>}

        {!loading && grades.length > 0 && <SearchMenu data={grades} allCourseName={allCourseName} allstate={allstate} />}
      </div>
    </div>
  );
}
