import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, Film } from 'lucide-react';
import '../App.css';
import moonLogo from '../assets/moon_logo_ball.svg';

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=uk-UA`
        );
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error("Помилка завантаження деталей:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return (
      <div className="home-container" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh' 
      }}>
          {/* Логотип з анімацією */}
          <img 
              src={moonLogo} 
              alt="Loading..." 
              style={{ 
                  width: '100px', 
                  height: '100px',
                  animation: 'pulse 1.5s infinite ease-in-out',
                  filter: 'drop-shadow(0 0 15px #8a3ffc)'
              }} 
          />
          <p style={{ 
              marginTop: '20px', 
              color: '#8a3ffc', 
              fontWeight: 'bold', 
              letterSpacing: '2px',
              opacity: 0.8
          }}>
              ЗАВАНТАЖЕННЯ...
          </p>
      </div>
  ); 
  if (!movie || movie.success === false) return <div className="home-container" style={{ textAlign: 'center', paddingTop: '100px', color: 'white' }}>Фільм не знайдено :(</div>;

  return (
    <div className="home-container" style={{ padding: 0, overflowX: 'hidden' }}>
      {/* ФОНОВИЙ БАНЕР (Backdrop) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '50vh',
        backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 26, 0.3), #0f0f1a), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '0 50px 40px'
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            position: 'absolute',
            top: '30px',
            left: '30px',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          className="logout-btn"
        >
          <ArrowLeft size={20} /> Назад
        </button>

        <h1 style={{ fontSize: '48px', margin: 0, textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>{movie.title}</h1>
      </div>

      {/* ОСНОВНИЙ КОНТЕНТ */}
      <div style={{ 
        display: 'flex', 
        gap: '40px', 
        padding: '40px 50px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        flexWrap: 'nowrap' 
      }}>
        
        {/* ПОСТЕР */}
        <div style={{ flexShrink: 0 }}>
          <img 
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/1a1a2e/ffffff?text=No+Poster'} 
            alt={movie.title} 
            style={{ 
              width: '300px', 
              borderRadius: '20px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
        </div>

        {/* ДЕТАЛІ */}
        <div style={{ flex: 1 }}>
          {movie.tagline && (
            <p style={{ color: '#8a3ffc', fontStyle: 'italic', fontSize: '18px', marginBottom: '20px' }}>
              — {movie.tagline}
            </p>
          )}

          {/* ІКОНКИ */}
          <div style={{ display: 'flex', gap: '25px', marginBottom: '30px' }}>
            <div style={infoItemStyle} title="Рейтинг">
              <Star size={20} color="#ffcc00" fill="#ffcc00" />
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{movie.vote_average?.toFixed(1)}</span>
            </div>
            
            <div style={infoItemStyle} title="Дата виходу">
              <Calendar size={20} color="#a0a0b5" />
              <span>{new Date(movie.release_date).getFullYear()}</span>
            </div>

            <div style={infoItemStyle} title="Тривалість">
              <Clock size={20} color="#a0a0b5" />
              <span>{movie.runtime} хв</span>
            </div>

            <div style={infoItemStyle} title="Жанри">
              <Film size={20} color="#a0a0b5" />
              <span>{movie.genres?.map(g => g.name).join(', ')}</span>
            </div>
          </div>

          <h3 style={{ color: 'white', fontSize: '22px', marginBottom: '15px', borderLeft: '4px solid #8a3ffc', paddingLeft: '15px' }}>
            Опис фільму
          </h3>
          <p style={{ 
            fontSize: '16px', 
            lineHeight: '1.8', 
            color: '#a0a0b5', 
            textAlign: 'justify' 
          }}>
            {movie.overview || 'Опис українською мовою поки відсутній.'}
          </p>

          {/* ДОДАТКОВА ІНФОРМАЦІЯ */}
          <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px' }}>
            <p style={{ margin: '5px 0' }}><strong style={{ color: '#8a3ffc' }}>Країна:</strong> {movie.production_countries?.map(c => c.name).join(', ')}</p>
            <p style={{ margin: '5px 0' }}><strong style={{ color: '#8a3ffc' }}>Бюджет:</strong> ${movie.budget?.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const infoItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'white'
};

export default MovieDetails;