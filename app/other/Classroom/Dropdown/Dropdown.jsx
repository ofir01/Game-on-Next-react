"use client";

import { useState } from "react";
import "./Dropdown.css";

export default function Dropdown({ label, options = [], value, onChange }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="dropdown-wrap" onBlur={() => setTimeout(() => setOpen(false), 150)}>
            <button
                className="select-btn"
                onClick={() => setOpen(v => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {value || label} ▾
            </button>

            {open && (
                <ul className="options-list" role="listbox" tabIndex={0}>
                    <li
                        className={`option-item ${value === "" ? "active" : ""}`}
                        onClick={() => { onChange(""); setOpen(false); }}
                    >
                        כל האפשרויות
                    </li>

                    {options.map((opt, i) => (
                        <li
                            key={`${opt}-${i}`}
                            className={`option-item ${value === opt ? "active" : ""}`}
                            onClick={() => { onChange(opt); setOpen(false); }}
                        >
                            {opt}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
