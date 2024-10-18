import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { format } from 'date-fns';

// This component creates the custom mesocycle drop down with a modify button.
function Mesocycle({ mesocycles }) {
  const [selectedMeso, setSelectedMeso] = useState(null);
  const navigate = useNavigate();
  const mesocycleList = Object.values(mesocycles);

  const handleModify = () => {
    navigate(`/sessionbuilder/${selectedMeso.value}`);
  };

  const handleMesocycleChange = (option) => {
    setSelectedMeso(option);
  };

  // Custom option label
  const formatOptionLabel = ({ label }) => (
    <div className="centered-option"> {/* Add the centered class */}
      <div>{label.split('\n')[0]}</div> {/* Name */}
      <div>{label.split('\n')[1]}</div> {/* Date */}
    </div>
  );

  return (
    <div className="mesocycle-selection">
      <Select
        options={mesocycleList.map(mesocycle => ({
          value: mesocycle.id,
          label: `${mesocycle.name}\n${format(mesocycle.start_date, 'MMMM dd, yyyy')} - ${format(mesocycle.end_date, 'MMMM dd, yyyy')}`
        }))}
        value={selectedMeso}
        placeholder='Select Mesocycle'
        onChange={handleMesocycleChange}
        formatOptionLabel={formatOptionLabel} // Use the custom label function
      />

      <div className="mesocycle-modify">
        {selectedMeso && (
          <button onClick={handleModify}>Modify Mesocycle</button>
        )}
      </div>
    </div>
  );
}

export default Mesocycle;
