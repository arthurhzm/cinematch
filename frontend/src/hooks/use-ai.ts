import type { AIRecommendations, UserPreferences } from "@/utils/types";
import { GoogleGenAI } from "@google/genai";

const useAI = () => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

    const generateMovieRecommendations = async (preferences: UserPreferences): Promise<AIRecommendations[]> => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite-preview-06-17",
            contents: recommendationPrompt(preferences, 10),
           
        });

        if (!response.text) {
            throw new Error("Failed to generate recommendations");
        }

        let jsonText = response.text;
        console.log(jsonText);

        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const recommendations: AIRecommendations[] = JSON.parse(jsonText);
        
        // Fetch posters from TMDB
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

    const recommendationPrompt = (preferences: UserPreferences, length: number) => {
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
        `;
    }

    return {
        generateMovieRecommendations
    }
}

export default useAI;