// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useState } from 'react';

import styles from './Form.module.css';
import Button from './Button';
import BackButton from './BackButton';
import Spinner from './Spinner';
import Message from './Message';
import { useUrlCoordinates } from '../hooks/useUrlCoordinates';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCities } from '../contexts/CitiesContext';
import { useNavigate } from 'react-router-dom';

export function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const BASE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

function Form() {
  const [cityName, setCityName] = useState('');
  const [country, setCountry] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false);
  const [error, setError] = useState(null);
  const [emoji, setEmoji] = useState('');
  const [lat, lng] = useUrlCoordinates();
  const { createCity, isLoading } = useCities();
  const navigate = useNavigate();

  const isUrlLocationMissing = !lat && !lng;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };

    await createCity(newCity);
    navigate('/app/cities');
  }
  useEffect(
    function () {
      if (isUrlLocationMissing) return;

      async function fetchCityDetails() {
        try {
          setIsLoadingGeocoding(true);
          setError(null);

          const res = await fetch(
            `${BASE_URL}?latitude=${lat}&longitude=${lng}`
          );
          const data = await res.json();
          if (!data.countryName)
            throw new Error('This is not a city. Please click on a city 😉');
          setCityName(data.city || data.locality || '');
          setCountry(data.countryName);
          setEmoji(convertToEmoji(data.countryCode));
        } catch (error) {
          console.log(error.message);
          setError(error.message);
        } finally {
          setIsLoadingGeocoding(false);
        }
      }

      fetchCityDetails();
    },
    [lat, lng, isUrlLocationMissing]
  );

  if (isUrlLocationMissing)
    return <Message message='Start by clicking somewhere' />;

  if (isLoadingGeocoding) {
    return <Spinner />;
  }

  if (error) {
    return <Message message={error} />;
  }
  return (
    <form className={`${styles.form} ${isLoading ? styles.loading : ''}`}>
      <div className={styles.row}>
        <label htmlFor='cityName'>City name</label>
        <input
          id='cityName'
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor='date'>When did you go to {cityName}?</label>

        <DatePicker
          id='date'
          selected={date}
          onChange={(date) => setDate(date)}
          dateFormat='dd-MMMM-yyyy'
        />
      </div>

      <div className={styles.row}>
        <label htmlFor='notes'>Notes about your trip to {cityName}</label>
        <textarea
          id='notes'
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type='primary' onClick={handleSubmit}>
          Add
        </Button>
        <BackButton />
      </div>
    </form>
  );
}

export default Form;
