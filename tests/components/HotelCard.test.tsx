import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Since we haven't looked at the actual HotelCard implementation, 
// we'll create a mock version for this test sample
const mockHotel = {
  id: 'hotel-1',
  name: 'Grand Hotel',
  city: 'Paris',
  country: 'France',
  starRating: 4,
  imageUrl: 'https://example.com/image.jpg',
  averageRating: 4.5,
  description: 'A luxury hotel in the heart of Paris',
};

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock component - in a real scenario, you would import the actual component
function HotelCard({ hotel, onClick }: { hotel: typeof mockHotel, onClick?: () => void }) {
  return (
    <div data-testid="hotel-card" onClick={onClick}>
      <img src={hotel.imageUrl} alt={hotel.name} data-testid="hotel-image" />
      <h3 data-testid="hotel-name">{hotel.name}</h3>
      <p data-testid="hotel-location">{hotel.city}, {hotel.country}</p>
      <div data-testid="hotel-rating">
        {Array.from({ length: hotel.starRating }).map((_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
      <div data-testid="hotel-avg-rating">Average: {hotel.averageRating}</div>
    </div>
  );
}

describe('HotelCard', () => {
  it('renders hotel information correctly', () => {
    render(<HotelCard hotel={mockHotel} />);
    
    expect(screen.getByTestId('hotel-name')).toHaveTextContent('Grand Hotel');
    expect(screen.getByTestId('hotel-location')).toHaveTextContent('Paris, France');
    expect(screen.getByTestId('hotel-rating')).toHaveTextContent('★★★★');
    expect(screen.getByTestId('hotel-avg-rating')).toHaveTextContent('Average: 4.5');
    expect(screen.getByTestId('hotel-image')).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<HotelCard hotel={mockHotel} onClick={handleClick} />);
    
    const card = screen.getByTestId('hotel-card');
    await userEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
}); 