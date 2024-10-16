import { useState, useEffect } from 'react';
import api from '../api';
import Select, { components } from 'react-select';

function LiftDropDown({ selectedMesocycle, setSelectedExercises }) {
  const [exerciseList, setExerciseList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    if (selectedMesocycle && selectedMesocycle.id) {
      const fetchLifts = async () => {
        setLoading(true);
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
          setLoading(false);
        }
      };
      fetchLifts();
    }
  }, [selectedMesocycle]);

  const handleLiftChange = (selectedOption) => {
    const isOptionSelected = selectedOptions.some(option => option.value === selectedOption.value);
    
    // Toggle the selected option
    const updatedSelected = isOptionSelected
      ? selectedOptions.filter(option => option.value !== selectedOption.value) // Remove if already selected
      : [...selectedOptions, selectedOption]; // Add to selected options

    setSelectedOptions(updatedSelected); // Update local state

    // Map to the corresponding exercises
    const selectedExercises = updatedSelected.map(option => 
      exerciseList.find(exercise => exercise.id === option.value)
    );

    setSelectedExercises(selectedExercises); // Update parent state
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Custom Checkbox Option Component
  const CheckboxOption = (props) => {
    const isSelected = selectedOptions.some(option => option.value === props.data.value);

    return (
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => null} // Prevent the default onChange event
          onClick={() => handleLiftChange(props.data)} // Manually handle the selection toggle
        />
        <label>{props.data.label}</label>
      </components.Option>
    );
  };
  const getValueLabel = () => {
    const count = selectedOptions.length;
    return `${count} ${count === 1 ? 'exercise selected' : 'exercises selected'}`;
  };

  return (
    <Select
      options={exerciseList.map(exercise => ({
        value: exercise.id,
        label: exercise.name
      }))}
      value={null} // Show selected options in the input field
      onChange={() => null} // Disable default onChange, as we handle it via checkboxes
      isMulti
      closeMenuOnSelect={false} // Keep the dropdown open when selecting/deselecting
      hideSelectedOptions={false} // Show the selected options in the dropdown with checkboxes
      components={{ Option: CheckboxOption }} // Use custom checkbox option component
      placeholder={getValueLabel()}
    />
  );
}

export default LiftDropDown;
