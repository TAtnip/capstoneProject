import { useState, useEffect } from 'react';
import api from '../api';
import Select from 'react-select';

// This component renders once a mesocycle is selected and passes the selected muscle groups from the dropdown.
function MuscleDropDown({ selectedMesocycle, setSelectedMuscleGroups }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]); 
  const [muscleGroupList, setMuscleGroupList] = useState([]);

  useEffect(() => {
    if (selectedMesocycle && selectedMesocycle.id) {
      const fetchLifts = async () => {
        setLoading(true); 
        try {
          const sessionRes = await api.get(`/api/session/?mesocycle=${selectedMesocycle.id}/`);
          const sessions = sessionRes.data;
          const exercises = {};
          const uniqueMuscleGroups = new Set();

          for (const session of sessions) {
            const setsRes = await api.get(`/api/set/by-session/${session.id}/`);
            const sets = setsRes.data;

            for (const set of sets) {
              const exerciseRes = await api.get(`/api/exercise/${set.exercise}/`);
              const exercise = exerciseRes.data;

              exercises[set.exercise] = exercise;

              // Add both the id and name to uniqueMuscleGroups
              exercise.muscle_groups.forEach(mg => {
                uniqueMuscleGroups.add(JSON.stringify(mg)); // Use JSON.stringify to ensure uniqueness 
              });
            }
          }

          // Parse muscle groups back into objects and set state
          const muscleGroupArray = Array.from(uniqueMuscleGroups).map(mg => JSON.parse(mg));
          setMuscleGroupList(muscleGroupArray);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchLifts();
    }
  }, [selectedMesocycle]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleMuscleChange = (selectedOptions) => {
    setSelectedOptions(selectedOptions); // Update local state for selected options
    const selectedMuscleGroup = selectedOptions.map(option => {
      return muscleGroupList.find(muscle => muscle.id === option.value);
    });
    setSelectedMuscleGroups(selectedMuscleGroup); // Update parent state
  };

  return (
    <Select
      options={muscleGroupList.map(muscleGroup => ({
        value: muscleGroup.id,
        label: muscleGroup.name
      }))}
      value={selectedOptions}
      onChange={handleMuscleChange}
      isMulti
      placeholder="Select a muscle group"
    />
  );
}

export default MuscleDropDown;
