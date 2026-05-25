"use client";

import { useState } from "react";
//import "./SortByDate.css";

export default function SortByDate({ data }) {
    const [sortedData, setSortedData] = useState(data);
    const [asc, setAsc] = useState(false); // false = חדש→ישן, true = ישן→חדש

    const sortByDate = () => {
        const sorted = [...sortedData].sort((a, b) => {
            const d1 = new Date(a.createdAt);
            const d2 = new Date(b.createdAt);
            return asc ? d1 - d2 : d2 - d1;
        });

        setSortedData(sorted);
        setAsc(prev => !prev); // הפיכת הכיוון
    };

    return (
        <div>
            <button className="sortButton"
                onClick={sortByDate}> {asc ? "↑" : "↓"}
            </button>

            <ul>
                {sortedData.map((item, i) => (
                    <li key={i}>
                        {item.name} — {item.date}
                    </li>
                ))}
            </ul>
        </div>
    );
}
