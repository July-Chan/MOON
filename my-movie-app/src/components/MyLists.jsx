import React, { useState, useEffect } from 'react';
import { FolderOpen, Pencil, Trash2, X } from 'lucide-react'; 
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyLists.css'; 

const MyLists = () => {
    const { t } = useTranslation(); 

    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState('');
    
    const [editingListId, setEditingListId] = useState(null);
    const [editingName, setEditingName] = useState('');

    const navigate = useNavigate();
    const userEmail = localStorage.getItem('userEmail'); 

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const response = await axios.get(`https://moon-z1lm.onrender.com/api/lists?userId=${userEmail}`);
                setLists(response.data);
            } catch (error) {
                console.error("Помилка завантаження списків:", error);
            }
        };
        if (userEmail) fetchLists();
    }, [userEmail]);

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        try {
            const response = await axios.post('https://moon-z1lm.onrender.com/api/lists', {
                userId: userEmail,
                name: newListName
            });
            setLists([...lists, response.data]);
            setNewListName(''); 
        } catch (error) {
            console.error("Помилка створення списку:", error);
        }
    };

    const handleDeleteList = async (e, listId) => {
        e.stopPropagation(); // Не дає перейти в папку при кліку на кошик
        if (!window.confirm(t('confirmDeleteFolder', 'Точно хочеш видалити цю папку?'))) return;

        try {
            await axios.delete(`https://moon-z1lm.onrender.com/api/lists/${listId}`);
            setLists(lists.filter(list => list.id !== listId));
        } catch (error) {
            console.error("Помилка видалення списку:", error);
        }
    };

    const startEditing = (e, list) => {
        e.stopPropagation();
        setEditingListId(list.id);
        setEditingName(list.name);
    };

    const handleSaveEdit = async (e, listId) => {
        e.stopPropagation();
        if (!editingName.trim()) return;

        try {
            await axios.put(`https://moon-z1lm.onrender.com/api/lists/${listId}`, { name: editingName });
            setLists(lists.map(list => list.id === listId ? { ...list, name: editingName } : list));
            setEditingListId(null);
        } catch (error) {
            console.error("Помилка оновлення назви:", error);
        }
    };

    return (
        <div className="lists-container">
            <h2 className="lists-title">
                {t('myListsTitle', 'Мої списки')}
            </h2> 

            {/* Контейнер створення нової папки */}
            <div className="create-list-container">
                <form onSubmit={handleCreateList} className="create-list-form">
                    <FolderOpen size={18} color="#a0a0b5" className="form-icon-left" />
                    <input
                        type="text"
                        className="create-list-input"
                        placeholder={t('newFolderPlaceholder', 'Назва нової папки...')}
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                    />
                    {newListName && (
                        <X 
                            size={18} 
                            color="#a0a0b5" 
                            className="form-icon-right"
                            onClick={() => setNewListName('')} 
                        />
                    )}
                </form>

                <button onClick={handleCreateList} className="create-list-btn">
                    {t('createFolderBtn', 'Створити папку')}
                </button>
            </div>

            {/* СІТКА ПАПОК */}
            <div className="folders-grid-layout">
                {lists.map((list) => (
                    <div key={list.id} className="folder-card" onClick={() => navigate(`/lists/${list.id}`)}>
                        
                        {/* Панель дій (Редагувати / Видалити) */}
                        <div className="folder-actions">
                            <button onClick={(e) => startEditing(e, list)} className="action-btn">
                                <Pencil size={15} color="#a0a0b5" />
                            </button>
                            <button onClick={(e) => handleDeleteList(e, list.id)} className="action-btn delete-btn">
                                <Trash2 size={15} color="#ff4757" />
                            </button>
                        </div>

                        {/* Колаж із 4 постерів всередині папки */}
                        <div className="folder-cover-grid">
                            {list.movies && list.movies.length > 0 ? (
                                list.movies.slice(0, 4).map((movie, index) => (
                                    <img 
                                        key={index} 
                                        src={movie.posterPath || movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.posterPath || movie.poster_path}` : 'https://placehold.co/300x450/1a1a2e/ffffff?text=No+Poster'} 
                                        alt="poster" 
                                        className="grid-poster" 
                                    />
                                ))
                            ) : (
                                <div className="empty-folder">
                                    <FolderOpen size={40} color="#8a3ffc" />
                                </div>
                            )}
                        </div>
                        
                        {/* Назва папки або інпут редагування */}
                        {editingListId === list.id ? (
                            <div className="edit-input-container" onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="text" 
                                    className="folder-edit-input"
                                    value={editingName} 
                                    onChange={(e) => setEditingName(e.target.value)}
                                />
                                <button onClick={(e) => handleSaveEdit(e, list.id)} className="save-edit-btn">✓</button>
                            </div>
                        ) : (
                            <span className="folder-name">{list.name}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyLists;