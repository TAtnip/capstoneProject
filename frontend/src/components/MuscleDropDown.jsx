import { useState, useEffect } from 'react';
import api from '../api';
import Select from 'react-select';

function LiftDropDown({ selectedMesocycle, setSelectedExercises }) {
  const [exerciseList, setExerciseList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]); // Initialize as an array

  useEffect(() => {
    // Only make the API call if selectedMesocycle is not null
    if (selectedMesocycle && selectedMesocycle.id) {
      const fetchLifts = async () => {
        setLoading(true); // Start loading
        try {
          const sessionRes = await api.get(`/api/session/?mesocycle=${selectedMesocycle.id}/`);
          const sessions = sessionRes.data;
          const exercises = {};
          for (const session of sessions) {
            const setsRes = await api.get(`/api/set/by-session/${session.id}/`);
            const sets = setsRes.data;

            for (const set of sets) {
              const exerciseRes = await api.get(`/api/exercise/${set.exercise}/`);
              const exercise = exerciseRes.data;
              exercises[set.exercise] = exercise; // Store exercise in the object
            }
          }

          setExerciseList(Object.values(exercises));
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false); // Stop loading
        }
      };
      fetchLifts();
    }
  }, [selectedMesocycle]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleLiftChange = (selectedOptions) => {
    setSelectedOptions(selectedOptions); // Update local state for selected options
    const selectedExercises = selectedOptions.map(option => {
      return exerciseList.find(exercise => exercise.id === option.value);
    });
    setSelectedExercises(selectedExercises); // Update the parent state
  };

  return (
    <Select
      options={exerciseList.map(exercise => ({
        value: exercise.id,
        label: exercise.name
      }))}
      value={selectedOptions}
      onChange={handleLiftChange}
      isMulti
      placeholder="Select an Exercise"
    />
  );
}

export default LiftDropDown;
