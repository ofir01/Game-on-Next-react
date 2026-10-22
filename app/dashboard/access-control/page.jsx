'use client';

import { useState, useEffect, useCallback } from 'react';
import { authService } from '../../../services/client/authService';
import { ShieldCheck, UserPlus, Trash2, Search, AlertTriangle, Loader2, ChevronDown, Users } from 'lucide-react';
import { toast } from 'sonner';

// רשימת התפקידים האפשריים לבחירה
const AVAILABLE_ROLES = [
    { id: 'Editor', name: 'Editor', description: 'Can edit existing content' },
    { id: 'Contributor', name: 'Contributor', description: 'Data entry only' },
    { id: 'Moderator', name: 'Moderator', description: 'Can manage user comments' },
];

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);// רשימת מנהלים מהשרת
    const [emailInput, setEmailInput] = useState('');// קלט אימייל למשתמש חדש או קיים
    const [selectedRole, setSelectedRole] = useState(AVAILABLE_ROLES[0].id);// ברירת מחדל לתפקיד הראשון ברשימה
    const [isLoading, setIsLoading] = useState(false);// מצב טעינה גלובלי
    const [searchQuery, setSearchQuery] = useState('');//חיפוש
    const [adminToDelete, setAdminToDelete] = useState(null); //תיבת אישור מחיקה

    // פונקציית שליפה מרכזית מהשרת - מעדכנת את ה-State מחדש
    const fetchAdmins = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await authService.getUsersRole();
            setAdmins(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load admins list: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // טעינת הנתונים הראשונית כשהעמוד עולה
    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    // הוספה או עדכון תפקיד למשתמש מול השרת ומשיכת הנתונים מחדש
    const handleAddAdmin = async (e) => {
        e.preventDefault();
        if (!emailInput) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput)) {
            toast.error('Invalid email address');
            return;
        }

        try {
            setIsLoading(true);
            // שולח בקשה לשרת לעדכן או להוסיף את התפקיד
            await authService.updateUserRole(emailInput, selectedRole);

            // משיכה מחדש של כל הרשימה המעודכנת מהשרת (מונע כפילויות ושגיאות מפתח!)
            await fetchAdmins();

            setEmailInput('');
            setSelectedRole(AVAILABLE_ROLES[0].id);
            toast.success('Permissions granted successfully');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to update permissions');
        } finally {
            setIsLoading(false);
        }
    };

    // הסרת הרשאות (איפוס תפקיד חזרה ל-User) ומשיכת הנתונים מחדש מהשרת
    const handleRemoveAdmin = async () => {
        if (!adminToDelete) return;

        try {
            setIsLoading(true);
            // מעדכן את התפקיד בשרת ל-'User' (או מוחק לפי המתודולוגיה בשרת)
            await authService.updateUserRole(adminToDelete.email);

            // משיכה מחדש של הנתונים מהשרת
            await fetchAdmins();

            toast.success('Permissions removed successfully');
            setAdminToDelete(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to remove permissions: ' + (error.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // סינון הטבלה לפי חיפוש
    const filteredAdmins = admins.filter(admin => {
        const query = searchQuery.toLowerCase();
        return (
            admin.name?.toLowerCase().includes(query) ||
            admin.email?.toLowerCase().includes(query)
        );
    });

    // פונקציית עזר לעיצוב התגים לפי תפקיד
    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'Editor': return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
            case 'Contributor': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
            case 'Moderator': return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 text-slate-200">

            {/* כותרת עליונה ומוניטור כמות אנשים */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
                <div className="group cursor-default">
                    <h1 className="text-4xl font-extrabold flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/30 group-hover:scale-110 transition-transform duration-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            <ShieldCheck className="text-purple-400" size={36} />
                        </div>
                        <span className="bg-gradient-to-r from-white via-purple-200 to-blue-300 bg-clip-text text-transparent">
                            Role & Admin Management
                        </span>
                    </h1>
                    <p className="text-slate-400 mt-3 text-sm ml-16">
                        Manage your platform's administrators. Please assign access levels carefully.
                    </p>
                </div>

                {/* קופסת כמות אנשים מחוברת ללוגיקה */}
                <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-6 py-3.5 rounded-xl border border-slate-700/50 text-sm shadow-xl hover:border-purple-500/50 transition-colors duration-300">
                    <Users className="text-purple-400" size={20} />
                    <span className="text-slate-400">Total Admins:</span>
                    <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        {admins.length}
                    </span>
                </div>
            </div>

            {/* טופס הוספה או עדכון תפקיד */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <UserPlus size={22} className="text-blue-400" />
                    Add / Update Team Member Role
                </h3>

                <form onSubmit={handleAddAdmin} className="flex flex-col lg:flex-row gap-4 items-start">
                    <div className="flex-1 w-full">
                        <input
                            type="email"
                            placeholder="Enter user email address..."
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600 text-slate-200"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                        />
                        <p className="text-xs text-slate-500 mt-2 ml-2 flex items-center gap-1">
                            <span className="text-purple-400">*</span> User must already be registered in the system. Existing users will have their roles updated.
                        </p>
                    </div>

                <div className="w-full lg:w-64 relative group">
    {/* אפקט זוהר עדינה ברקע שנדלקת בריחוף או פוקוס */}
    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-2xl opacity-30 group-hover:opacity-75 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none"></div>

    {/* תיבת הבחירה הראשית */}
    <select
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        className="relative w-full appearance-none bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-3.5 pr-11 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 text-slate-200 cursor-pointer shadow-2xl group-hover:border-purple-500/50"
    >
        {AVAILABLE_ROLES.map((role) => (
            <option
                key={role.id}
                value={role.id}
                className="bg-slate-900 text-slate-200 py-3 px-4 font-medium"
            >
                {role.name} — {role.description}
            </option>
        ))}
    </select>

    {/* חץ דינמי שזז וזוהר בריחוף */}
    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-300">
        <ChevronDown size={18} />
    </div>
</div>


                    <button
                        type="submit"
                        disabled={isLoading || !emailInput}
                        className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2 min-w-[180px]"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Grant Access'}
                    </button>
                </form>
            </div>

            {/* טבלת הניהול */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-white">Directory</h3>
                        {searchQuery && (
                            <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
                                Showing {filteredAdmins.length} of {admins.length}
                            </span>
                        )}
                    </div>
                    <div className="relative w-full sm:w-auto group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full sm:w-72 bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all focus:w-full sm:focus:w-80 duration-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-950/80 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-5">User</th>
                                    <th className="px-6 py-5">Assigned Role</th>
                                    <th className="px-6 py-5">Join Date</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredAdmins.map((admin, index) => (
                                    <tr key={admin.id || admin.email || index} className="hover:bg-slate-800/40 transition-colors duration-200 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-purple-400 font-bold border border-slate-700 shadow-inner group-hover:border-purple-500/50 transition-colors">
                                                    {admin.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-base">{admin.name || 'Unnamed User'}</div>
                                                    <div className="text-sm text-slate-400">{admin.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-all ${getRoleBadgeStyle(admin.role)}`}>
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                                            {admin.createdAt || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setAdminToDelete(admin)}
                                                className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                title="Revoke Access"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredAdmins.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-2">
                                <Search className="text-slate-500" size={24} />
                            </div>
                            <p className="text-slate-400 font-medium text-lg">No administrators found</p>
                            <p className="text-slate-500 text-sm">Try adjusting your search query.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* פופאפ אישור מחיקה */}
            {adminToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6 text-red-400">
                            <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                                <AlertTriangle size={28} className="animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-extrabold">Revoke Access</h3>
                        </div>

                        <p className="text-slate-300 mb-8 leading-relaxed text-lg">
                            Are you sure you want to remove permissions for
                            <span className="font-bold text-white mx-2 bg-slate-800 px-2 py-1 rounded-md">{adminToDelete.name || adminToDelete.email}</span>?
                            <br />
                            <span className="text-sm text-slate-400 mt-2 block">
                                This user will lose administrative access immediately.
                            </span>
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={handleRemoveAdmin}
                                disabled={isLoading}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-red-500/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Yes, Revoke'}
                            </button>
                            <button
                                onClick={() => setAdminToDelete(null)}
                                disabled={isLoading}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-bold py-3.5 rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}