"use client";
import './Calculation.css';

// חישוב ממוצע
export default function Average({data}) {
  function getAverage(arr) {
    const valid = arr.map(g => parseFloat(g.grade)).filter(n => !isNaN(n));
    if (valid.length === 0) return 'אין ציונים';
    return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2);
  }


  return (
    <p className="avg">ממוצע: {getAverage(data)}</p>
  )
}