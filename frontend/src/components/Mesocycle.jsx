import React from "react";
import { useNavigate } from 'react-router-dom';

function Mesocycle({mesocycle}) {

  const navigate = useNavigate();

  const handleModify =() => {
    navigate(`/sessionselect/${mesocycle.id}`)
  }
  return (
    <div className="mesocycle-container">
      <div className="mesocycle-fields">
        <p className="mesocycle-name">{mesocycle.name}</p>
        <p className="mesocycle-dates">{mesocycle.start_date}-{mesocycle.end_date}</p>
      </div>
      <div className="mesocycle-modify">
        <button onClick={handleModify}>Modify Mesocycle</button>
      </div>
    </div>
    
  )
}

export default Mesocycle;