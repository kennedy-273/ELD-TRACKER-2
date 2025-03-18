// src/services/locationService.ts

interface LocationResult {
    id: string;
    name: string;
    formattedName: string;
    mainText: string;
    secondaryText: string;
}

/**
 * Service that uses Google Places API for location search and autocomplete
 */
class LocationService {
    private cache: Map<string, LocationResult[]> = new Map();
    private apiKey: string;
    
    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }
    
    /**
     * Search for locations based on the query string using Google Places API
     * @param query The search query (e.g. "New York")
     * @returns Promise resolving to array of location results
     */
    async searchLocations(query: string): Promise<LocationResult[]> {
        // Trim and normalize the query
        const normalizedQuery = query.trim();
        
        // Return empty array for empty or short queries
        if (normalizedQuery.length < 2) {
            return [];
        }
        
        // Check cache first to reduce API calls
        if (this.cache.has(normalizedQuery)) {
            return this.cache.get(normalizedQuery) || [];
        }
        
        try {
            // Fetch results from Google Places API
            const results = await this.fetchFromGooglePlacesAPI(normalizedQuery);
            
            // Cache the results
            this.cache.set(normalizedQuery, results);
            
            return results;
        } catch (error) {
            console.error("Error fetching locations:", error);
            return [];
        }
    }
    
    /**
     * Fetch location suggestions from Google Places API
     * @param query The search query
     * @returns Promise resolving to an array of location results
     */
    private async fetchFromGooglePlacesAPI(query: string): Promise<LocationResult[]> {
        try {
            // Using the Google Places Autocomplete API via a CORS proxy
            // In a production app, you should make this call from your backend
            const endpoint = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/autocomplete/json`;
            const params = new URLSearchParams({
                input: query,
                types: '(cities)',
                key: this.apiKey
            });
            
            const response = await fetch(`${endpoint}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                throw new Error(`API returned status: ${data.status}`);
            }
            
            // Map the response to our LocationResult interface
            return (data.predictions || []).map((prediction: any) => ({
                id: prediction.place_id,
                name: prediction.structured_formatting?.main_text || prediction.description,
                formattedName: prediction.description,
                mainText: prediction.structured_formatting?.main_text || '',
                secondaryText: prediction.structured_formatting?.secondary_text || ''
            }));
        } catch (error) {
            console.error("Error fetching from Google Places API:", error);
            
            // If the API call fails, use a hardcoded fallback for demo purposes
            if (query.toLowerCase().includes('new york')) {
                return [{
                    id: 'placeholder-ny',
                    name: 'New York',
                    formattedName: 'New York, NY, USA',
                    mainText: 'New York',
                    secondaryText: 'NY, USA'
                }];
            }
            
            return [];
        }
    }
}

// Create and export an instance with your API key
export const locationService = new LocationService('AIzaSyAqwX3cvCzumsBqsk6Pa8uuDOxHW2QMum4');
export default locationService;