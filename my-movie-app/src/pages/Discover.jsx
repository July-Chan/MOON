import React, { useState, useEffect, useMemo, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import axios from 'axios';
import { Star, Info, FolderPlus, X, ChevronDown } from 'lucide-react';
import '../App.css'; 

const Discover = () => {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [showInfo, setShowInfo] = useState(false);
  
  // 🔥 НОВЕ: Стан для відстеження сторінки
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);

  // Створюємо 20 рефів (TMDB повертає по 20 фільмів на сторінку)
  const cardRefs = useMemo(() => Array(20).fill(0).map(i => React.createRef()), []);

  // 🔥 НОВЕ: Окрема функція завантаження, яка приймає номер сторінки
  const fetchMovies = async (pageNum) => {
    setIsLoadingMore(true);
    try {
      // Важливо: Твій бекенд має приймати параметр page!
      const res = await axios.get(`https://moon-z1lm.onrender.com/api/movies/popular?language=uk-UA&page=${pageNum}`);
      
      setMovies(res.data);
      setCurrentIndex(res.data.length - 1); // Скидаємо індекс на верхню картку нової пачки
    } catch (error) {
      console.error("Помилка завантаження фільмів:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Первинне завантаження (1 сторінка)
  useEffect(() => {
    fetchMovies(1);
  }, []);

  // 🔥 НОВЕ: Відстежуємо, коли закінчилися картки
  useEffect(() => {
    if (currentIndex < 0 && movies.length > 0) {
      // Якщо індекс впав нижче нуля, значить всі змахнули. Вантажимо наступну сторінку!
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage);
    }
  }, [currentIndex, movies.length, page]);

  const handleSwipe = (direction, movieToSwipe) => {
    setShowInfo(false); 
    setCurrentMovie(movieToSwipe);

    if (direction === 'right') {
      setIsRateModalOpen(true);
    } else if (direction === 'down') {
      setShowInfo(true);
    }
    
    // Зменшуємо індекс. Коли він стане -1, спрацює useEffect вище і завантажить нові!
    setCurrentIndex(prev => prev - 1);
  };

  const swipeProgrammatically = (dir) => {
    if (currentIndex >= 0 && currentIndex < movies.length) {
      cardRefs[currentIndex].current.swipe(dir);
    }
  };

  return (
    <div className="discover-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '85vh', position: 'relative' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px', width: '100%', justifyContent: 'center' }}>
        
        {/* Кнопка СКІП */}
        <button 
          className="desktop-swipe-btn skip-btn" 
          onClick={() => swipeProgrammatically('left')}
          disabled={isLoadingMore}
          style={{ /* твої стилі */ display: window.innerWidth > 768 ? 'flex' : 'none' }}
        >
          <X size={30} />
        </button>

        {/* СТЕК КАРТОК */}
        <div className="card-stack" style={{ position: 'relative', width: '320px', height: '480px' }}>
          
          {/* Показуємо лоадер, коли вантажиться нова пачка */}
          {isLoadingMore && (
            <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#8a3ffc' }}>
              Завантаження нових фільмів...
            </div>
          )}

          {!isLoadingMore && movies.map((movie, index) => (
            <TinderCard
              ref={cardRefs[index]} 
              key={`${movie.id}-${page}`} // Унікальний ключ, щоб React розумів, що це нові картки
              className="swipe"
              onSwipe={(dir) => handleSwipe(dir, movie)} 
              preventSwipe={['up']} 
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            >
              <div 
                className="movie-swipe-card" 
                style={{
                  backgroundImage: `linear-gradient(to bottom, transparent 50%, #0f0f1a), url(https://image.tmdb.org/t/p/w500${movie.poster_path})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  width: '100%', height: '100%', borderRadius: '20px',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.6)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '25px'
                }}
              >
                <h2 style={{ color: 'white', margin: '0 0 10px 0', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>{movie.title}</h2>
                <span style={{ color: '#b19cd9', fontSize: '14px', fontWeight: 'bold' }}>{movie.vote_average?.toFixed(1)}★ TMDB</span>
              </div>
            </TinderCard>
          ))}
        </div>

        {/* Кнопка ОЦІНИТИ */}
        <button 
          className="desktop-swipe-btn rate-btn" 
          onClick={() => swipeProgrammatically('right')}
          disabled={isLoadingMore}
          style={{ /* твої стилі */ display: window.innerWidth > 768 ? 'flex' : 'none' }}
        >
          <Star size={30} fill="#8a3ffc" />
        </button>

      </div>

      {/* Решта твого коду (кнопка "Вниз", панель інфо, модалки)... */}
    </div>
  );
};

export default Discover;