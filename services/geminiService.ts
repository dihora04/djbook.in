
import { GoogleGenAI } from "@google/genai";
import { DJProfile } from "../types";

// Note: In a real app, the API key would be handled securely and not exposed here.
// We assume process.env.API_KEY is available in the execution environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Uses Gemini with Google Maps grounding to find and describe live DJs near a user.
 * @param userLocation The user's current latitude and longitude.
 * @param liveDjs A list of DJs who are currently live.
 * @returns A conversational string describing nearby live DJ events.
 */
export const findLiveDjsWithGemini = async (
  userLocation: { latitude: number; longitude: number },
  liveDjs: DJProfile[]
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("The Gemini API is not configured. Please add an API key.");
  }

  if (liveDjs.length === 0) {
    return Promise.resolve("It looks like no DJs are live right now. Check back later!");
  }

  // Construct a detailed list of live DJ locations for the prompt.
  const djLocationList = liveDjs.map(dj => 
    `- ${dj.name} is playing at ${dj.liveStatus?.venueName} (Location: ${dj.liveStatus?.lat}, ${dj.liveStatus?.lng})`
  ).join('\n');

  const prompt = `
    You are a helpful nightlife and music event assistant for the DJBook app.
    Based on my current location and the following list of live DJ events, tell me what's happening near me.
    
    Be conversational, friendly, and exciting. Use Google Maps to get more information about the venues if you can (like what kind of place it is, e.g., "a rooftop bar with stunning views").
    
    My current location is: Latitude ${userLocation.latitude}, Longitude ${userLocation.longitude}.
    
    Here are the DJs currently live:
    ${djLocationList}

    Structure your response to highlight the closest or most interesting options first.
  `;

  try {
    console.log("Generating content with Gemini and Maps grounding...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude
            }
          }
        }
      },
    });

    console.log("Gemini Response:", response);
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I couldn't fetch live DJ information at the moment. Please try again later.";
  }
};
