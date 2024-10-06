import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from "../api";
import MesocycleDropDown from '../components/MesocycleDropDown';
import ToggleSwitch from '../components/ToggleVisualView';
import LiftDropDown from '../components/LiftDropDown';
import MuscleDropDown from '../components/MuscleDropDown';
import LineChart from '../components/LiftChart';  

function Visuals() {
  const { id } = useParams();
  const [selectedMesocycle, setSelectedMesocycle] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]);
  const [isPLView, setIsPLView] = useState(true);
  const [chartData, setChartData] = useState([]);

  const toggleView = () => {
    setIsPLView((prevView) => !prevView);
  };

  useEffect(() => {
    if (selectedMesocycle && selectedExercises.length > 0) {
      const fetchPerformanceMetrics = async () => {
        try {
          // Use Promise.all to fetch metrics for all selected exercises
          const responses = await Promise.all(
            selectedExercises.map(exercise => 
              api.get(`/api/performancemetrics/`, {
                params: {
                  exercise: exercise.id,
                  start_date: selectedMesocycle.start_date,
                  end_date: selectedMesocycle.end_date,
                }
              })
            )
          );


          const newChartData = responses.map((response, index) => {
            const data = response.data;
            const dates = data.map(metric => metric.date_predicted);
            const oneRepMaxValues = data.map(metric => metric.one_rep_max);
            const initialOneRepMax = oneRepMaxValues[0];

            // Calculate percentage improvements
            const percentageImprovements = oneRepMaxValues.map(value => 
              ((value - initialOneRepMax) / initialOneRepMax) * 100
            );

            return {
              label: selectedExercises[index].name, // Use the name of the exercise for labels
              data: percentageImprovements,
              dates: dates // Keep track of the dates as well
            };
          });

          setChartData(newChartData);
        } catch (error) {
          console.error("Error fetching performance metrics:", error);
        }
      };

      fetchPerformanceMetrics();
    }
  }, [selectedMesocycle, selectedExercises]);

  return (
    <div className="visuals-container">
      <div className="visuals-title">Progress Analysis</div>
      <div className="visuals-dropdowns">
        <MesocycleDropDown id={id} setSelectedMesocycle={setSelectedMesocycle} />
        <ToggleSwitch isPLView={isPLView} toggleView={toggleView} />
        {isPLView ? (
          <LiftDropDown selectedMesocycle={selectedMesocycle} setSelectedExercises={setSelectedExercises} />
        ) : (
          <MuscleDropDown selectedMesocycle={selectedMesocycle} setSelectedMuscleGroups={setSelectedMuscleGroups} />
        )}
      </div>
      {/* Render the LineChart only when there is data.... */}
      {chartData.length > 0 && (
        <LineChart chartData={chartData} />
      )}
    </div>
  );
}

export default Visuals;
