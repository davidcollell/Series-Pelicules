
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface FetchedMediaDetails {
    title: string;
    year: number;
    description: string;
    type: 'Pel·lícula' | 'Sèrie';
    platform: string;
    duration?: number;
    seasons?: number;
    episodesPerSeason?: number[];
    posterUrl?: string;
}

export const fetchMediaDetails = async (query: string): Promise<FetchedMediaDetails> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Actua com una API de base de dades de pel·lícules. Cerca informació actualitzada i detallada sobre: "${query}".
            
            Retorna UNICAMENT un objecte JSON vàlid (sense markdown ni explicacions) amb les següents propietats:
            - title: El títol oficial.
            - year: Any d'estrena (número).
            - description: Resum breu de la trama en català.
            - type: 'Pel·lícula' o 'Sèrie'.
            - platform: La plataforma de streaming principal (ex: Netflix, HBO, Prime Video).
            - duration: Durada en minuts (només per pel·lícules).
            - seasons: Nombre total de temporades (només per sèries).
            - episodesPerSeason: Array de números amb els episodis per temporada (només per sèries).
            - posterUrl: Cerca i extreu una URL vàlida i directa d'una imatge de pòster oficial (format vertical) d'alta qualitat.
            
            Assegura't que el JSON sigui vàlid.`,
            config: {
                tools: [{ googleSearch: {} }],
                // Note: responseMimeType and responseSchema are not compatible with googleSearch tool in this context,
                // so we rely on the prompt to format the output as JSON.
            },
        });

        let jsonText = response.text?.trim() || "{}";
        
        // Neteja de Markdown si el model retorna blocs de codi
        jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '');
        
        // Intentar extreure l'objecte JSON si hi ha text al voltant
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonText = jsonText.substring(firstBrace, lastBrace + 1);
        }

        const parsedData = JSON.parse(jsonText);
        
        // Validació bàsica i correcció de tipus si cal
        if (parsedData.type !== 'Pel·lícula' && parsedData.type !== 'Sèrie') {
            if (parsedData.type === 'Movie') parsedData.type = 'Pel·lícula';
            else if (parsedData.type === 'Series' || parsedData.type === 'TV Show') parsedData.type = 'Sèrie';
            else parsedData.type = 'Pel·lícula'; // Default
        }

        return parsedData as FetchedMediaDetails;

    } catch (error) {
        console.error("Error en obtenir detalls del mitjà des de l'API de Gemini:", error);
        throw new Error("No s'han pogut obtenir els detalls. Si us plau, comprova el nom i torna-ho a provar.");
    }
};
