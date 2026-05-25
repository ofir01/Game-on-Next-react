"use client";

import { useState, useMemo, useEffect } from "react";
import "./SearchMenu.css";
import RenderTable from '../RenderTable/RenderTable.jsx';
import Dropdown from "../Dropdown/Dropdown.jsx";
import Percentage from '../percentage/Percentage.jsx';
//import CoursesPie from '../CoursesPie/CoursesPie.jsx';

//import SortByDate from '../SortByDate/SortByDate.jsx';
/**
 * Props:
 * - options: array of { id, label, value } (default built-in)
 * - data: optional array of items to filter locally for demo (each item should have fields like workTitle/type/...)
 * - onFilter: optional callback({ text, selectedValue }) => void
 */
export default function SearchMenu({ data = [], allCourseName = [], allstate = [] }) {
  const [text, setText] = useState(""); // בחירה חופשית 
  const [selectedCourse, setSelectedCourse] = useState(""); // קורס שנבחר
  const [selectedState, setSelectedState] = useState(""); //מצב שנבחר
  const [allstates, setAllStates] = useState({}); //מצבים שנבחרים

  //const [showDropdown, setShowDropdown] = useState(false);//תפריט נפתח לקורסים
  //const [showDropdownState, setShowDropdownState] = useState(false);//תפריט נפתח למצבים



  // filtered local results (if data passed) — demo only
  const filteredData = useMemo(() => {
    if (!data.length) { return [] }


    const txt = text.trim().toLowerCase();
    const sel = selectedCourse;
    const selState = selectedState;


    return data.filter(item => {
      const title = item.workTitle?.toString().toLowerCase() || "";
      const course = item.courseName?.toString().toLowerCase() || "";
      const matchesText = txt === "" || title.includes(txt) || course.includes(txt); // בדיקה לפי חיפוש חופשי
      const matchesselectedCourse = sel === "" || item.courseName === sel; // בדיקה לפי קורס שנבחר
      const matchesstate = item.state === selState || selState === "";// בדיקה לפי מצב שנבחר

      const matches = matchesText && matchesselectedCourse && matchesstate; // מחזיר רק אם שלושתם מתקיימים


      return matches;
    });

  }, [data, text, selectedCourse, selectedState]);

  //שם באובייקט את המשימות של כל הקורסים
  useEffect(() => {
    const result = { 'ALL': {} };
    for (const item of data) {
      const course = item.courseName;
      const state = item.state;
      // אם עדיין אין קורס — ניצור אותו
      if (!result[course]) {
        result[course] = {};
      }
      // אם עדיין אין מפתח של state — ניצור אותו
      if (!result[course][state]) {
        result[course][state] = 0;
      }
      result[course][state]++;// נגדיל

      if (!result['ALL'][state]) {
        result['ALL'][state] = 0;
      }
      result['ALL'][state]++;
    }
    //console.log(result);
    setAllStates(result);
  }, []);

  //מציג רק את המשימות של הקורס שנבחר
  const currentCourse = selectedCourse === ""
    ? allstates.ALL
    : allstates[selectedCourse];





  //ניקוי הפילטרים
  function clearFilter() {
    setText("");
    setSelectedCourse("");
    setSelectedState("");
    //if (allCourseName) onFilter({ text: "", selected: "" });
  }


  return (
    <div className="searchmenu-root">
      <div className="search-controls">
        <div className="search-input-wrap">
          <input
            className="search-input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Search..."
          />
        </div>



        <Dropdown
          label="בחר קורס"
          options={allCourseName}
          value={selectedCourse}
          onChange={setSelectedCourse}
        />
        <Dropdown
          label="בחר סוג משימה"
          options={allstate}
          value={selectedState}
          onChange={setSelectedState}
        />


        {/*<SortByDate data={filteredData} />*/}



        <button className="reset-btn" onClick={clearFilter}>reset</button>

      </div>
      {data && <RenderTable data={filteredData} />}


      {currentCourse && (
        <Percentage
          done={currentCourse.RETURNED || 0}
          pending={currentCourse.CREATED || 0}
          failed={currentCourse.NOT_SUBMITTED || 0}
          turnedIn={currentCourse.TURNED_IN || 0}
        />
      )}




    </div>

  );
}
