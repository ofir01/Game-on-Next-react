"use client";

import { useState } from "react";
import Average from '../calculation/Calculation.jsx';
import './RenderTable.css';

export default function RenderTable({ data }) {
    const [selectedItems, setSelectedItems] = useState([]);
    //console.log(data);
    // מקבל את שמות העמודות
    const keyData = Object.keys(data[0] || {});



    // פונקציה שמופעלת כשלוחצים על הסימון
    function toggleSelect(row) {
        const exists = selectedItems.find(item =>
            item.courseName === row.courseName &&
            item.workTitle === row.workTitle
        );

        let updated;

        if (exists) {
            // מסיר מהמערך
            updated = selectedItems.filter(item =>
                !(item.courseName === row.courseName &&
                    item.workTitle === row.workTitle)
            );
        } else {
            // מוסיף למערך אובייקט מסודר
            updated = [
                ...selectedItems,
                {
                    courseName: row.courseName,
                    workTitle: row.workTitle,
                    type: row.type,
                    state: row.state,
                    grade: row.grade
                }
            ];
        }

        setSelectedItems(updated);
        console.log("נבחרים כרגע:", updated);
    }

    return (
        <div className="table-container">
            <h2></h2>
            <div className="results-info">
                תוצאות: <strong>{data.length}</strong>
            </div>

            <table className="grades-table">
                <thead>
                    <tr>
                        {data.length > 0 && <th>בחר</th>}
                        {keyData.map((TableName, idx) => (
                            <th key={`${TableName}-${idx}`}>{TableName}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((g, index) => {
                        const isChecked = selectedItems.some(
                            item =>
                                item.courseName === g.courseName &&
                                item.workTitle === g.workTitle
                        );

                        return (
                            <tr key={index}>
                                <td>
                                    <label className="pretty-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => toggleSelect(g)}
                                        />
                                        <span className="checkmark"></span>
                                    </label>
                                </td>

                                {keyData.map((key, idx) => {
                                    const value = g[key];
                                    // סטייל לשדה state
                                    if (key === "state") {
                                        return (
                                            <td
                                                key={`${key}-${idx}`}
                                                className={`status-${value?.toLowerCase()}`}
                                            >
                                                {value ?? "-"}
                                            </td>
                                        );
                                    }

                                    // לינק
                                    const isLink =
                                        key.toLowerCase().includes("link") ||
                                        (typeof value === "string" &&
                                            (value.startsWith("http://") ||
                                                value.startsWith("https://")));
                                    if (isLink && value) {
                                        return (
                                            <td key={`${key}-${idx}`}>
                                                <a
                                                    href={value}
                                                    target="_blank"
                                                    className="link-button"
                                                >
                                                    open
                                                </a>
                                            </td>
                                        );
                                    }
                                    // אובייקט לא להציג
                                    if (typeof value === "object" && value !== null) {
                                        return <td key={`${key}-${idx}`}>[object]</td>;
                                    }
                                    return <td key={`${key}-${idx}`}>{value ?? "-"}</td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <Average data={data} />



            {selectedItems.length > 0 && (
                <div className="table-container selected-table">
                    <h3>פריטים שנבחרו</h3>
                    <table className="grades-table">
                        <thead>
                            <tr>
                                <th>בחר</th>
                                <th>courseName</th>
                                <th>workTitle</th>
                                <th>type</th>
                                <th>state</th>
                                <th>grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedItems.map((item) => (
                                <tr key={`${item.courseName}-${item.workTitle}`}>
                                    <td>
                                        <label className="pretty-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={true}
                                                onChange={() => toggleSelect(item)}
                                            />
                                            <span className="checkmark"></span>
                                        </label>
                                    </td>
                                    <td>{item.courseName}</td>
                                    <td>{item.workTitle}</td>
                                    <td>{item.type}</td>
                                    <td className={`status-${item.state?.toLowerCase()}`}>
                                        {item.state}
                                    </td>
                                    <td>{item.grade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Average data={selectedItems} />
                </div>
            )}
        </div>
    );
}
