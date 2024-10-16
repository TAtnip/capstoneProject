import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '../api';
import '../styles/SessionBuilderForm.css';
import { addDays, startOfWeek, format, addWeeks, subWeeks, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';

function SessionBuilderForm({ mesocycle}) {

  const [currentWeek, setCurrentWeek] = useState(() => {
    const startDate = new Date(mesocycle.start_date);
    return startOfWeek(startDate, { weekStartsOn: 0 });
  });

  const allDates = eachDayOfInterval({
    start: parseISO(mesocycle.start_date),
    end: parseISO(mesocycle.end_date)
  }).map(date => format(date, 'yyyy-MM-dd'));

  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [muscleGroupList, setMuscleGroupList] = useState([]);
  const [exercisesByDay, setExercisesByDay] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setExercisesByDay({});
    setCurrentWeek(startOfWeek(new Date(mesocycle.start_date), { weekStartsOn: 0 }));
  }, [mesocycle]);

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
    if (allDates && allDates.length > 0 && Object.keys(exercisesByDay).length === 0) {
      setExercisesByDay(
        allDates.reduce((acc, day) => ({
          ...acc,
          [day]: [{ exerciseId: "", muscleGroups: [], setsArray: [{ weight: null, reps: null, rir: null }] }],
        }), {})
      );
    }
  }, [allDates]);

  useEffect(() => {
    const fetchSessionsAndSets = async () => {
      if (!mesocycle) return; // Return early if mesocycle is not available

      try {
        const sessionRes = await api.get(`/api/session/?mesocycle=${mesocycle.id}/`);
        const sessions = sessionRes.data;

        for (const session of sessions) {
          const setsRes = await api.get(`/api/set/by-session/${session.id}/`);
          const sets = setsRes.data;

          const exerciseMap = {};

          for (const set of sets) {
            if (!exerciseMap[set.exercise]) {
              const exerciseRes = await api.get(`/api/exercise/${set.exercise}/`);
              const exercise = exerciseRes.data;
              const muscleGroupIds = exercise.muscle_groups.map(mg => mg.id);

              exerciseMap[set.exercise] = {
                exerciseId: set.exercise,
                muscleGroups: muscleGroupIds,
                setsArray: []
              };
            }

            exerciseMap[set.exercise].setsArray.push({
              weight: set.weight,
              reps: set.reps,
              rir: set.rir,
              sequence: set.sequence
            });
          }

          setExercisesByDay(prevExercisesByDay => ({
            ...prevExercisesByDay,
            [session.date]: Object.values(exerciseMap)
          }));
        }
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

  const handleRemoveSet = (day, exerciseIndex, setIndex) => {
    setExercisesByDay((prevExercises) => {
      const updatedExercises = [...prevExercises[day]];


      updatedExercises[exerciseIndex].setsArray = updatedExercises[exerciseIndex].setsArray.filter((_, idx) => idx !== setIndex);

      return { ...prevExercises, [day]: updatedExercises };
    });
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


  const handleAddSet = (day, exerciseIndex) => {
    console.log("Updating state for day:", day, "exercise:", exerciseIndex);
    setExercisesByDay(prevState => {
      const newExercises = [...prevState[day]];
      const updatedExercise = {
        ...newExercises[exerciseIndex],
        setsArray: [...newExercises[exerciseIndex].setsArray, { weight: "", reps: "", rir: "" }]
      };

      newExercises[exerciseIndex] = updatedExercise;

      return {
        ...prevState,
        [day]: newExercises
      };
    });
  };


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

    // Fetch existing sessions
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
        // Check if session already exists
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

          // Delete existing sets before adding the new ones to avoid duplicates
          await api.delete(`/api/set/delete/?session=${sessionId}`);
        }

        // Step 3: Handle sets for the session
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
            console.log("setData:", setData);
            await api.post("/api/set/", setData);
          }
        }
      }
      navigate(`/visuals/`);
    } catch (err) {
      console.error("Error saving session or sets:", err);
    }
  };


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="sessionbuilder-container">
      <div className="sessionbuilder-form">
        <div className="mesocycle-about">
          <h2 className="mesocycle-name">{mesocycle?.name || "Mesocycle Name"}</h2>
          <span className="mesocycle-date-range">{format(parseISO(mesocycle.start_date), 'MMMM dd, yyyy') || "N/A"} - {format(parseISO(mesocycle.end_date), 'MMMM dd, yyyy') || "N/A"}</span>
        </div>
        <hr></hr>

        <div className="week-navigation">

          <button onClick={() => setCurrentWeek((prev) => subWeeks(prev, 1))}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <span>{format(currentWeek, 'MMMM dd')} - {format(addDays(currentWeek, 7), 'MMMM dd')}</span>

          <button onClick={() => setCurrentWeek((prev) => addWeeks(prev, 1))}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        <div className='sessionbuilder-form'>
          <form onSubmit={handleSubmit}>
            {allDates
              .filter(day => isWithinInterval(new Date(day), { start: currentWeek, end: addDays(currentWeek, 7) }))
              .map((day) => (
                <div key={day} className="day-section">
                  <h3>{format(parseISO(day), 'EEEE')} - {format(parseISO(day), 'MMMM dd, yyyy')}</h3>
                  {exercisesByDay[day].map((exercise, i) => (
                    <div key={i} className="exercise-input">
                      <div className="ex-mg-container">
                        <Select
                          options={exerciseOptions}
                          value={exercise.exerciseId ? { value: exercise.exerciseId, label: exercises.find(e => e.id === exercise.exerciseId)?.name } : null}
                          onChange={(selectedOption) => handleExerciseChange(day, i, selectedOption)}
                          placeholder="Select Exercise"
                          isClearable
                          styles={{
                            container: (provided) => ({
                              ...provided,
                              margin: 10
                            })
                          }}
                        />
                        <Select
                          options={muscleGroupOptions}
                          isMulti
                          value={muscleGroupOptions.filter(mg => exercise.muscleGroups.includes(mg.value))}
                          onChange={(selectedGroups) => handleMuscleGroupChange(day, i, selectedGroups)}
                          placeholder="Select Muscle Groups"
                          styles={{
                            container: (provided) => ({
                              ...provided,
                              margin: 10
                            })
                          }}
                        />
                      </div>
                      {exercise.setsArray.map((set, j) => (
                        <div key={j} className="set-input-container">
                          <div className="set-number">Set {j + 1}</div>
                          <div className="sets">
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
                            <div className="remove-set">
                              <button type="button" onClick={() => handleRemoveSet(day, i, j)}><FontAwesomeIcon icon={faTimes} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="buttons-container">

                        <div className="add-set">
                          <button type="button" onClick={() => handleAddSet(day, i)}>Add Set</button>
                        </div>
                        <div className="remove-ex">
                          <button type="button" onClick={() => handleRemoveExercise(day, i)}>Remove Exercise</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddExercise(day)}>Add Exercise</button>
                </div>
              ))}
            <button type="submit">Save Sessions</button>
          </form>
        </div>
      </div>

      {/* Right side: muscle group totals, make into it's own component */}
      <div>
        <div className="muscle-group-totals">
          <h3>Week Set Totals</h3>

          {muscleGroupList.map((muscleGroup) => {
            const totalSets = allDates
              .filter((day) =>
                isWithinInterval(new Date(day), { start: currentWeek, end: addDays(currentWeek, 7) }) // Check if date is within the current week
              )
              .reduce((total, day) => {
                return total + exercisesByDay[day].reduce((dayTotal, exercise) => {
                  // Calculate total sets for the muscle group
                  const setsCount = exercise.setsArray ? exercise.setsArray.length : 0; // Get the number of sets for the exercise
                  return dayTotal + (exercise.muscleGroups.includes(muscleGroup.id) ? setsCount : 0);
                }, 0);
              }, 0);

            return totalSets > 0 ? (
              <div className="muscle-groups-container" key={muscleGroup.id}>
                <strong>{muscleGroup.name}:</strong>
                <span className="sets-count"><u>{Number(totalSets)} sets</u></span>
              </div>

            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}

export default SessionBuilderForm;
