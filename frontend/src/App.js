import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [years, setYears] = useState([]);
  const [races, setRaces] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRace, setSelectedRace] = useState('');
  const [selectedDriver1, setSelectedDriver1] = useState('');
  const [selectedDriver2, setSelectedDriver2] = useState('');
  const [lapTimes, setLapTimes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch available years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/years`);
        setYears(response.data);
        setInitialLoading(false);
      } catch (err) {
        setError('Failed to fetch years');
        console.error('Error fetching years:', err);
        setInitialLoading(false);
      }
    };
    fetchYears();
  }, []);

  // Fetch races when year is selected
  useEffect(() => {
    const fetchRaces = async () => {
      if (!selectedYear) return;
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/races/${selectedYear}`);
        setRaces(response.data);
        setSelectedRace('');
        setSelectedDriver1('');
        setSelectedDriver2('');
        setLapTimes(null);
      } catch (err) {
        setError('Failed to fetch races');
        console.error('Error fetching races:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRaces();
  }, [selectedYear]);

  // Fetch drivers when race is selected
  useEffect(() => {
    const fetchDrivers = async () => {
      if (!selectedYear || !selectedRace) return;
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/drivers/${selectedYear}/${selectedRace}`);
        setDrivers(response.data);
        setSelectedDriver1('');
        setSelectedDriver2('');
        setLapTimes(null);
      } catch (err) {
        setError('Failed to fetch drivers');
        console.error('Error fetching drivers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, [selectedYear, selectedRace]);

  const handleAnalyze = async () => {
    if (!selectedYear || !selectedRace || !selectedDriver1 || !selectedDriver2) {
      setError('Please select all required fields');
      return;
    }

    try {
      setAnalyzing(true);
      setError(null);
      const response = await axios.get(
        `${API_BASE_URL}/lap-times/${selectedYear}/${selectedRace}/${selectedDriver1}/${selectedDriver2}`
      );
      setLapTimes(response.data);
    } catch (err) {
      setError('Failed to fetch lap times');
      console.error('Error fetching lap times:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Prepare chart data
  const chartData = lapTimes ? lapTimes.driver1.times.map((lap, index) => ({
    lap: lap.lap,
    [lapTimes.driver1.code]: lap.time,
    [lapTimes.driver2.code]: lapTimes.driver2.times[index]?.time || null
  })) : [];

  if (initialLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading F1 Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>F1 Lap Time Analyzer</h1>
        <p>Compare Formula 1 driver lap times across different races</p>
      </header>

      <div className="controls">
        <div className="select-group">
          <label>Year</label>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={loading}
            className={loading ? 'loading' : ''}
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label>Race</label>
          <select 
            value={selectedRace} 
            onChange={(e) => setSelectedRace(e.target.value)}
            disabled={!selectedYear || loading}
            className={loading ? 'loading' : ''}
          >
            <option value="">Select Race</option>
            {races.map(race => (
              <option key={race.round} value={race.round}>
                {race.name}
              </option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label>Driver 1</label>
          <select 
            value={selectedDriver1} 
            onChange={(e) => setSelectedDriver1(e.target.value)}
            disabled={!selectedRace || loading}
            className={loading ? 'loading' : ''}
          >
            <option value="">Select Driver</option>
            {drivers.map(driver => (
              <option key={driver.code} value={driver.code}>
                {driver.name} ({driver.team})
              </option>
            ))}
          </select>
        </div>

        <div className="select-group">
          <label>Driver 2</label>
          <select 
            value={selectedDriver2} 
            onChange={(e) => setSelectedDriver2(e.target.value)}
            disabled={!selectedRace || loading}
            className={loading ? 'loading' : ''}
          >
            <option value="">Select Driver</option>
            {drivers.map(driver => (
              <option key={driver.code} value={driver.code}>
                {driver.name} ({driver.team})
              </option>
            ))}
          </select>
        </div>
      </div>

      <button 
        className="analyze-btn"
        onClick={handleAnalyze}
        disabled={!selectedYear || !selectedRace || !selectedDriver1 || !selectedDriver2 || loading || analyzing}
      >
        {analyzing ? 'Analyzing...' : 'Analyze Lap Times'}
      </button>

      {error && <p className="error">{error}</p>}

      {lapTimes && (
        <div className="chart-container">
          <h2 className="chart-title">Lap Time Comparison</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="lap" 
                stroke="#888"
                label={{ value: 'Lap Number', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="#888"
                label={{ value: 'Lap Time (seconds)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111',
                  border: '1px solid #333',
                  borderRadius: '4px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={lapTimes.driver1.code} 
                stroke="#e10600" 
                dot={false}
                name={`${lapTimes.driver1.code}`}
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey={lapTimes.driver2.code} 
                stroke="#00d2be" 
                dot={false}
                name={`${lapTimes.driver2.code}`}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default App; 