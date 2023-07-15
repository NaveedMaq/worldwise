import {
  createContext,
  useContext,
  useState,
  useEffect,
  useReducer,
} from 'react';

const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, error: '' };

    case 'cities/loaded':
      return { ...state, isLoading: false, cities: action.payload };

    case 'city/created':
      return {
        ...state,
        isLoading: false,
        currentCity: action.payload,
        cities: [...state.cities, action.payload],
      };

    case 'city/deleted':
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter(
          (city) => Number(city.id) !== Number(action.payload)
        ),
      };

    case 'city/loaded':
      return {
        ...state,
        isLoading: false,
        currentCity: action.payload,
      };

    case 'rejected':
      return { ...state, isLoading: false, error: action.payload };

    default:
      throw new Error('Unknown action');
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    async function fetchCities() {
      dispatch({ type: 'loading' });
      try {
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        dispatch({ type: 'cities/loaded', payload: data });
      } catch (error) {
        dispatch({
          type: 'rejected',
          payload: 'Could not load cities data from server...',
        });
      }
    }
    fetchCities();
  }, []);

  async function createCity(newCity) {
    dispatch({ type: 'loading' });
    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: 'POST',
        body: JSON.stringify(newCity),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      dispatch({ type: 'city/created', payload: data });
    } catch (error) {
      dispatch({
        type: 'rejected',
        payload: 'Could not store city into the server...',
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: 'loading' });
    try {
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: 'DELETE',
      });

      dispatch({ type: 'city/deleted', payload: id });
    } catch (error) {
      dispatch({
        type: 'rejected',
        payload: 'Could not delete city from the server...',
      });
    }
  }

  async function getCity(id) {
    dispatch({ type: 'loading' });
    try {
      const res = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await res.json();

      dispatch({ type: 'city/loaded', payload: data });
    } catch (error) {
      dispatch({
        type: 'rejected',
        payload: 'Could not load cities data from server...',
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        getCity,
        createCity,
        currentCity,
        deleteCity,
        error,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error('CitiesContext was used outside the CitiesProvider');
  return context;
}
export { CitiesProvider, useCities };
