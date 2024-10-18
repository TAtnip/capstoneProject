import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Mesocycle from "../components/Mesocycle";
import "../styles/BuildMeso.css";


// This component allows the user to build a mesocycle OR modify a mesocycle. 

function BuildMesoForm({ route, method }) {
  const [name, setName] = useState("");
  const [start_date, setStart_date] = useState("");
  const [end_date, setEnd_date] = useState("");
  const [description, setDescription] = useState("");
  const [mesocycles, setMesocycles] = useState([]);

  const navigate = useNavigate();

  // Upon loading, getMesocycles function is called to gather all mesocycles for the specific user. 
  useEffect(() => {
    getMesocycles();
  }, []);

  const getMesocycles = () => {
    api
      .get(route)
      .then((res) => res.data)
      .then((data) => { setMesocycles(data); console.log('Mesocycles:', data) })
      .catch((err) => alert(err));
  };

  // This is called when the form is submitted for a new mesocycle.
  const createMesocycle = (e) => {
    e.preventDefault()

    api.post(route, { name, start_date, end_date, description }).then((res) => {
      if (res.status === 201) {
        alert("Mesocycle Created")
        const id = res.data.id;
        navigate(`/sessionbuilder/${id}`);
      } else alert("failed to make mesocycle");

    })
      .catch((err) => alert(err));
  };

  return (
    <div className='mesocycle-container'>

      <div className='mesocycle-form'>

        <h2>Build a new Mesocycle</h2>

        {/* Mesocycle form  */}
        <form onSubmit={createMesocycle}>
          <label htmlFor="name">Name your mesocycle:</label>
          <br />
          <input
            type="text"
            id="name"
            name="name"
            required
            onChange={(e) => setName(e.target.value)}
            value={name} />
          <br />
          <label htmlFor="start_date">Start date: </label>
          <br />
          <input
            type="date"
            id="start_date"
            name="start_date"
            required
            onChange={(e) => setStart_date(e.target.value)}
            value={start_date} />
          <br />
          <label htmlFor="end_date">End date: </label>
          <br />
          <input
            type="date"
            id="end_date"
            name="end_date"
            required
            onChange={(e) => setEnd_date(e.target.value)}
            value={end_date} />
          <br />
          <label htmlFor="description">Add a description: </label>
          <br />
          <textarea
            type="Description"
            id="description"
            name="description"
            required
            onChange={(e) => setDescription(e.target.value)}
            value={description} />
          <br />
          <input type="submit" value="Build" />
        </form>
      </div>

      {/* Mesocycle Modification selection */}
      <div className='mesocycle-select'>
        <h2>Modify a mesocycle</h2>

        <Mesocycle mesocycles={mesocycles} />
      </div>
    </div>
  )
}

export default BuildMesoForm;
