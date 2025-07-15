import { AI_MODELS } from "@/utils/ai-models";
import type { AIRecommendations, UserPreferences } from "@/utils/types";
import { GoogleGenAI } from "@google/genai";

const useAI = () => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

    const generateMovieRecommendations = async (preferences: UserPreferences, special: boolean = false): Promise<AIRecommendations[]> => {
        const response = await ai.models.generateContent({
            model: AI_MODELS.GEMINI_2_5_FLASH_LITE,
            contents: recommendationPrompt(preferences, 10, special),
        });

        if (!response.text) {
            throw new Error("Failed to generate recommendations");
        }

        let jsonText = response.text;
        console.log(jsonText);

        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const recommendations: AIRecommendations[] = JSON.parse(jsonText);

        const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;
        const recommendationsWithPosters = await Promise.all(
            recommendations.map(async (movie) => {
                try {
                    const searchResponse = await fetch(
                        `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(movie.title)}&year=${movie.year}`
                    );
                    const searchData = await searchResponse.json();

                    if (searchData.results && searchData.results.length > 0) {
                        const posterPath = searchData.results[0].poster_path;
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

        return recommendationsWithPosters;
    }

    const recommendationPrompt = (preferences: UserPreferences, length: number, special: boolean = false) => {
        return `
            Você é um cinéfilo especialista em recomendar filmes personalizados. 
      
            Contexto do usuário:
            - Gêneros preferidos: ${preferences.favoriteGenres}
            - Diretores favoritos: ${preferences.favoriteDirectors}
            - Atores favoritos: ${preferences.favoriteActors}
            - Período preferido: Filmes após ${preferences.minReleaseYear}
            - Duração máxima: ${preferences.maxDuration} minutos
            - Aceita conteúdo adulto: ${preferences.acceptAdultContent}

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
            (Retorne apenas o JSON válido, sem markdown ou formatação adicional)
            ${special ? recommendationPromptSpecial() : ''}

        `;
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