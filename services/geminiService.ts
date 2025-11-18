import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const mediaDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "El títol oficial de la pel·lícula o sèrie."
        },
        year: {
            type: Type.INTEGER,
            description: "L'any d'estrena de la pel·lícula o l'any d'inici de la sèrie."
        },
        description: {
            type: Type.STRING,
            description: "Un breu resum d'un paràgraf de la trama."
        },
        type: {
            type: Type.STRING,
            description: "El tipus de mitjà, ja sigui 'Pel·lícula' o 'Sèrie'."
        },
        platform: {
            type: Type.STRING,
            description: "La principal plataforma de streaming on està disponible (p. ex., Netflix, HBO Max, Disney+). Si no està disponible en cap plataforma principal, retorna 'No disponible'."
        },
        duration: {
            type: Type.INTEGER,
            description: "La durada de la pel·lícula en minuts. Omet si és una sèrie."
        },
        seasons: {
            type: Type.INTEGER,
            description: "El nombre total de temporades. Omet si és una pel·lícula."
        },
        episodesPerSeason: {
            type: Type.ARRAY,
            description: "Una llista amb el nombre d'episodis per a cada temporada. Omet si és una pel·lícula.",
            items: { type: Type.INTEGER }
        }
    },
    required: ["title", "year", "description", "type", "platform"],
};

export interface FetchedMediaDetails {
    title: string;
    year: number;
    description: string;
    type: 'Pel·lícula' | 'Sèrie';
    platform: string;
    duration?: number;
    seasons?: number;
    episodesPerSeason?: number[];
}

export const fetchMediaDetails = async (query: string): Promise<FetchedMediaDetails> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Proporciona detalls per a la pel·lícula o sèrie: "${query}". Si és una pel·lícula, inclou la seva durada en minuts. Si és una sèrie, inclou el nombre total de temporades i una llista amb el nombre d'episodis per temporada. Respon només amb les dades sol·licitades.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: mediaDetailsSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);
        
        if (parsedData.type !== 'Pel·lícula' && parsedData.type !== 'Sèrie') {
            throw new Error("Tipus de mitjà invàlid rebut de l'API.");
        }

        return parsedData as FetchedMediaDetails;

    } catch (error) {
        console.error("Error en obtenir detalls del mitjà des de l'API de Gemini:", error);
        throw new Error("No s'han pogut obtenir els detalls. Si us plau, comprova el nom de la pel·lícula/sèrie i torna-ho a provar.");
    }
};