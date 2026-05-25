import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useGameActions } from '../../hooks/useGame'; 

export default function DeleteGame({ game }) {
    const { deleteGame, deleteIsPending } = useGameActions();

    const handleDelete = (id, title) => {
        // שימוש ב-confirm פשוט או במודל מעוצב
        if (confirm(`האם אתה בטוח שברצונך למחוק את ${title}?`)) {
            deleteGame(id)
        }
    };

    return (
        <button
            onClick={() => handleDelete(game.id, game.title)}
            disabled={deleteIsPending}
            className={`p-2 bg-slate-900/80 backdrop-blur-md rounded-lg transition-colors shadow-lg border border-white/10 
                ${deleteIsPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600 text-red-400 hover:text-white'}`}
            title="מחק משחק"
        >
            {deleteIsPending ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Trash2 size={16} />
            )}
        </button>
    );
}