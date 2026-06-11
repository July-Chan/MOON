import React, { useState, useEffect, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import axios from 'axios';
import { Star, FolderPlus, X, ChevronDown } from 'lucide-react';
import '../App.css'; 
import './Discover.css'; 

const Discover = () => {
  const [movies, setMovies] = useState([]);
  
  // 🔥 НОВЕ: Використовуємо Ref для миттєвого доступу до індексу (щоб кнопки не плутали картки)
  const [currentIndex, setCurrentIndex] = useState(-1);
  const currentIndexRef = useRef(-1); 
  
  const [showInfo, setShowInfo] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Рефи для кожної картки (генеруються динамічно)
  const [cardRefs, setCardRefs] = useState([]);

  // 🔥 НОВЕ: Робота з пам'яттю браузера (localStorage)
  const getSeenMovies = () => JSON.parse(localStorage.getItem('moon_seen_movies')) || [];
  const addSeenMovie = (id) => {
    const seen = getSeenMovies();
    if (!seen.includes(id)) {
      localStorage.setItem('moon_seen_movies', JSON.stringify([...seen, id]));
    }
  };

  const fetchMovies = async (pageNum) => {
    setIsLoadingMore(true);
    try {
      const res = await axios.get(`https://moon-z1lm.onrender.com/api/movies/popular?language=uk-UA&page=${pageNum}`);
      
      const seenIds = getSeenMovies();
      // Відфільтровуємо фільми, які користувач вже бачив/свайпав
      const newMovies = res.data.filter(m => !seenIds.includes(m.id));

      if (newMovies.length === 0) {
        // Якщо всі фільми на цій сторінці вже бачили, одразу вантажимо наступну
        const next = pageNum + 1;
        setPage(next);
        fetchMovies(next);
        return;
      }

      setMovies(newMovies);
      
      // Створюємо правильну кількість рефів для нової пачки фільмів
      setCardRefs(Array(newMovies.length).fill(0).map(() => React.createRef()));
      
      const lastIndex = newMovies.length - 1;
      setCurrentIndex(lastIndex);
      currentIndexRef.current = lastIndex;

    } catch (error) {
      console.error("Помилка завантаження фільмів:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMovies(1);
  }, []);

  // Ця функція спрацьовує і при свайпі пальцем, і при кліку на кнопку
  const handleSwipe = (direction, movieToSwipe) => {
    setShowInfo(false); 
    
    // 🔥 Одразу запам'ятовуємо, що ми його побачили, щоб більше ніколи не показувати
    addSeenMovie(movieToSwipe.id);

    if (direction === 'right') {
      console.log('Відкриваємо модалку оцінки для:', movieToSwipe.title);
      // ТУТ ВСТАВ СВІЙ КОД ДЛЯ ВІДКРИТТЯ ВІКНА ОЦІНКИ
      // setIsRateModalOpen(true);
      // setCurrentMovie(movieToSwipe);
    } else if (direction === 'down') {
      setShowInfo(true);
      // setCurrentMovie(movieToSwipe);
    }
    
    // Миттєво зменшуємо індекс
    const nextIndex = currentIndexRef.current - 1;
    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;

    // Якщо картки закінчилися - вантажимо нові
    if (nextIndex < 0 && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage);
    }
  };

  // Програмний свайп через кнопки
  const swipeProgrammatically = (dir) => {
    const currentIdx = currentIndexRef.current; // Беремо НАЙСВІЖІШИЙ індекс
    if (currentIdx >= 0 && currentIdx < movies.length && cardRefs[currentIdx]?.current) {
      cardRefs[currentIdx].current.swipe(dir);
    }
  };

  return (
    // 🔥 ВАЖЛИВО: overflow: 'hidden' не дає свайпнутим карткам висіти за екраном
    <div className="discover-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '85vh', position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px', width: '100%', justifyContent: 'center' }}>
        
        {/* КНОПКА СКІП */}
        <button 
          className="desktop-swipe-btn skip-btn" 
          onClick={() => swipeProgrammatically('left')}
          disabled={isLoadingMore}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '60px', height: '60px', color: '#a0a0b5', cursor: 'pointer', display: window.innerWidth > 768 ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s', zIndex: 10 }}
        >
          <X size={30} />
        </button>

        {/* СТЕК КАРТОК */}
        <div className="card-stack" style={{ position: 'relative', width: '320px', height: '480px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          
          {isLoadingMore && (
            <div style={{ position: 'absolute', color: '#8a3ffc', fontWeight: 'bold' }}>
              Радар шукає нові фільми...
            </div>
          )}

          {!isLoadingMore && movies.map((movie, index) => (
            <TinderCard
              ref={cardRefs[index]} 
              key={`${movie.id}`} 
              className="swipe"
              onSwipe={(dir) => handleSwipe(dir, movie)} 
              preventSwipe={['up']} 
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            >
              <div 
                className="movie-swipe-card" 
                style={{
                  backgroundColor: '#1a1a2e',
                  backgroundImage: `linear-gradient(to bottom, transparent 40%, #0f0f1a), url(${
                    movie.poster_path 
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                      : 'https://placehold.co/500x750/1a1a2e/ffffff?text=No+Poster'
                  })`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  width: '100%', height: '100%', borderRadius: '20px',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.8)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '25px',
                  cursor: 'grab'
                }}
              >
                <h2 style={{ color: 'white', margin: '0 0 10px 0', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>{movie.title}</h2>
                <span style={{ color: '#b19cd9', fontSize: '14px', fontWeight: 'bold' }}>{movie.vote_average?.toFixed(1)}★ TMDB</span>
              </div>
            </TinderCard>
          ))}
        </div>

        {/* КНОПКА ОЦІНИТИ */}
        <button 
          className="desktop-swipe-btn rate-btn" 
          onClick={() => swipeProgrammatically('right')}
          disabled={isLoadingMore}
          style={{ background: 'rgba(138, 63, 252, 0.2)', border: '1px solid rgba(138, 63, 252, 0.5)', borderRadius: '50%', width: '60px', height: '60px', color: '#b19cd9', cursor: 'pointer', display: window.innerWidth > 768 ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s', zIndex: 10 }}
        >
          <Star size={30} fill="#8a3ffc" />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px', zIndex: 10 }}>
        <button 
          onClick={() => swipeProgrammatically('down')}
          style={{ background: '#141424', border: '1px solid #4e4e6a', padding: '12px 25px', borderRadius: '30px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <ChevronDown size={20} /> Про фільм
        </button>
      </div>

      {/* ТУТ ТВОЇ МОДАЛКИ (Інфо, списки, оцінки) */}
    </div>
  );
};

export default Discover;