import { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../api';
import '../styles/SessionBuilderForm.css';
import { addDays, startOfWeek, format, addWeeks, subWeeks, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';

function SessionBuilderForm({ mesocycle }) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const [currentWeek, setCurrentWeek] = useState(() => {
    const startDate = new Date(mesocycle.start_date);
    return startOfWeek(startDate, { weekStartsOn: 0 }); // Sunday as the start of the week
  });

  const allDates = eachDayOfInterval({
    start: parseISO(mesocycle.start_date),
    end: parseISO(mesocycle.end_date)
  }).map(date => format(date, 'yyyy-MM-dd'));

  console.log(allDates);
  const [exercises, setExercises] = useState([]);
  const [muscleGroupList, setMuscleGroupList] = useState([]);
  const [exercisesByDay, setExercisesByDay] = useState(
    daysOfWeek.reduce((acc, day) => ({
      ...acc,
      [day]: [{ exerciseId: "", muscleGroups: [], sets: 0, weight: null, reps: null, rir: null }],
    }), {})
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch exercises and muscle groups
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exerciseRes, muscleGroupRes] = await Promise.all([
          api.get("/api/exercise/"),
          api.get("/api/musclegroup/")
        ]);
        setExercises(exerciseRes.data);
        setMuscleGroupList(muscleGroupRes.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare react-select options
  const exerciseOptions = exercises.map((exercise) => ({
    value: exercise.id,
    label: exercise.name,
  }));

  const muscleGroupOptions = muscleGroupList.map((mg) => ({
    value: mg.id,
    label: mg.name,
  }));

  // Add exercise to a specific day
  const handleAddExercise = (day) => {
    setExercisesByDay((prevExercises) => ({
      ...prevExercises,
      [day]: [...prevExercises[day], { exerciseId: "", muscleGroups: [], sets: 1, weight: null, reps: null, rir: null }],
    }));
  };

  // Remove exercise from a specific day
  const handleRemoveExercise = (day, index) => {
    setExercisesByDay((prevExercises) => ({
      ...prevExercises,
      [day]: prevExercises[day].filter((_, i) => i !== index)
    }));
  };

  // Handle exercise selection
  const handleExerciseChange = (day, index, selectedOption) => {
    const updatedExercises = exercisesByDay[day].map((exercise, i) => {
      if (i === index) {
        const selectedExercise = exercises.find(e => e.id === selectedOption.value);
        const muscleGroupIds = selectedExercise ? selectedExercise.muscle_groups.map(mg => mg.id) : [];
        return {
          ...exercise,
          exerciseId: selectedOption ? selectedOption.value : "",
          muscleGroups: muscleGroupIds, // Update muscle groups
        };
      }
      return exercise;
    });

    setExercisesByDay((prevExercises) => ({
      ...prevExercises,
      [day]: updatedExercises,
    }));
  };

  // Handle muscle group selection
  const handleMuscleGroupChange = (day, index, selectedGroups) => {
    const updatedExercises = exercisesByDay[day].map((exercise, i) => {
      if (i === index) {
        return { ...exercise, muscleGroups: selectedGroups.map((group) => group.value) };
      }
      return exercise;
    });
    setExercisesByDay((prevExercises) => ({
      ...prevExercises,
      [day]: updatedExercises,
    }));
  };

  // Handle set change
  const handleSetChange = (day, index, sets) => {
    const updatedExercises = exercisesByDay[day].map((exercise, i) => {
      if (i === index) {
        return { ...exercise, sets: sets ? parseInt(sets) : 1 }; // Ensure it's parsed as an integer
      }
      return exercise;
    });
    setExercisesByDay((prevExercises) => ({
      ...prevExercises,
      [day]: updatedExercises,
    }));
  };

  // Handle weight, reps, and rir change
  const handleWeightChange = (day, index, weight) => {
    const updatedExercises = exercisesByDay[day].map((exercise, i) => {
      if (i === index) {
        return { ...exercise, weight: weight !== "" ? parseFloat(weight) : null };
      }
      return exercise;
    });
    setExercisesByDay((prevExercises) => ({
      ...prevExercises,
      [day]: updatedExercises,
    }));
  };

  const handleRepsChange = (day, index, reps) => {
    const updatedExercises = exercisesByDay[day].map((exercise, i) => {
      if (i === index) {
        return { ...exercise, reps: reps !== "" ? parseInt(reps) : null };
      }
      return exercise;
    });
    setExercisesByDay((prevExercises) => ({
      ...prevExercises,
      [day]: updatedExercises,
    }));
  };

  const handleRirChange = (day, index, rir) => {
    const updatedExercises = exercisesByDay[day].map((exercise, i) => {
      if (i === index) {
        return { ...exercise, rir: rir !== "" ? parseInt(rir) : null };
      }
      return exercise;
    });
    setExercisesByDay((prevExercises) => ({
      ...prevExercises,
      [day]: updatedExercises,
    }));
  };

  // Calculate the date for each day of the current week
  const getDateForDay = (dayIndex) => {
    return addDays(currentWeek, dayIndex);
  };

  // Week navigation
  const goToPreviousWeek = () => {
    setCurrentWeek((prevWeek) => {
      // Clear exercises for the previous week
      setExercisesByDay(daysOfWeek.reduce((acc, day) => ({
        ...acc,
        [day]: [{ exerciseId: "", muscleGroups: [], sets: 0, weight: null, reps: null, rir: null }],
      }), {}));
      return subWeeks(prevWeek, 1);
    });
  };

  const goToNextWeek = () => {
    setCurrentWeek((prevWeek) => {
      // Clear exercises for the next week
      setExercisesByDay(daysOfWeek.reduce((acc, day) => ({
        ...acc,
        [day]: [{ exerciseId: "", muscleGroups: [], sets: 0, weight: null, reps: null, rir: null }],
      }), {}));
      return addWeeks(prevWeek, 1);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create session data
    const sessionsData = daysOfWeek.map((day, index) => ({
      date: format(getDateForDay(index), 'yyyy-MM-dd'),
      mesocycle: mesocycle.id, // Include mesocycle ID
    }));

    try {
      const res = await api.post("/api/session/", sessionsData); // Send session data
      console.log("Session saved successfully:", res.data);
    } catch (err) {
      console.error("Error saving session:", err);
    }
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="sessionbuilder-container">
      {/* Left side: session builder form */}
      <div className="sessionbuilder-form">
        <h2>{mesocycle?.name || "Mesocycle Name"}</h2>
        <p>Start Date: {mesocycle?.start_date || "N/A"}</p>
        <p>End Date: {mesocycle?.end_date || "N/A"}</p>

        <div className="week-navigation">
          <button onClick={goToPreviousWeek}>Previous Week</button>
          <span>{format(currentWeek, 'MMMM dd')} - {format(addDays(currentWeek, 6), 'MMMM dd')}</span>
          <button onClick={goToNextWeek}>Next Week</button>
        </div>
        <form onSubmit={handleSubmit}>
          {allDates
            .filter((day) =>
              isWithinInterval(new Date(day), { start: currentWeek, end: addDays(currentWeek, 7) }) // Check if the date is within the current week
            )
            .map((day, index) => (
              <div key={index}>
                <div key={day} className="day-section">
                  <h3>{format(parseISO(day), 'EEEE')} - {format(getDateForDay(index), 'MMMM dd, yyyy')}</h3>
                  
                </div>
              </div>
            ))}

        </form>
        <form onSubmit={handleSubmit}>
          {daysOfWeek.map((day, index) => (
            <div key={day} className="day-section">
              <h3>{day} - {format(getDateForDay(index), 'MMMM dd, yyyy')}</h3>
              {exercisesByDay[day].map((exercise, i) => (
                <div key={i} className="exercise-input">
                  <Select
                    options={exerciseOptions}
                    onChange={(selectedOption) => handleExerciseChange(day, i, selectedOption)}
                    placeholder="Select Exercise"
                    isClearable
                  />
                  <Select
                    options={muscleGroupOptions}
                    isMulti
                    value={muscleGroupOptions.filter(mg => exercise.muscleGroups.includes(mg.value))} // Set selected values
                    onChange={(selectedGroups) => handleMuscleGroupChange(day, i, selectedGroups)}
                    placeholder="Select Muscle Groups"
                  />

                  {/* Sets input */}
                  <input
                    type="number"
                    value={exercise.sets || ""}
                    onChange={(e) => handleSetChange(day, i, e.target.value)}
                    placeholder="Sets"
                  />

                  {/* Weight input */}
                  <input
                    type="number"
                    value={exercise.weight || ""}
                    onChange={(e) => handleWeightChange(day, i, e.target.value)}
                    placeholder="Weight"
                    step="0.1"
                  />

                  {/* Reps input */}
                  <input
                    type="number"
                    value={exercise.reps || ""}
                    onChange={(e) => handleRepsChange(day, i, e.target.value)}
                    placeholder="Reps"
                  />

                  {/* RIR input */}
                  <input
                    type="number"
                    value={exercise.rir || ""}
                    onChange={(e) => handleRirChange(day, i, e.target.value)}
                    placeholder="RIR"
                  />

                  <button type="button" onClick={() => handleRemoveExercise(day, i)}>Remove</button>
                </div>
              ))}

              <button type="button" onClick={() => handleAddExercise(day)}>Add Exercise</button>
            </div>
          ))}

          <button type="submit">Save Session</button>
        </form>
      </div>

      {/* Right side: muscle group totals */}
      <div className="muscle-group-totals">
        <h3>Muscle Group Totals</h3>
        {/* Display total sets for each muscle group */}
        {muscleGroupList.map((muscleGroup) => {
          const totalSets = daysOfWeek.reduce((total, day) => {
            return total + exercisesByDay[day].reduce((dayTotal, exercise) => {
              return dayTotal + (exercise.muscleGroups.includes(muscleGroup.id) ? (exercise.sets || 0) : 0);
            }, 0);
          }, 0);
          return (
            <div key={muscleGroup.id}>
              <strong>{muscleGroup.name}:</strong> {Number(totalSets)} sets
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SessionBuilderForm;
