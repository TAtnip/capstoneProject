import { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../api';
import '../styles/SessionBuilderForm.css';
import { addDays, startOfWeek, format, addWeeks, subWeeks, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';

function SessionBuilderForm({ mesocycle }) {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const startDate = new Date(mesocycle.start_date);
    return startOfWeek(startDate, { weekStartsOn: 0 });
  });

  const allDates = eachDayOfInterval({
    start: parseISO(mesocycle.start_date),
    end: parseISO(mesocycle.end_date)
  }).map(date => format(date, 'yyyy-MM-dd'));

  const [exercises, setExercises] = useState([]);
  const [muscleGroupList, setMuscleGroupList] = useState([]);
  const [exercisesByDay, setExercisesByDay] = useState({});

  useEffect(() => {
    if (allDates && allDates.length > 0 && Object.keys(exercisesByDay).length === 0) {
      setExercisesByDay(
        allDates.reduce((acc, day) => ({
          ...acc,
          [day]: [{ exerciseId: "", muscleGroups: [], setsArray: [{ weight: null, reps: null, rir: null }] }],
        }), {})
      );
    }
  }, [allDates, exercisesByDay]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

useEffect(() => {
  const fetchSessionsAndSets = async () => {
    try {
      // Fetch sessions for the current mesocycle
      const sessionRes = await api.get(`/api/session/?mesocycle=${mesocycle.id}/`);
      const sessions = sessionRes.data;

      // Loop through each session to fetch the associated sets
      for (const session of sessions) {
        console.log("session id:", session.id);
        const setsRes = await api.get(`/api/set/by-session/${session.id}/`);
        const sets = setsRes.data;
        console.log("sets:",sets);
        // Create an object to group sets by exerciseId
        const exerciseMap = {}; 

        for (const set of sets) {
          // If the exercise doesn't exist in exerciseMap, fetch the exercise details
          if (!exerciseMap[set.exercise]) {
            const exerciseRes = await api.get(`/api/exercise/${set.exercise}/`);
            const exercise = exerciseRes.data;

            exerciseMap[set.exercise] = {
              exerciseId: set.exercise,
              muscleGroups: exercise.muscle_groups || [],  // Add muscleGroups from API response
              setsArray: []  // Array to hold all sets for this exercise
            };
          }

          // Push the current set data into the setsArray for the respective exercise
          exerciseMap[set.exercise].setsArray.push({
            weight: set.weight,
            reps: set.reps,
            rir: set.rir,
            sequence: set.sequence
          });
        console.log("ex map:" , exerciseMap);
        }

        // Now, you can update exercisesByDay by spreading previous state and adding new data
        setExercisesByDay(prevExercisesByDay => ({
          ...prevExercisesByDay,
          [session.date]: Object.values(exerciseMap) // Update for this session's date
        }));
      }
      console.log(exercisesByDay);
    } catch (err) {
      console.error("Error loading sessions and sets:", err);
    }
  };

  fetchSessionsAndSets();
}, [mesocycle.id]);

  

  const exerciseOptions = exercises.map((exercise) => ({
    value: exercise.id,
    label: exercise.name,
  }));

  const muscleGroupOptions = muscleGroupList.map((mg) => ({
    value: mg.id,
    label: mg.name,
  }));

  const handleAddExercise = (day) => {
    setExercisesByDay((prevExercises) => ({
      ...prevExercises,
      [day]: [...prevExercises[day], { exerciseId: "", muscleGroups: [], setsArray: [{ weight: null, reps: null, rir: null }] }],
    }));
  };

  const handleRemoveExercise = (day, index) => {
    setExercisesByDay((prevExercises) => ({
      ...prevExercises,
      [day]: prevExercises[day].filter((_, i) => i !== index)
    }));
  };

  const handleExerciseChange = (day, index, selectedOption) => {
    const updatedExercises = exercisesByDay[day].map((exercise, i) => {
      if (i === index) {
        const selectedExercise = exercises.find(e => e.id === selectedOption.value);
        const muscleGroupIds = selectedExercise ? selectedExercise.muscle_groups.map(mg => mg.id) : [];
        return {
          ...exercise,
          exerciseId: selectedOption ? selectedOption.value : "",
          muscleGroups: muscleGroupIds,
        };
      }
      return exercise;
    });

    setExercisesByDay((prevExercises) => ({
      ...prevExercises,
      [day]: updatedExercises,
    }));
  };

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

  // Add a new set to a specific exercise
  const handleAddSet = (day, exerciseIndex) => {
    setExercisesByDay((prevExercises) => {
      const updatedExercises = [...prevExercises[day]];
      updatedExercises[exerciseIndex].setsArray.push({ weight: null, reps: null, rir: null });
      return { ...prevExercises, [day]: updatedExercises };
    });
  };

  // Handle set input changes
  const handleSetChange = (day, exerciseIndex, setIndex, field, value) => {
    setExercisesByDay((prevExercises) => {
      const updatedExercises = [...prevExercises[day]];
      updatedExercises[exerciseIndex].setsArray[setIndex] = {
        ...updatedExercises[exerciseIndex].setsArray[setIndex],
        [field]: value !== "" ? (field === "weight" ? parseFloat(value) : parseInt(value)) : null
      };
      return { ...prevExercises, [day]: updatedExercises };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Step 1: Fetch existing sessions
    const existingSessionsRes = await api.get(`/api/session/?mesocycle=${mesocycle.id}/`);
    const existingSessions = existingSessionsRes.data;
  
    const sessionsData = allDates
      .filter(day => exercisesByDay[day] && exercisesByDay[day].some(exercise => exercise.exerciseId))
      .map(day => ({
        date: day,
        mesocycle: mesocycle.id,
      }));
  
    try {
      for (const sessionData of sessionsData) {
        // Step 2: Check if the session already exists
        const existingSession = existingSessions.find(session => session.date === sessionData.date && session.mesocycle === sessionData.mesocycle);
  
        let sessionId;
  
        if (!existingSession) {
          // If it doesn't exist, create the session
          const res = await api.post("/api/session/", sessionData);
          sessionId = res.data.id;
        } else {
          // If it exists, update the session
          sessionId = existingSession.id;
          await api.put(`/api/session/${sessionId}/`, sessionData);
          console.log(`Session for ${sessionData.date} already exists and has been updated.`);
          
          // Optional: You may want to delete existing sets before adding the new ones to avoid duplicates
          await api.delete(`/api/set/delete/?session=${sessionId}`);
        }
  
        // Step 3: Handle the sets for the session
        const exercisesForDay = exercisesByDay[sessionData.date];
        for (const exercise of exercisesForDay) {
          const setsData = exercise.setsArray.map((set, index) => ({
            session: sessionId,
            exercise: exercise.exerciseId,
            weight: set.weight || 0,
            reps: set.reps || 0,
            rir: set.rir || 0,
            sequence: index + 1,
          }));
  
          for (const setData of setsData) {
            await api.post("/api/set/", setData);
          }
        }
      }
    } catch (err) {
      console.error("Error saving session or sets:", err);
    }
  };
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="sessionbuilder-container">
      <div className="sessionbuilder-form">
        <h2>{mesocycle?.name || "Mesocycle Name"}</h2>
        <p>Start Date: {mesocycle?.start_date || "N/A"}</p>
        <p>End Date: {mesocycle?.end_date || "N/A"}</p>

        <div className="week-navigation">
          <button onClick={() => setCurrentWeek((prev) => subWeeks(prev, 1))}>Previous Week</button>
          <span>{format(currentWeek, 'MMMM dd')} - {format(addDays(currentWeek, 7), 'MMMM dd')}</span>
          <button onClick={() => setCurrentWeek((prev) => addWeeks(prev, 1))}>Next Week</button>
        </div>

        <form onSubmit={handleSubmit}>
          {allDates
            .filter(day => isWithinInterval(new Date(day), { start: currentWeek, end: addDays(currentWeek, 7) }))
            .map((day) => (
              <div key={day} className="day-section">
                <h3>{format(parseISO(day), 'EEEE')} - {format(parseISO(day), 'MMMM dd, yyyy')}</h3>
                {exercisesByDay[day].map((exercise, i) => (
                  <div key={i} className="exercise-input">
                    <Select
                      options={exerciseOptions}
                      value={exercise.exerciseId ? { value: exercise.exerciseId, label: exercises.find(e => e.id === exercise.exerciseId)?.name } : null}
                      onChange={(selectedOption) => handleExerciseChange(day, i, selectedOption)}
                      placeholder="Select Exercise"
                      isClearable
                    />
                    <Select
                      options={muscleGroupOptions}
                      isMulti
                      value={muscleGroupOptions.filter(mg => exercise.muscleGroups.includes(mg.value))}
                      onChange={(selectedGroups) => handleMuscleGroupChange(day, i, selectedGroups)}
                      placeholder="Select Muscle Groups"
                    />

                    {exercise.setsArray.map((set, j) => (
                      <div key={j} className="set-input">
                        <input
                          type="number"
                          value={set.weight || ""}
                          onChange={(e) => handleSetChange(day, i, j, 'weight', e.target.value)}
                          placeholder="Weight"
                          step="0.1"
                        />
                        <input
                          type="number"
                          value={set.reps || ""}
                          onChange={(e) => handleSetChange(day, i, j, 'reps', e.target.value)}
                          placeholder="Reps"
                        />
                        <input
                          type="number"
                          value={set.rir || ""}
                          onChange={(e) => handleSetChange(day, i, j, 'rir', e.target.value)}
                          placeholder="RIR"
                        />
                      </div>
                    ))}

                    <button type="button" onClick={() => handleAddSet(day, i)}>Add Set</button>
                    <button type="button" onClick={() => handleRemoveExercise(day, i)}>Remove Exercise</button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddExercise(day)}>Add Exercise</button>
              </div>
            ))}
          <button type="submit">Save Sessions</button>
        </form>
      </div>

      {/* Right side: muscle group totals */}
      <div className="muscle-group-totals">
        <h3>Muscle Group Totals</h3>
        {/* Display total sets for each muscle group */}
        {muscleGroupList.map((muscleGroup) => {
          const totalSets = allDates
            .filter((day) =>
              isWithinInterval(new Date(day), { start: currentWeek, end: addDays(currentWeek, 7) }) // Check if the date is within the current week
            )
            .reduce((total, day) => {
              return total + exercisesByDay[day].reduce((dayTotal, exercise) => {
                // Calculate total sets for the muscle group for the current exercise
                const setsCount = exercise.setsArray ? exercise.setsArray.length : 0; // Get the number of sets for the exercise
                return dayTotal + (exercise.muscleGroups.includes(muscleGroup.id) ? setsCount : 0);
              }, 0);
            }, 0);

          return totalSets > 0 ?  (
          <div key={muscleGroup.id}>
              <strong>{muscleGroup.name}:</strong> {Number(totalSets)} sets
            </div>
        ): null;
        })}
      </div>
    </div>
  );
}

export default SessionBuilderForm;
