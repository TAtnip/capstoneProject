import "../styles/SessionBuilder.css";
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from "../api";
import Select from 'react-select';
import SessionBuilderForm from '../components/SessionBuilderForm';

function SessionBuilder() {
  const { id } = useParams(); // Extracts the mesocycle ID from the URL

  const [mesocycle, setMesocycle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [exercises, setExercises] = useState([]);
  // const [selectedExercise, setSelectedExercise] = useState(null); // Track selected exercise
  // const [muscleGroupOptions, setMuscleGroupOptions] = useState([]); // Options for muscle groups
  // const [selectedMuscleGroups, setSelectedMuscleGroups] = useState([]); // Track selected muscle groups
  // const [muscleGroupList, setMuscleGroupList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/mesocycle/${id}/`);
        setMesocycle(res.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // useEffect(() => {
  //   const fetchExercises = async () => {
  //     try {
  //       const res = await api.get("/api/exercise/");
  //       setExercises(res.data);
  //     } catch (err) {
  //       setError(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchExercises();
  // }, []);

  // useEffect(() => {
  //   const fetchMuscleGroupList = async () => {
  //     try{
  //       const res = await api.get("api/musclegroup/");
  //       setMuscleGroupList(res.data);
  //     } catch (err) {
  //       setError(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // fetchMuscleGroupList();
  // }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // // Exercise options for Select
  // const exerciseOptions = exercises.map(exercise => ({
  //   value: exercise.id,
  //   label: exercise.name,
  //   muscleGroups: exercise.muscle_groups // Include muscle groups in the option
  // }));

  // const muscleGroupOpts = muscleGroupList.map(muscleGroups => ({
  //   value: muscleGroups.id,
  //   label: muscleGroups.name
  // }));

  // // Handle exercise selection change
  // const handleExerciseChange = (selectedOption) => {
  //   setSelectedExercise(selectedOption); // Update selected exercise

  //   // Populate muscle group options based on the selected exercise
  //   if (selectedOption && selectedOption.muscleGroups) {
  //     const options = selectedOption.muscleGroups.map(mg => ({
  //       value: mg.id,
  //       label: mg.name
  //     }));

  //     // Automatically select the muscle groups related to the exercise
  //     setSelectedMuscleGroups(options);
  //   } else {
  //     setSelectedMuscleGroups([]); // Clear selected muscle groups
  //   }
  // };

  // const handleMuscleGroupChange = (selectedOptions) => {
  //   setSelectedMuscleGroups(selectedOptions || []); // Track selected muscle groups
  // };

  return ( 
  <SessionBuilderForm mesocycle = {mesocycle}/>
  //   <div className="sessionbuilder-container">
  //     <div className="sessionbuilder-mesocycle-name">
  //       <h2>{mesocycle.name}</h2>
  //     </div>
  //     <div className="sessionbuilder-exercises">
  //       <h3>Exercise:</h3>
  //       <Select
  //         options={exerciseOptions}
  //         value={selectedExercise}
  //         onChange={handleExerciseChange}
  //         placeholder="Select an exercise"
  //       />
  //     </div>
  //     <div className="sessionbuilder-muscle-groups">
  //       <h3>Muscle Groups:</h3>
  //       <Select
  //         options={muscleGroupOpts}
  //         isMulti={true} // Allow multiple muscle groups to be selected
  //         value={selectedMuscleGroups} // Automatically select the muscle groups related to the exercise
  //         onChange={handleMuscleGroupChange}
  //         placeholder="Select muscle groups"
  //       />
  //     </div>
  //   </div>
  );
}

export default SessionBuilder;