"use client";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#AF19FF", "#FF4560", "#00E396"
];

export default function CoursesPie({ data }) {
  // הופך את האובייקט למערך עם שם הקורס וכמות המשימות
  const chartData = Object.keys(data).map((course, index) => ({
    name: course,
    value: Object.keys(data[course]).length
  }));

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={120}
        fill="#8884d8"
        label
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}
