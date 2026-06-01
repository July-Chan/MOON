import React, { useState, useEffect } from 'react';
import { FolderOpen, Pencil, Trash2, X } from 'lucide-react'; // 🔥 Додали X до імпортів
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
                console.error("Помилка:", error);
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
            console.error("Помилка створення:", error);
        }
    };

    const handleDeleteList = async (e, listId) => {
        e.stopPropagation();
        
        if (!window.confirm(t('confirmDeleteFolder', 'Точно хочеш видалити цю папку?'))) return;

        try {
            await axios.delete(`https://moon-z1lm.onrender.com/api/lists/${listId}`);
            setLists(lists.filter(list => list.id !== listId));
        } catch (error) {
            console.error("Помилка видалення:", error);
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
            console.error("Помилка оновлення:", error);
        }
    };

    return (
        <div className="lists-container">
            <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '20px', borderLeft: '4px solid #8a3ffc', paddingLeft: '15px', textAlign: 'left' }}>
                {t('myListsTitle', 'Мої списки')}
            </h2> 

            {/* 🔥 ОНОВЛЕНИЙ ДИЗАЙН РЯДКА СТВОРЕННЯ ПАПКИ */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', justifyContent: 'flex-start' }}>
                <form 
                    onSubmit={handleCreateList} 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: '20px', 
                        padding: '6px 18px', 
                        border: '1px solid rgba(138, 63, 252, 0.3)',
                        transition: 'all 0.3s ease',
                        width: '100%',
                        maxWidth: '400px'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#8a3ffc'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(138, 63, 252, 0.3)'}
                >
                    <FolderOpen size={18} color="#a0a0b5" />
                    <input
                        type="text"
                        placeholder={t('newFolderPlaceholder', 'Назва нової папки...')}
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'white', 
                            padding: '8px 12px', 
                            width: '100%', 
                            outline: 'none', 
                            fontSize: '16px', 
                            fontFamily: 'Inter, sans-serif' 
                        }}
                    />
                    {newListName && (
                        <X 
                            size={18} 
                            color="#a0a0b5" 
                            style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
                            onMouseEnter={(e) => e.target.style.color = 'white'}
                            onMouseLeave={(e) => e.target.style.color = '#a0a0b5'}
                            onClick={() => setNewListName('')} 
                        />
                    )}
                </form>

                <button 
                    onClick={handleCreateList} 
                    style={{
                        padding: '0 25px', 
                        borderRadius: '20px', 
                        backgroundColor: '#8a3ffc', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontWeight: 'bold',
                        fontSize: '15px',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 15px rgba(138, 63, 252, 0.3)',
                        whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#9b59b6';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#8a3ffc';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {t('createFolderBtn', 'Створити папку')}
                </button>
            </div>

            {/* СІТКА ПАПОК */}
            <div className="folders-grid-layout">
                {lists.map((list) => (
                    <div key={list.id} className="folder-card" onClick={() => navigate(`/lists/${list.id}`)}>
                        
                        <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-end', marginBottom: '5px' }}>
                            <button onClick={(e) => startEditing(e, list)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                                <Pencil size={16} color="#a0a0b5" />
                            </button>
                            <button onClick={(e) => handleDeleteList(e, list.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                                <Trash2 size={16} color="#ff4757" />
                            </button>
                        </div>

                        <div className="folder-cover-grid">
                            {list.movies && list.movies.length > 0 ? (
                                list.movies.slice(0, 4).map((movie, index) => (
                                    <img 
                                        key={index} 
                                        src={movie.posterPath} 
                                        alt="poster" 
                                        className="grid-poster" 
                                    />
                                ))
                            ) : (
                                <div className="empty-folder">
                                    <FolderOpen size={48} color="#6a5acd" />
                                </div>
                            )}
                        </div>
                        
                        {editingListId === list.id ? (
                            <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                <input 
                                    type="text" 
                                    value={editingName} 
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onClick={(e) => e.stopPropagation()} 
                                    style={{ padding: '5px', borderRadius: '5px', width: '100px', backgroundColor: '#2a2a4a', color: 'white', border: '1px solid #6a5acd' }}
                                />
                                <button onClick={(e) => handleSaveEdit(e, list.id)} style={{ background: '#00b894', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>✓</button>
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