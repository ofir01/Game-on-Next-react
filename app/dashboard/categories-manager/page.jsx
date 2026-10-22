'use client';

import { useState } from 'react';
import Category from '../../Component/Category/Category';
import { CheckCircle2 } from 'lucide-react';
import { useCategories, useCategoriesActions } from "../../hooks/games/useCategories";

export default function CategoriesManager() {
    const { data: categories = [], isLoading, isError, error } = useCategories();//מערך של קטגוריות
    const { createCategory, deleteCategory, updateCategory } = useCategoriesActions();//API לביצוע שינויים

    const [selectedCategory, setSelectedCategory] = useState(null);//בחירת קטגוריה
    const [newCategory, setNewCategory] = useState('');//בתיבה של השם בשביל יצירת קטגוריה חדשה
    const [editValue, setEditValue] = useState('');//בתיבה של השם בשביל עריכה או מחיקה


    //מוסיף ומוריד בחירה מתוך משתנה יחיד
    const handleToggle = (id) => {
        setSelectedCategory((prev) => {
            if (prev === id) {
                setEditValue('');
                return null; // מאפשר ביטול בחירה
            }
            const cat = categories.find(c => c.id === id);//בשביל להוציא את השם שנבחר
            if (cat) setEditValue(cat.name);

            return id;
        });
    };

    // CREATE
    const handleCreate = async () => {
        const name = newCategory.trim();
        if (!name) return;

        // בדיקת כפילויות אצל הלקוח 
        if (chckExists(name)) {
            return;
        }

        await createCategory.mutateAsync(name);//שליחה לשרת
        setNewCategory('');
    };

    // בדיקת כפילויות אצל הלקוח 
    function chckExists(name) {
        const exists = categories.some(c => c.name.toLowerCase().trim() === name.toLowerCase().trim());
        if (exists) {
            alert('Category already exists');
        }
        return exists;
    }

    // UPDATE 
    const handleUpdate = async () => {
        const name = editValue.trim();
        //אם לא קיים או השורה ריקה
        if (!selectedCategory || !name) return;


        // בדיקת כפילויות אצל הלקוח 
        if (chckExists(name)) {
            return;
        }

        await updateCategory.mutateAsync({
            id: selectedCategory,
            name
        });

        setSelectedCategory(null);
        setEditValue('');
    };

    // DELETE
    const handleDelete = async () => {
        if (!selectedCategory) return;

        await deleteCategory.mutateAsync(selectedCategory);

        setSelectedCategory(null);
        setEditValue('');
    };

    return (
        <div className="min-h-screen bg-[#050816] text-white p-6 flex justify-center">
            <div className="w-full max-w-5xl rounded-3xl border border-cyan-500/20 bg-white/5 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,255,255,0.12)] overflow-hidden">

                {/* HEADER */}
                <div className="border-b border-white/10 px-8 py-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        Categories Manager
                    </h1>

                    <p className="text-gray-400 text-sm mt-2">
                        Click to select, edit or delete categories.
                    </p>

                    <Category
                        categories={categories}
                        selectedCategories={selectedCategory ? [selectedCategory] : []}
                        onToggle={handleToggle}
                        isLoading={isLoading}
                        isError={isError}
                        error={error}
                        containerClassName="mt-4"
                        buttonClassName="px-3 py-1.5 text-xs rounded-full"
                        activeClassName="bg-cyan-500/20 border-cyan-500 text-cyan-400"
                        inactiveClassName="bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600"
                        Icon={CheckCircle2}
                    />
                </div>

                {/* BODY */}
                <div className="p-8 space-y-8">

                    {/* EDIT */}
                    {selectedCategory && (
                        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-cyan-300">
                                Edit Category
                            </h2>

                            <input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-[#0b1225] border border-white/10 focus:border-cyan-400 outline-none"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={handleUpdate}
                                    className="flex-1 py-2 rounded-xl bg-cyan-500/20 text-cyan-300"
                                >
                                    Update
                                </button>

                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-300"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CREATE */}
                    {!selectedCategory && (
                        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-purple-300">
                                Create Category
                            </h2>

                            <div className="flex gap-3">
                                <input
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl bg-[#0b1225] border border-white/10"
                                    placeholder="New category..."
                                />

                                <button
                                    onClick={handleCreate}
                                    className="px-6 rounded-xl bg-purple-500/20 text-purple-300"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}