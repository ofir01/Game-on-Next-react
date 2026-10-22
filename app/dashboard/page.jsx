'use client';

import { redirect } from 'next/navigation';

export default function DashboardIndex() {
    // מעביר את המשתמש אוטומטית לטאב הפרופיל
    redirect('/dashboard/profile'); 
}