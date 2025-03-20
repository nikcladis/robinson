import { HotelService } from '../../src/services/hotel.service';
import { NotFoundError } from '../../src/errors';

// Mock the import for HotelRepository
jest.mock('../../src/repositories/hotel.repository', () => ({
  HotelRepository: {
    getAllHotels: jest.fn(),
    getHotelById: jest.fn(),
    updateHotel: jest.fn(),
    deleteHotel: jest.fn(),
  },
}));

// Import the mocked repository
import { HotelRepository } from '../../src/repositories/hotel.repository';

describe('HotelService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the window mock for environment detection
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true
    });
  });

  describe('getAllHotels', () => {
    it('should use repository directly in server environment', async () => {
      // Mock server environment (no window)
      Object.defineProperty(global, 'window', { value: undefined });
      
      const mockHotels = [{ id: '1', name: 'Test Hotel' }];
      (HotelRepository.getAllHotels as jest.Mock).mockResolvedValue(mockHotels);

      const result = await HotelService.getAllHotels();
      
      expect(HotelRepository.getAllHotels).toHaveBeenCalled();
      expect(result).toEqual(mockHotels);
    });

    it('should use fetch in browser environment', async () => {
      // Mock browser environment
      Object.defineProperty(global, 'window', { value: {} });
      
      const mockHotels = [{ id: '1', name: 'Test Hotel' }];
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHotels),
      });

      const result = await HotelService.getAllHotels();
      
      expect(fetch).toHaveBeenCalledWith('/api/hotels?');
      expect(result).toEqual(mockHotels);
    });

    it('should handle fetch errors in browser environment', async () => {
      // Mock browser environment
      Object.defineProperty(global, 'window', { value: {} });
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ message: 'Server error' }),
      });

      await expect(HotelService.getAllHotels()).rejects.toThrow('Server error');
    });
  });

  describe('getHotel', () => {
    it('should use repository directly in server environment', async () => {
      // Mock server environment (no window)
      Object.defineProperty(global, 'window', { value: undefined });
      
      const mockHotel = { id: '1', name: 'Test Hotel' };
      (HotelRepository.getHotelById as jest.Mock).mockResolvedValue(mockHotel);

      const result = await HotelService.getHotel('1');
      
      expect(HotelRepository.getHotelById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockHotel);
    });

    it('should use fetch in browser environment', async () => {
      // Mock browser environment
      Object.defineProperty(global, 'window', { value: {} });
      
      const mockHotel = { id: '1', name: 'Test Hotel' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHotel),
      });

      const result = await HotelService.getHotel('1');
      
      expect(fetch).toHaveBeenCalledWith('/api/hotels/1');
      expect(result).toEqual(mockHotel);
    });

    it.skip('should handle 404 errors properly', async () => {
      global.fetch = jest.fn().mockImplementationOnce(() => {
        return Promise.resolve({
          status: 404,
          ok: false,
          json: () => Promise.resolve({
            success: false,
            error: {
              message: 'Hotel with ID 999 not found',
              code: 'NOT_FOUND'
            }
          })
        });
      });

      await expect(HotelService.getHotel('999')).rejects.toThrow(/Hotel with ID 999 not found/);
    });
  });

  describe('updateHotel', () => {
    const hotelData = {
      name: 'Updated Hotel',
      description: 'Updated description',
      city: 'New City',
      country: 'New Country',
      address: 'New Address',
      postalCode: '12345',
      starRating: 5,
      amenities: ['Wifi', 'Pool'],
      imageUrl: 'https://example.com/image.jpg',
    };

    it('should use repository directly in server environment', async () => {
      // Mock server environment (no window)
      Object.defineProperty(global, 'window', { value: undefined });
      
      const mockHotel = { id: '1', ...hotelData };
      (HotelRepository.updateHotel as jest.Mock).mockResolvedValue(mockHotel);

      const result = await HotelService.updateHotel('1', hotelData);
      
      expect(HotelRepository.updateHotel).toHaveBeenCalledWith('1', hotelData);
      expect(result).toEqual(mockHotel);
    });

    it('should use fetch in browser environment', async () => {
      // Mock browser environment
      Object.defineProperty(global, 'window', { value: {} });
      
      const mockHotel = { id: '1', ...hotelData };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHotel),
      });

      const result = await HotelService.updateHotel('1', hotelData);
      
      expect(fetch).toHaveBeenCalledWith('/api/hotels/1', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(hotelData),
      }));
      expect(result).toEqual(mockHotel);
    });
  });

  describe('deleteHotel', () => {
    it('should use repository directly in server environment', async () => {
      // Mock server environment (no window)
      Object.defineProperty(global, 'window', { value: undefined });
      
      (HotelRepository.deleteHotel as jest.Mock).mockResolvedValue(undefined);

      await HotelService.deleteHotel('1');
      
      expect(HotelRepository.deleteHotel).toHaveBeenCalledWith('1');
    });

    it('should use fetch in browser environment', async () => {
      // Mock browser environment
      Object.defineProperty(global, 'window', { value: {} });
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
      });

      await HotelService.deleteHotel('1');
      
      expect(fetch).toHaveBeenCalledWith('/api/hotels/1', expect.objectContaining({
        method: 'DELETE',
      }));
    });
  });
}); 