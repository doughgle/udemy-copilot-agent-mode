import emojiFlags from "emoji-flags";

/**
 * Returns a flag emoji for a given country name
 * Handles undefined country names gracefully
 */
export const getCountryFlag = (countryName: string | undefined) => {
  // Early return if countryName is undefined or null
  if (!countryName) {
    return '';
  }
  
  // Get all available flags from the emoji-flags library
  const allFlags = Object.values(emojiFlags.data);
  
  // Try to find an exact match first (case-insensitive)
  const exactMatch = allFlags.find(flag => 
    flag.name && flag.name.toLowerCase() === countryName.toLowerCase()
  );
  
  if (exactMatch) {
    return exactMatch.emoji;
  }
  
  // If no exact match, try partial match (country name contained in flag name)
  const partialMatch = allFlags.find(flag => 
    flag.name && flag.name.toLowerCase().includes(countryName.toLowerCase())
  );
  
  if (partialMatch) {
    return partialMatch.emoji;
  }
  
  // Try reverse partial match (flag name contained in country name)
  const reversePartialMatch = allFlags.find(flag => 
    flag.name && countryName.toLowerCase().includes(flag.name.toLowerCase())
  );
  
  // Return the match if found, otherwise empty string
  return reversePartialMatch ? reversePartialMatch.emoji : '';
};