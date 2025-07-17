import { useAuth } from "@/contexts/AuthContext";
import { AI_MODELS } from "@/utils/ai-models";
import type { AIRecommendations, UserMovieFeedback, UserPreferences, UserRecommendationsFeedback } from "@/utils/types";
import { GoogleGenAI } from "@google/genai";
import useFeedback from "./use-feedback";
import useRecommendation from "./use-recommendation";
import useTMDB from "./use-tmdb";
interface CacheEntry {
    data: AIRecommendations[];
    timestamp: number;
    expiresAt: number;
}
interface RecommendationCache {
    [key: string]: CacheEntry;
}

const useAI = () => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const { userData } = useAuth();
    const { getUserFeedback } = useFeedback();
    const { getUserRecommendationsFeedback } = useRecommendation();
    const { getMovieByTitle } = useTMDB();
    const CACHE_DURATION = 60 * 60 * 1000; // 1 hora
    const CACHE_KEY = 'cinematch_recommendations_cache';

    const getCache = (): RecommendationCache => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            return cached ? JSON.parse(cached) : {};
        } catch (error) {
            console.error('Erro ao ler cache:', error);
            return {};
        }
    };

    const setCache = (cache: RecommendationCache) => {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        } catch (error) {
            console.error('Erro ao salvar cache:', error);
        }
    };

    const generateCacheKey = (preferences: UserPreferences, special: boolean): string => {
        const key = {
            genres: preferences.favoriteGenres?.sort(),
            directors: preferences.favoriteDirectors?.sort(),
            actors: preferences.favoriteActors?.sort(),
            minYear: preferences.minReleaseYear,
            maxDuration: preferences.maxDuration,
            adultContent: preferences.acceptAdultContent,
            special,
            date: special ? new Date().toDateString() : null // Para recomendações especiais, considerar a data
        };
        return btoa(JSON.stringify(key));
    };

    const cleanExpiredCache = (cache: RecommendationCache): RecommendationCache => {
        const now = Date.now();
        const cleanedCache: RecommendationCache = {};

        Object.keys(cache).forEach(key => {
            if (cache[key].expiresAt > now) {
                cleanedCache[key] = cache[key];
            }
        });

        return cleanedCache;
    };

    const generateMovieRecommendations = async (preferences: UserPreferences, special: boolean = false): Promise<AIRecommendations[]> => {
        const cacheKey = generateCacheKey(preferences, special);
        const cache = getCache();
        const cleanedCache = cleanExpiredCache(cache);

        // Verifica se existe cache válido
        if (cleanedCache[cacheKey]) {
            console.log('Usando recomendações do cache');
            return cleanedCache[cacheKey].data;
        }
        const response = await ai.models.generateContent({
            model: AI_MODELS.GEMINI_2_5_FLASH_LITE,
            contents: await recommendationPrompt(preferences, 10, special),
        });

        if (!response.text) {
            throw new Error("Failed to generate recommendations");
        }

        let jsonText = response.text;
        console.log(jsonText);

        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const recommendations: AIRecommendations[] = JSON.parse(jsonText);

        const recommendationsWithPosters = await Promise.all(
            recommendations.map(async (movie) => {
                try {
                    const searchResponse = await getMovieByTitle(movie.title);
                    if (searchResponse.results && searchResponse.results.length > 0) {
                        const posterPath = searchResponse.results[0].poster_path;
                        return {
                            ...movie,
                            poster_url: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null
                        };
                    }

                    return { ...movie, poster_url: null };
                } catch (error) {
                    console.error(`Error fetching poster for ${movie.title}:`, error);
                    return { ...movie, poster_url: null };
                }
            })
        );

        // Salva no cache
        const now = Date.now();
        cleanedCache[cacheKey] = {
            data: recommendationsWithPosters,
            timestamp: now,
            expiresAt: now + CACHE_DURATION
        };

        setCache(cleanedCache);

        return recommendationsWithPosters;
    }

    const recommendationPrompt = async (preferences: UserPreferences, length: number, special: boolean = false) => {
        if (!userData) return ``;

        const watchedMovies = (await getUserFeedback(userData?.id)).data;
        const recommendationsFeedback = (await getUserRecommendationsFeedback(userData?.id)).data;

        let message = `
            Você é um cinéfilo especialista em recomendar filmes personalizados. 
      
            Contexto do usuário:
            - Gêneros preferidos: ${preferences.favoriteGenres}
            - Diretores favoritos: ${preferences.favoriteDirectors}
            - Atores favoritos: ${preferences.favoriteActors}
            - Período preferido: Filmes após ${preferences.minReleaseYear}
            - Duração máxima: ${preferences.maxDuration} minutos
            - Aceita conteúdo adulto: ${preferences.acceptAdultContent}
        `

        if (watchedMovies.length > 0) {
            message += `
            - Filmes assistidos: ${watchedMovies.map((movie: UserMovieFeedback) => movie.movieTitle).join(", ")}
            - Avaliações sobre filmes assistidos: ${watchedMovies.map((movie: UserMovieFeedback) => {
                return movie.review ? `${movie.movieTitle} - ${movie.rating} estrelas - "${movie.review}"` : `${movie.movieTitle} - ${movie.rating} estrelas`;
            }).join(", ")}
            `
        }

        if (recommendationsFeedback.length > 0) {
            message += `
            - Recomendações anteriores: ${recommendationsFeedback.map((rec: UserRecommendationsFeedback) => rec.movieTitle).join(", ")}
            - Avaliações sobre recomendações: ${recommendationsFeedback.map((rec: UserRecommendationsFeedback) => {
                return `${rec.movieTitle} - ${rec.feedback} ${rec.detailedFeedback ? `Feedback detalhado: "${rec.detailedFeedback}"` : ''}`;
            }).join(", ")}
            `
        }

        message += `
            Sua tarefa:
            1. Sugira ${length} filmes que combinem com o perfil
            2. Para cada filme, explique por que foi escolhido
            3. Inclua 1 sugestão fora da zona de conforto

            Estrutura da resposta:
            Recomende filmes no formato JSON com:
            - title
            - year
            - genres
            - overview
            - why_recommend
            - streaming_services (lista de serviços de streaming onde está disponível no Brasil. Ex: ["Netflix", "Prime Video", "Star+"], caso seja do cinema, retorne ["Cinema"])

            Regras:
            1. Priorize gêneros curtidos
            2. Evite gêneros rejeitados
            3. Inclua 1 filme surpresa baseado em padrões similares
            4. Limite a 200 caracteres por "why_recommend"
            6. Para "streaming_services":
            - Liste apenas serviços válidos e verificáveis (ou cinema)
            - Use nomes oficiais (ex: "GloboPlay", não "Globo Play")
            - Se não houver informação, retorne array vazio
            7. Não inclua comentários ou texto adicional
            8. Verifique cuidadosamente a formatação JSON, os valores do JSON devem ser em português do Brasil
            9. Nunca use caracteres especiais ou Unicode
            10. Utilize todo o contexto do usuário de forma inteligente para gerar as melhores recomendações possíveis
            (Retorne apenas o JSON válido, sem markdown ou formatação adicional)
            ${special ? recommendationPromptSpecial() : ''}
        `

        return message.trim();
    }

    const recommendationPromptSpecial = () => {
        const now = new Date();
        const month = now.getMonth() + 1; // Meses são 0-indexados
        const day = now.getDate();

        let specialPrompt = `
            [SISTEMA]
                Neste contexto, estamos em uma função de recomendação especial, ou seja, devemos sugerir filmes que sejam relevantes para o período atual sem levar em conta as preferências do usuário.
                Sua tarefa é sugerir filmes que sejam populares ou bem avaliados atualmente, levando em consideração o período do ano.
            [/SISTEMA]
        `;

        if (month >= 11 && day >= 20) {
            specialPrompt += `Como estamos perto do Natal, sugira filmes natalinos`;
        } else if (month === 10) {
            specialPrompt += `Como estamos perto do Halloween, sugira filmes de Halloween`;
        } else if (month === 2) {
            specialPrompt += `Como estamos perto do Dia dos Namorados, sugira filmes românticos para o Dia dos Namorados`;
        } else if (month === 6) {
            specialPrompt += `Como estamos perto de São João, sugira filmes de São João`;
        } else {
            specialPrompt += `Como estamos em um período normal, sugira filmes que sejam populares ou bem avaliados atualmente`;
        }

        return specialPrompt;
    }

    return {
        generateMovieRecommendations
    }
}

export default useAI;