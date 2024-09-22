import "../styles/SessionSelect.css";
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from "../api";
import Mesocycle from "../components/Mesocycle";

function SessionSelect() {
  const { id } = useParams();
  const navigate = useNavigate(); // Ensure this is at the top level
  const [mesocycle, setMesocycle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    const fetchMesocycle = async () => {
      try {
        const res = await api.get(`/api/mesocycle/${id}/`);
        setMesocycle(res.data);
      } catch (err) {
        setError(err);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMesocycle();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleDayChange = (day) => {
    setSelectedDays((prev) => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startDate = new Date(mesocycle.start_date);
    const endDate = new Date(mesocycle.end_date);
    const sessions = [];

    // Generate all dates between start_date and end_date
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayName = daysOfWeek[d.getDay()]; // Get the day name
      if (selectedDays.includes(dayName)) {
        sessions.push({
          name: dayName,
          date: d.toISOString().split('T')[0],
          notes: "",
          mesocycle: mesocycle.id
        });
      }
    }
    console.log('Submitting the following sessions:', sessions);

    // Submit the session data to the API
    try {
      await Promise.all(sessions.map(session => api.post('/api/session/', session)));
      alert('Sessions created successfully!');
      navigate(`/sessionbuilder/${mesocycle.id}`);
    } catch (error) {
      alert('Error creating sessions: ' + error.message);
    }
  };

  return (
    <div>
      <Mesocycle mesocycle={mesocycle} />
      <form onSubmit={handleSubmit}>
        <h3>Select Training Days:</h3>
        {daysOfWeek.map((day) => (
          <div key={day}>
            <label>
              <input
                type="checkbox"
                value={day}
                checked={selectedDays.includes(day)}
                onChange={() => handleDayChange(day)}
              />
              {day}
            </label>
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default SessionSelect;