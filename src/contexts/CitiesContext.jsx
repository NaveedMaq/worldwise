import { createContext, useContext, useState, useEffect } from 'react';

const CitiesContext = createContext();

function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState({});

  const BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    async function fetchCities() {
      try {
        setIsLoading(true);

        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        setCities(data);
      } catch (error) {
        console.log('Could not load cities data from server...');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCities();
  }, []);

  async function createCity(newCity) {
    try {
      setIsLoading(true);

      const res = await fetch(`${BASE_URL}/cities`, {
        method: 'POST',
        body: JSON.stringify(newCity),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setCities([...cities, data]);
    } catch (error) {
      console.log('Could not store city into the server...');
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCity(id) {
    try {
      setIsLoading(true);

      await fetch(`${BASE_URL}/cities/${id}`, {
        method: 'DELETE',
      });

      setCities((cities) => cities.filter((city) => city.id !== id));
    } catch (error) {
      console.log('Could not delete city from the server...');
    } finally {
      setIsLoading(false);
    }
  }

  async function getCity(id) {
    try {
      setIsLoading(true);

      const res = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await res.json();
      setCurrentCity(data);
    } catch (error) {
      console.log('Could not load cities data from server...');
    } finally {
      setIsLoading(false);
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
