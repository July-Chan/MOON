import React, { useState, useEffect } from 'react';
import { FolderOpen, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyLists.css'; 

const MyLists = () => {
    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState('');
    
    const [editingListId, setEditingListId] = useState(null);
    const [editingName, setEditingName] = useState('');

    const navigate = useNavigate();
    const userEmail = localStorage.getItem('userEmail'); 

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/lists?userId=${userEmail}`);
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
            const response = await axios.post('http://localhost:3000/api/lists', {
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
        
        if (!window.confirm("Точно хочеш видалити цю папку?")) return;

        try {
            await axios.delete(`http://localhost:3000/api/lists/${listId}`);
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
            await axios.put(`http://localhost:3000/api/lists/${listId}`, { name: editingName });
            
            setLists(lists.map(list => list.id === listId ? { ...list, name: editingName } : list));
            setEditingListId(null);
        } catch (error) {
            console.error("Помилка оновлення:", error);
        }
    };

    return (
        <div className="lists-container">
            <h2>Мої списки</h2>

            <form onSubmit={handleCreateList} className="create-list-form">
                <input
                    type="text"
                    placeholder="Назва нової папки..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                />
                <button type="submit">Створити папку</button>
            </form>

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
                                    onClick={(e) => e.stopPropagation()} // Щоб можна було клікнути в інпут
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