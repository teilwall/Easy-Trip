import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import MapComponent from './MapComponent';

// Mocking the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        // Mock response data
        '-1': {
          city: 'Mock City',
          fromDate: '2024-05-01',
          toDate: '2024-05-05',
          lat: 0,
          lon: 0
        },
        '0': [
          {
            lat: 0,
            lon: 0,
            english_name: 'Location 1',
            description: 'Description 1',
            image: 'image1.jpg'
          }
        ]
      })
  })
);

describe('MapComponent', () => {
  it('renders loading state initially', () => {
    const { getByText } = render(<MapComponent />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('renders map with data after loading', async () => {
    const { getByText, queryByText } = render(<MapComponent />);
    await waitFor(() => {
      expect(queryByText('Loading...')).toBeNull();
    });
    expect(getByText('Mock City')).toBeInTheDocument();
    expect(getByText('Day 1')).toBeInTheDocument();
    expect(getByText('Location 1')).toBeInTheDocument();
    expect(getByText('Description 1')).toBeInTheDocument();
  });

  it('renders popup when marker is clicked', async () => {
    const { getByText, getByTestId } = render(<MapComponent />);
    await waitFor(() => {
      fireEvent.click(getByText('Day 1'));
    });
    fireEvent.click(getByTestId('marker-0'));
    expect(getByText('Location 1')).toBeInTheDocument();
    expect(getByText('Description 1')).toBeInTheDocument();
  });

  it('navigates to add trip page when "New Trip" button is clicked', async () => {
    const { getByText, history } = render(<MapComponent />);
    await waitFor(() => {
      expect(history.location.pathname).toBe('/');
    });
    fireEvent.click(getByText('New Trip'));
    expect(history.location.pathname).toBe('/add-trip'); // Change the expected pathname if it's different
  });
});
