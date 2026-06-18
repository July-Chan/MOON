router.get('/movie/:id', async (req, res) => {
    const movieId = req.params.id;
    const lang = req.query.language || 'uk-UA';
    const shortLang = lang.split('-')[0];

    try {
        const movieRes = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}`,
            {
                params: {
                    api_key: TMDB_API_KEY,
                    language: lang,
                    append_to_response: 'credits'
                }
            }
        );

        const imagesRes = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}/images`,
            {
                params: {
                    api_key: TMDB_API_KEY,
                    include_image_language: `${shortLang},en,null`
                }
            }
        );

        const tmdbData = movieRes.data;
        const imagesData = imagesRes.data;

        const director = tmdbData.credits?.crew?.find(p => p.job === 'Director');
        const directorName = director?.name || null;

        const topCast = tmdbData.credits?.cast?.slice(0, 5).map(a => a.name) || [];

        const localizedPoster =
            imagesData.posters?.find(p => p.iso_639_1 === shortLang)?.file_path ||
            tmdbData.poster_path ||
            null;

        const localizedBackdrop =
            imagesData.backdrops?.find(b => b.iso_639_1 === shortLang)?.file_path ||
            tmdbData.backdrop_path ||
            null;

        const baseData = {
            id: tmdbData.id,
            lang,
            title: tmdbData.title,
            overview: tmdbData.overview,
            poster_path: localizedPoster,
            backdrop_path: localizedBackdrop,
            release_date: tmdbData.release_date,
            genres: tmdbData.genres?.map(g => g.name) || [],
            director: directorName,
            cast: topCast,
            vote_average: tmdbData.vote_average
        };

        const movieRef = db.collection('movies').doc(`${movieId}_${lang}`);

        // 🔥 ВСЕГДА ПЕРЕЗАПИСУЄМО (без “if exists”)
        await movieRef.set(baseData, { merge: true });

        return res.json(baseData);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'API error' });
    }
});