import { useState, useEffect } from 'react';
import api from '../api';
import Select from 'react-select';

// This component creates a custom mesocycle dropdown and passes the selected mesocycle

function MesocycleDropDown({ id, setSelectedMesocycle }) {
  const [mesocycleList, setMesocycleList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null); // store the current selected option

  useEffect(() => {
    const fetchMesocycles = async () => {
      try {
        const mesocycleRes = await api.get('/api/mesocycle/');
        setMesocycleList(mesocycleRes.data);

        const initialSelectedMesocycle = mesocycleRes.data.find(
          (mesocycle) => mesocycle.id === parseInt(id, 10) // Ensuring `id` is a number
        );

        if (initialSelectedMesocycle) {
          const selectedOption = {
            value: initialSelectedMesocycle.id,
            label: initialSelectedMesocycle.name,
          };
          setSelectedOption(selectedOption); 
          setSelectedMesocycle(initialSelectedMesocycle); // Pass the selected mesocycle to the parent
        }

        setLoading(false);
      } catch (err) {
        setError(err);
      }
    };
    fetchMesocycles();
  }, [id, setSelectedMesocycle]);
  
  const handleMesocycleChange = (option) => {
    setSelectedOption(option); // Update local state for selected option
    const selectedMesocycle = mesocycleList.find(
      (mesocycle) => mesocycle.id === option.value
    );
    setSelectedMesocycle(selectedMesocycle); // Update the parent state
  };

  const mesocycleOptions = mesocycleList.map((mesocycle) => ({
    value: mesocycle.id,
    label: mesocycle.name,
  }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <Select
      options={mesocycleOptions}
      value={selectedOption}
      onChange={handleMesocycleChange} 
      placeholder="Select Mesocycle"
    />
  );


}

export default MesocycleDropDown;
