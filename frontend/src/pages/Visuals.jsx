import { useParams } from 'react-router-dom';
import '../styles/Visuals.css';
import { useState } from 'react';
import MesocycleDropDown from '../components/MesocycleDropDown';
import ToggleSwitch from '../components/ToggleVisualView';
import LiftDropDown from '../components/LiftDropDown';

function Visuals() {
  const { id } = useParams();
  const [selectedMesocycle, setSelectedMesocycle] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [isPLView, setIsPLView] = useState(true);

  const toggleView = () => {
    setIsPLView((prevView) => {
      console.log('Previous View:', prevView); // Log previous state
      return !prevView; // Toggle state
    });
  };
  console.log(selectedMesocycle);
  console.log(selectedExercises);
  return (
    <div className="visuals-container">
      <div className="visuals-title">
        Progress Analysis
      </div>
      <div className="visuals-dropdowns">
        <MesocycleDropDown id={id} setSelectedMesocycle={setSelectedMesocycle} />
        <ToggleSwitch isPLView={isPLView} toggleView={toggleView} />
        {isPLView ? (
          <LiftDropDown selectedMesocycle={selectedMesocycle} setSelectedExercises={setSelectedExercises}/>
        ) : (
          <div>not pl view</div>
        )
          }

      </div>
    </div>
  );
}

export default Visuals;
