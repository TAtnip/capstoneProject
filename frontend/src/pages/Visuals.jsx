import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from "../api";
import MesocycleDropDown from '../components/MesocycleDropDown';
import ToggleSwitch from '../components/ToggleVisualView';
import LiftDropDown from '../components/LiftDropDown';
import MuscleDropDown from '../components/MuscleDropDown';
import LineChart from '../components/LiftChart';  
import '../styles/visuals.css';
import { format, startOfWeek, endOfWeek } from 'date-fns';

function Visuals() {
  const { id } = useParams();
  const [selectedMesocycle, setSelectedMesocycle] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]);
  const [isPLView, setIsPLView] = useState(true);
  const [chartData, setChartData] = useState([]);



  const generateDateRange = (startDate, endDate) => {
    const dateArray = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= new Date(endDate)) {
      // Format as 'MMM dd' (e.g., 'Sep 24')
      dateArray.push(format(currentDate, 'MMM dd')); 
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dateArray;
  };

  const toggleView = () => {
    setIsPLView((prevView) => !prevView);
  };

  useEffect(() => {
    if (selectedMesocycle && selectedExercises.length > 0 && isPLView) {
      const fetchPerformanceMetrics = async () => {
        try {
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
            const dates = data.map(metric => format(new Date(metric.session_date), 'MMM dd'));  // Extract actual dates from response

            const oneRepMaxValues = data.map(metric => metric.one_rep_max);

            const initialOneRepMax = oneRepMaxValues[0];

            const percentageImprovements = oneRepMaxValues.map(value =>
              ((value - initialOneRepMax) / initialOneRepMax) * 100
            );
  
            // Generate continuous date range based on start and end date of the mesocycle
            const dateRange = generateDateRange(selectedMesocycle.start_date, selectedMesocycle.end_date);
            
            // Map percentage improvements to this continuous date range, fill missing dates with null
            const alignedData = dateRange.map(date => {
              const index = dates.indexOf(date); // Check if this date exists in actual data
              return index !== -1 ? percentageImprovements[index] : null; // If exists, use percentage, otherwise null
            });
  
            return {
              label: selectedExercises[index].name,
              data: alignedData,
              dates: dateRange // Continuous dates for x-axis
            };
          });
  
          setChartData(newChartData);
        } catch (error) {
          console.error("Error fetching performance metrics:", error);
        }
      };
  
      fetchPerformanceMetrics();
    } else if (!isPLView && selectedMesocycle && selectedMuscleGroups.length > 0) {
const fetchPerformanceMetrics = async () => {
  try {
    // Step 1: Fetch exercises that target the selected muscle group(s)
    const exerciseResponses = await Promise.all(
      selectedMuscleGroups.map(muscleGroup =>
        api.get(`/api/exercise/`, {
          params: {
            muscle_group: muscleGroup.id,  // Fetch exercises for each muscle group
          }
        })
      )
    );

    const exercisesByMuscleGroup = {};
    selectedMuscleGroups.forEach((muscleGroup, i) => {
      exercisesByMuscleGroup[muscleGroup.name] = exerciseResponses[i].data;
    });

    if (Object.keys(exercisesByMuscleGroup).length === 0) {
      console.warn("No exercises found for the selected muscle groups.");
      return;
    }

    const weeklyImprovementsByMuscleGroup = {};
    const weeklySetsByMuscleGroup = {};

    // Step 2: Loop over each muscle group to fetch performance metrics and set counts
    await Promise.all(
      selectedMuscleGroups.map(async (muscleGroup) => {
        const exercises = exercisesByMuscleGroup[muscleGroup.name];

        if (exercises.length === 0) return;

        const performanceResponses = await Promise.all(
          exercises.map(exercise =>
            api.get(`/api/performancemetrics/`, {
              params: {
                exercise: exercise.id,
                start_date: selectedMesocycle.start_date,
                end_date: selectedMesocycle.end_date,
              }
            })
          )
        );

        const setResponses = await Promise.all(
          exercises.map(exercise =>
            api.get(`/api/sets/`, {
              params: {
                exercise: exercise.id,
                start_date: selectedMesocycle.start_date,
                end_date: selectedMesocycle.end_date,
              }
            })
          )
        );
        console.log(setResponses);
        weeklyImprovementsByMuscleGroup[muscleGroup.name] = {};
        weeklySetsByMuscleGroup[muscleGroup.name] = {};

        // Step 3: Process performance data and set counts
        performanceResponses.forEach((response, index) => {
          const data = response.data;
          const baselineOneRepMax = data[0]?.one_rep_max;
          if (!baselineOneRepMax) return;

          const metricsWithImprovement = data.map(metric => {
            const percentageImprovement = ((metric.one_rep_max - baselineOneRepMax) / baselineOneRepMax) * 100;
            return { session_date: metric.session_date, percentageImprovement };
          });

          metricsWithImprovement.forEach(metric => {
            const weekStart = format(startOfWeek(new Date(metric.session_date)), 'MMM dd');
            if (!weeklyImprovementsByMuscleGroup[muscleGroup.name][weekStart]) {
              weeklyImprovementsByMuscleGroup[muscleGroup.name][weekStart] = { totalImprovement: 0, exerciseCount: 0 };
            }

            weeklyImprovementsByMuscleGroup[muscleGroup.name][weekStart].totalImprovement += metric.percentageImprovement;
            weeklyImprovementsByMuscleGroup[muscleGroup.name][weekStart].exerciseCount++;
          });
        });

        // Step 4: Process set data for each week
        setResponses.forEach((response) => {
          const data = response.data;

          data.forEach(set => {
            const weekStart = format(startOfWeek(new Date(set.session.date)), 'MMM dd');

            if (!weeklySetsByMuscleGroup[muscleGroup.name][weekStart]) {
              weeklySetsByMuscleGroup[muscleGroup.name][weekStart] = 0;
            }

            weeklySetsByMuscleGroup[muscleGroup.name][weekStart]++;
          });
        });
      })
    );

    // Step 5: Prepare the chart data
    const chartData = Object.keys(weeklyImprovementsByMuscleGroup).map(muscleGroup => {
      const weeklyData = weeklyImprovementsByMuscleGroup[muscleGroup];
      const setCounts = weeklySetsByMuscleGroup[muscleGroup];
      const weeklyAverages = Object.keys(weeklyData).map(week => {
        const { totalImprovement, exerciseCount } = weeklyData[week];
        return {
          week,
          averageImprovement: totalImprovement / exerciseCount,
          totalSets: setCounts[week] || 0
        };
      });

      return {
        label: muscleGroup,
        data: weeklyAverages.map(weekData => weekData.averageImprovement),
        setCounts: weeklyAverages.map(weekData => weekData.totalSets),
        dates: weeklyAverages.map(weekData => weekData.week)
      };
    });

    console.log('Generated Chart Data:', chartData);

    // Step 6: Update the chart with the new data (for selected muscle groups)
    setChartData(chartData);
    
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
  }
};
    
  
      fetchPerformanceMetrics();

    }
  }, [selectedMesocycle, selectedExercises, selectedMuscleGroups]);

  return (
    <div className="visuals-container">
      <div className="visuals-title">Progress Analysis</div>
      <div className="visuals-dropdowns">
        {/* Left side dropdowns */}
        <div className="left-items">
          <MesocycleDropDown id={id} setSelectedMesocycle={setSelectedMesocycle} />
          {isPLView ? (
            <LiftDropDown selectedMesocycle={selectedMesocycle} setSelectedExercises={setSelectedExercises} />
          ) : (
            <MuscleDropDown selectedMesocycle={selectedMesocycle} setSelectedMuscleGroups={setSelectedMuscleGroups} />
          )}
        </div>
        
        {/* Center toggle switch */}
        <div className="center">

        </div>
  
        {/* Right side (if any other elements need to go here, otherwise you can leave it empty for future use) */}
        <div className="right-items">
        <ToggleSwitch isPLView={isPLView} toggleView={toggleView} />
          {/* Any additional components if needed */}
        </div>
      </div>
          
      {chartData.length > 0 && <LineChart chartData={chartData} isPLView={isPLView} />}
    </div>
  );
  
}

export default Visuals;
