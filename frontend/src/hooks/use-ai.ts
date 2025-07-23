import { useAuth } from "@/contexts/AuthContext";
import { AI_MODELS } from "@/utils/ai-models";
import type { AIRecommendations, Message, UserMovieFeedback, UserPreferences, UserRecommendationsFeedback } from "@/utils/types";
import { GoogleGenAI } from "@google/genai";
import useFeedback from "./use-feedback";
import usePreferences from "./use-preferences";
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
    const { getUserPreferences } = usePreferences();

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

    const generateCacheKey = async (special: boolean): Promise<string> => {
        if (!userData) return '';
        const preferences = (await getUserPreferences(userData?.id)).data as UserPreferences;
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

    const generateMovieRecommendations = async (special: boolean = false, useCache: boolean = true): Promise<AIRecommendations[]> => {
        const cacheKey = await generateCacheKey(special);
        const cache = getCache();
        const cleanedCache = cleanExpiredCache(cache);

        if (useCache) {
            if (cleanedCache[cacheKey]) {
                console.log('Usando recomendações do cache');
                return cleanedCache[cacheKey].data;
            }
        }

        const response = await ai.models.generateContent({
            model: AI_MODELS.GEMINI_2_5_FLASH_LITE,
            contents: await recommendationPrompt(10, special),
        });

        if (!response.text) {
            throw new Error("Failed to generate recommendations");
        }

        let jsonText = response.text;
        const recommendationsWithPosters = await generateRecommendationsResponse(jsonText);

        if (useCache) {
            const now = Date.now();
            cleanedCache[cacheKey] = {
                data: recommendationsWithPosters,
                timestamp: now,
                expiresAt: now + CACHE_DURATION
            };

            setCache(cleanedCache);
        }

        return recommendationsWithPosters;
    }

    const generateBasePrompt = async () => {
        if (!userData) return ``;

        const preferences = (await getUserPreferences(userData?.id)).data as UserPreferences;
        const watchedMovies = (await getUserFeedback(userData?.id)).data as UserMovieFeedback[];
        const recommendationsFeedback = (await getUserRecommendationsFeedback(userData?.id)).data as UserRecommendationsFeedback[];

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
            Este usuário já recebeu recomendações suas de filmes, aqui estão os detalhes:
            - Recomendações anteriores: ${recommendationsFeedback.map((rec: UserRecommendationsFeedback) => rec.movieTitle).join(", ")}
            - Avaliações sobre recomendações: ${recommendationsFeedback.map((rec: UserRecommendationsFeedback) => {
                return `${rec.movieTitle} - ${rec.feedback} ${rec.detailedFeedback ? `Feedback detalhado: "${rec.detailedFeedback}"` : ''}`;
            }).join(", ")}
            `
        }

        return message.trim();
    }

    const recommendationPrompt = async (length: number, special: boolean = false) => {
        return `
            ${await generateBasePrompt()}

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
            11. Evite repetir filmes já assistidos ou recomendados anteriormente

            (Retorne apenas o JSON válido, sem markdown ou formatação adicional)
            ${special ? recommendationPromptSpecial() : ''}
        `.trim();
    }

    const recommendationPromptSpecial = () => {
        const now = new Date();
        const month = now.getMonth() + 1; // Meses são 0-indexados
        const day = now.getDate();

        let specialPrompt = `
            [SISTEMA ESPECIAL]
                Esta é uma recomendação especial que IGNORA completamente as preferências do usuário.
                Você deve recomendar filmes baseados APENAS em:
                1. Datas comemorativas próximas ou atuais
                2. Eventos mundiais importantes acontecendo agora
                3. Tendências cinematográficas do momento
                
                IMPORTANTE: Não leve em consideração os gostos, gêneros preferidos, ou histórico do usuário.
                Foque apenas na relevância temporal e cultural do momento atual.
            [/SISTEMA ESPECIAL]
        `;

        // Datas comemorativas específicas
        if ((month === 12 && day >= 15) || (month === 1 && day <= 7)) {
            specialPrompt += `
                Período: Natal e Ano Novo
                Recomende filmes natalinos clássicos e contemporâneos, filmes sobre reflexão de fim de ano, 
                e obras que celebrem família, esperança e renovação. Inclua tanto clássicos quanto lançamentos recentes.`;
        }
        else if (month === 10 && day >= 15) {
            specialPrompt += `
                Período: Halloween
                Recomende filmes de terror, suspense, thriller psicológico e horror. 
                Inclua desde clássicos do terror até lançamentos recentes que estejam em alta.
                Varie entre diferentes subgêneros: horror sobrenatural, slasher, terror psicológico, etc.`;
        }
        else if (month === 2 && day >= 10 && day <= 16) {
            specialPrompt += `
                Período: Dia dos Namorados
                Recomende filmes românticos de diferentes épocas e estilos: 
                romance clássico, comédia romântica, drama romântico, romance LGBTQ+.
                Inclua tanto sucessos atemporais quanto lançamentos recentes.`;
        }
        else if (month === 6 && day >= 20 && day <= 30) {
            specialPrompt += `
                Período: Festa Junina
                Recomende filmes brasileiros que retratem cultura regional, 
                filmes sobre vida no interior, tradições familiares, 
                ou que tenham conexão com a cultura popular brasileira.`;
        }
        else if (month === 9 && day >= 1 && day <= 7) {
            specialPrompt += `
                Período: Independência do Brasil
                Recomende filmes sobre história brasileira, biografias de figuras históricas,
                filmes que retratem lutas por independência ao redor do mundo,
                ou cinema nacional premiado.`;
        }
        else if (month === 3 && day >= 5 && day <= 10) {
            specialPrompt += `
                Período: Dia Internacional da Mulher
                Recomende filmes dirigidos por mulheres, filmes com protagonistas femininas fortes,
                biografias de mulheres inspiradoras, e obras que abordem questões de gênero e empoderamento.`;
        }
        else if (month === 4 && day >= 18 && day <= 25) {
            specialPrompt += `
                Período: Dia do Índio
                Recomende filmes que retratam culturas indígenas brasileiras e mundiais,
                filmes sobre preservação ambiental, conexão com a natureza,
                e obras que valorizem povos originários.`;
        }
        // Eventos baseados em tendências gerais por estação/época
        else if (month >= 6 && month <= 8) {
            specialPrompt += `
                Período: Inverno (Hemisfério Sul)
                Como estamos no inverno, recomende filmes que sejam ideais para assistir em casa:
                dramas envolventes, thrillers psicológicos, filmes de época, 
                e obras contemplativas. Inclua sucessos de streaming e lançamentos recentes.`;
        }
        else if (month >= 12 || month <= 2) {
            specialPrompt += `
                Período: Verão (Hemisfério Sul)
                Como estamos no verão, recomende filmes leves e divertidos:
                comédias, aventuras, filmes de ação, documentários inspiradores,
                e obras perfeitas para maratonas em família ou com amigos.`;
        }
        else {
            specialPrompt += `
                Período: Sem data comemorativa específica
                Recomende filmes baseados em:
                - Tendências atuais do cinema mundial
                - Filmes que estão ganhando prêmios importantes recentemente
                - Lançamentos que estão causando impacto cultural
                - Obras que estão sendo muito discutidas nas redes sociais
                - Filmes de diretores em evidência no momento
                Priorize diversidade de gêneros, países e épocas para criar uma seleção eclética e atual.`;
        }

        specialPrompt += `
            
            DIRETRIZES ADICIONAIS:
            - Ignore completamente o perfil de gostos do usuário
            - Priorize relevância cultural e temporal
            - Inclua filmes de diferentes países e décadas quando apropriado
            - Considere tanto sucessos comerciais quanto filmes de autor
            - Varie os gêneros para criar uma seleção rica e diversificada
        `;

        return specialPrompt;
    }

    const searchMovie = async (query: string) => {
        const prompt = `
            Estamos em um sistema de recomendação de filmes e você é um cinéfilo especialista em recomendar filmes personalizados. Sua tarefa é encontrar filmes que correspondam à seguinte descrição:
            ${query}
            Esta foi a pesquisa feita pelo usuário, então você deve retornar uma lista de filmes que correspondam ou se aproximem a essa pesquisa.
            Responda apenas com um JSON válido contendo uma lista de filmes, cada filme deve ter os seguintes campos:
            - title: Título do filme
            - year: Ano de lançamento
            - genres: Lista de gêneros do filme
            - overview: Sinopse do filme
            - streaming_services: Lista de serviços de streaming onde está disponível no Brasil (caso seja do cinema, retorne ["Cinema"])
        `;

        const response = await ai.models.generateContent({
            model: AI_MODELS.GEMINI_2_5_FLASH_LITE,
            contents: prompt
        });

        if (!response.text) {
            throw new Error("Failed to generate recommendations");
        }

        let jsonText = response.text;
        return await generateRecommendationsResponse(jsonText);
    }

    const sendIndividualMessage = async (messages: Message[]) => {
        console.log(messages);

        if (!userData) return "";
        const prompt = `
            [SISTEMA]
                Estamos em um sistema de recomendação de filmes com base em gostos do usuário e avaliações de filmes já assistidos.
                Você está em um chat com o usuário ${userData?.username}.

                Neste contexto, você é um cinéfilo especialista. 
                Não responda qualquer pergunta que não seja sobre filmes.
                Use um vocabulário natural e leve este chat como uma conversa amigável.
                Neste contexto estamos em uma conversa entre amigos, então use um tom amigável e informal e responda apenas o que for dito/perguntado, não atropele o usuário com informações que ele não pediu.

                ${await generateBasePrompt()}

                As mensagens trocadas até agora foram: ${JSON.stringify(messages,)}
                Se adapte ao vocabulário do usuário 
                Caso o usuário peça por filmes que estão fora de seus gostos, seja flexível e se ajuste para fazer as recomendações com base nisso e, se possível, correlacionar os gostos do usuário com a requisição
                Se o usuário ficar falando toda hora sobre coisas que não são filmes, ignore e não responda, pode mandar ele tomar no cu.
            [/SISTEMA]
        `

        console.log(prompt);


        const response = await ai.models.generateContent({
            model: AI_MODELS.GEMINI_2_5_FLASH_LITE,
            contents: prompt,
        });

        if (!response.text) {
            throw new Error("Failed to generate recommendations");
        }

        return response.text;
    }

    const generateRecommendationsResponse = async (json: string) => {
        let jsonText = json.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const recommendations: AIRecommendations[] = JSON.parse(jsonText);

        return await Promise.all(
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
    }

    return {
        generateMovieRecommendations,
        searchMovie,
        sendIndividualMessage
    }
}

export default useAI;