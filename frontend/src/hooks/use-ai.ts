import { useAuth } from "@/contexts/AuthContext";
import { AI_MODELS } from "@/utils/ai-models";
import type { AIRecommendations, Message, UserMovieFeedback, UserPreferences, UserRecommendationsFeedback } from "@/utils/types";
import { GoogleGenAI } from "@google/genai";
import { useMemo } from "react";
import useFeedback from "./use-feedback";
import { useLocalStorage } from "./use-localstorage";
import usePreferences from "./use-preferences";
import useRecommendation from "./use-recommendation";
import useTMDB from "./use-tmdb";

const useAI = () => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const { userData } = useAuth();
    const { getUserFeedback } = useFeedback();
    const { getUserRecommendationsFeedback } = useRecommendation();
    const { getMovieByTitle } = useTMDB();
    const { getUserPreferences } = usePreferences();
    const { getLocalStorageItem, setLocalStorageItem, clearLocalStorageItem } = useLocalStorage();

    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

    const generateMovieRecommendations = useMemo(() => async (special: boolean = false): Promise<AIRecommendations[]> => {
        const cacheKey = special ? 'specialMovieRecommendations' : 'movieRecommendations';
        const cache = getLocalStorageItem(cacheKey);
        if (cache) {
            const parsedCache = JSON.parse(cache);
            if (Date.now() < parsedCache.expiration) {
                return parsedCache.data;
            }
            clearLocalStorageItem(cacheKey);
        }

        console.log('Gerando recomendações via IA');

        const response = await ai.models.generateContent({
            model: AI_MODELS.GEMINI_2_5_FLASH_LITE,
            contents: await recommendationPrompt(10, special),
        });

        if (!response.text) {
            throw new Error("Failed to generate recommendations");
        }

        const recommendationsWithPosters = await generateRecommendationsResponse(response.text);

        setLocalStorageItem(
            cacheKey,
            {
                expiration: special
                    ? new Date(new Date().setHours(23, 59, 59, 999)).getTime()
                    : Date.now() + CACHE_DURATION,
                data: recommendationsWithPosters
            }
        );

        return recommendationsWithPosters;
    }, [ai, getUserPreferences, getUserFeedback, getUserRecommendationsFeedback, getMovieByTitle, userData]);

    const generateBasePrompt = async () => {
        if (!userData) return ``;

        const preferences = (await getUserPreferences(userData?.id)).data as UserPreferences;
        const watchedMovies = (await getUserFeedback(userData?.id)).data as UserMovieFeedback[];
        const recommendationsFeedback = (await getUserRecommendationsFeedback(userData?.id)).data as UserRecommendationsFeedback[];

        let message = `
            Você é um cinéfilo especialista em recomendar filmes personalizados com base em análise profunda de padrões e preferências.
      
            PERFIL DO USUÁRIO:
            - Gêneros preferidos: ${preferences.favoriteGenres}
            - Diretores favoritos: ${preferences.favoriteDirectors}
            - Atores favoritos: ${preferences.favoriteActors}
            - Período preferido: Filmes após ${preferences.minReleaseYear}
            - Duração máxima: ${preferences.maxDuration} minutos
            - Aceita conteúdo adulto: ${preferences.acceptAdultContent}
        `

        if (watchedMovies.length > 0) {
            const highRatedMovies = watchedMovies.filter(movie => movie.rating >= 4);
            const lowRatedMovies = watchedMovies.filter(movie => movie.rating <= 3);

            message += `
            HISTÓRICO DE FILMES ASSISTIDOS (use como base para suas recomendações):
            - Filmes já assistidos: ${watchedMovies.map((movie: UserMovieFeedback) => movie.movieTitle).join(", ")}
            - Filmes bem avaliados (4-5 estrelas): ${highRatedMovies.map((movie: UserMovieFeedback) => {
                return movie.review ? `${movie.movieTitle} (${movie.rating}★) - "${movie.review}"` : `${movie.movieTitle} (${movie.rating}★)`;
            }).join(", ") || "Nenhum"}
            - Filmes mal avaliados (1-3 estrelas): ${lowRatedMovies.map((movie: UserMovieFeedback) => {
                return movie.review ? `${movie.movieTitle} (${movie.rating}★) - "${movie.review}"` : `${movie.movieTitle} (${movie.rating}★)`;
            }).join(", ") || "Nenhum"}
            
            ANÁLISE INTELIGENTE: Use os filmes bem avaliados para identificar padrões (diretores, atores, temas, estilos) que o usuário gosta. 
            Evite recomendar filmes similares aos mal avaliados ou que tenham características rejeitadas pelo usuário.
            `
        }

        if (recommendationsFeedback.length > 0) {
            const likedRecommendations = recommendationsFeedback.filter(rec => rec.feedback === 'like');
            const dislikedRecommendations = recommendationsFeedback.filter(rec => rec.feedback === 'dislike');
            const superlikedRecommendations = recommendationsFeedback.filter(rec => rec.feedback === 'superlike');

            message += `
            HISTÓRICO DE RECOMENDAÇÕES ANTERIORES:
            - Recomendações aceitas: ${likedRecommendations.map((rec: UserRecommendationsFeedback) => {
                return `${rec.movieTitle}${rec.detailedFeedback ? ` - "${rec.detailedFeedback}"` : ''}`;
            }).join(", ") || "Nenhuma"}
            - Recomendações rejeitadas: ${dislikedRecommendations.map((rec: UserRecommendationsFeedback) => {
                return `${rec.movieTitle}${rec.detailedFeedback ? ` - "${rec.detailedFeedback}"` : ''}`;
            }).join(", ") || "Nenhuma"}
            - Recomendações super curtidas: ${superlikedRecommendations.map((rec: UserRecommendationsFeedback) => {
                return `${rec.movieTitle}${rec.detailedFeedback ? ` - "${rec.detailedFeedback}"` : ''}`;
            }).join(", ") || "Nenhuma"}
            
            IMPORTANTE: NUNCA recomende novamente os filmes: ${recommendationsFeedback.map((rec: UserRecommendationsFeedback) => rec.movieTitle).join(", ")}
            Use as recomendações aceitas para entender melhor o que funciona e ajuste seu algoritmo baseado nos feedbacks.
            `
        }

        message += `
            INSTRUÇÕES DE RECOMENDAÇÃO INTELIGENTE:
            1. Analise os padrões dos filmes bem avaliados para encontrar características em comum
            2. Identifique elementos específicos que o usuário aprecia (cinematografia, narrativa, temas)
            3. Use as preferências declaradas E o histórico real para recomendações mais precisas
            4. Evite repetir erros de recomendações anteriores rejeitadas
            5. Considere a evolução do gosto do usuário ao longo do tempo
            6. Recomende filmes que expandam horizontes sem fugir muito do perfil identificado
            7. NUNCA repita filmes já recomendados anteriormente
        `;

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
        const month = now.getMonth() + 1;
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
            [SISTEMA]
            Você está em um sistema de BUSCA INTELIGENTE de filmes. 
            O usuário está procurando por filmes usando o termo: "${query}"

            INSTRUÇÕES IMPORTANTES:
            1. Analise cuidadosamente o termo de busca. Se for um nome de filme, priorize títulos exatos ou extremamente similares.
            2. Se for uma descrição, contexto ou tema, encontre filmes que realmente correspondam ao que foi pedido, usando análise semântica.
            3. NÃO invente filmes, só retorne títulos reais e relevantes.
            4. Priorize filmes populares, premiados ou cultuados, mas inclua também opções menos conhecidas que sejam relevantes.
            5. Ordene os resultados por relevância: títulos exatos primeiro, depois similares, depois por contexto.
            6. NÃO leve em consideração gostos pessoais do usuário, foque apenas na busca.

            FORMATO DE RESPOSTA (OBRIGATÓRIO):
            Retorne um array JSON válido, sem markdown, sem texto extra, apenas o JSON.
            Cada filme deve conter:
            - title (título em português do Brasil, se existir, senão original)
            - year (ano de lançamento)
            - genres (array de gêneros em português do Brasil)
            - overview (sinopse curta e objetiva, em português do Brasil)
            - streaming_services (array de serviços de streaming onde está disponível no Brasil, ex: ["Netflix", "Prime Video"], se não souber, retorne [])

            REGRAS ADICIONAIS:
            - NÃO inclua comentários, explicações ou texto fora do JSON.
            - NÃO use markdown, apenas JSON puro.
            - NÃO use caracteres especiais, apenas texto simples.
            - Certifique-se que o JSON está 100% válido e pronto para ser lido por um sistema automatizado.
            - Se não encontrar nenhum filme relevante, retorne um array vazio [].

            EXEMPLO DE RESPOSTA:
            [
              {
            "title": "Matrix",
            "year": 1999,
            "genres": ["Ficção científica", "Ação"],
            "overview": "Um hacker descobre a verdade sobre a realidade e luta contra máquinas.",
            "streaming_services": ["Netflix", "Prime Video"]
              }
            ]

            Lembre-se: foque em relevância, precisão e qualidade dos resultados.
            [/SISTEMA]
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

                Algumas regras adicionais:
                - Ao invés de usar marcações markdown nas suas mensagens, utilize HTML simples para formatação
                - Use tags <p> para parágrafos, <strong> para negrito, <em> para itálico
                - Use <ul> e <li> para listas, <br> para quebras
                - Estamos em um sistema react, então quando for recomendar um filme para o usuário, utilize o componente <a href="/search?query=FILME" className="text-primary">FILME</a> para que o usuário possa clicar e ver mais detalhes
                - Nunca use caracteres especiais ou Unicode, apenas HTML simples
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

    const generateRecommendationsResponse = async (json: string): Promise<AIRecommendations[]> => {
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
                            original_title: searchResponse.results[0].original_title || movie.title,
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
        ai,
        generateMovieRecommendations,
        searchMovie,
        sendIndividualMessage
    }
}

export default useAI;