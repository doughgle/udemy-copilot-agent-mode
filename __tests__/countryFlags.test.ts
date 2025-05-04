import { getCountryFlag } from '@/lib/countryFlags';

describe('getCountryFlag function', () => {
  it('should return a flag emoji for a country with exact name match', () => {
    const result = getCountryFlag('France');
    expect(result).toBe('🇫🇷');
  });
  
  it('should return a flag emoji for a country with partial name match', () => {
    const result = getCountryFlag('United States');
    expect(result).toBe('🇺🇸');
  });
  
  it('should handle country names with different casing', () => {
    const result = getCountryFlag('GERMANY');
    expect(result).toBe('🇩🇪');
  });
  
  it('should handle country names with spaces', () => {
    const result = getCountryFlag('New Zealand');
    expect(result).toBe('🇳🇿');
  });
});