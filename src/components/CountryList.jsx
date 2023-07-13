import styles from './CountryList.module.css';
import Spinner from './Spinner';
import Message from './Message';
import CountryItem from './CountryItem';
import { useCities } from '../contexts/CitiesContext';

export default function CountryList() {
  const { cities, isLoading } = useCities();

  if (isLoading) {
    return <Spinner />;
  }

  if (!cities.length) {
    return (
      <Message message="You don't have any cities. Kindly add one by clicking on the map" />
    );
  }

  const countries = cities.reduce((arr, city) => {
    const countryPresent = arr.some(
      (country) => country.country === city.country
    );
    if (countryPresent) return arr;

    const newCountry = {
      country: city.country,
      emoji: city.emoji,
    };
    return [...arr, newCountry];
  }, []);

  return (
    <ul className={styles.countryList}>
      {countries.map((country) => (
        <CountryItem country={country} key={country.country} />
      ))}
    </ul>
  );
}
