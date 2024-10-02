import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import Mesocycle from "../components/Mesocycle";
import "../styles/BuildMeso.css";

function BuildMesoForm({ route, method }) {
  const [user_id, setUser_id] = useState("");
  const [name, setName] = useState("");
  const [start_date, setStart_date] = useState("");
  const [end_date, setEnd_date] = useState("");
  const [description, setDescription] = useState("");
  const [mesocycles, setMesocycles] = useState([]);

  const navigate = useNavigate();
  useEffect(() => {
    getMesocycles();
  }, [])

  const getMesocycles = () => {
    api
      .get(route)
      .then((res) => res.data)
      .then((data) => { setMesocycles(data); console.log(data) })
      .catch((err) => alert(err));
  };

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

  return ( <div>
  <div>
    <h2>Mesocycles</h2>
    {mesocycles.map((mesocycle) => (
      <Mesocycle mesocycle={mesocycle} key={mesocycle.id}/>
    ))}
  </div>
    <h2>Build a New Mesocycle</h2>
    <form onSubmit={createMesocycle}>
      <label htmlFor="name">Mesocycle Name:</label>
      <br/>
      <input
        type="text"
        id="name"
        name="name"
        required
        onChange={(e) => setName(e.target.value)}
        value={name}/>
      <br/>
      <label htmlFor="start_date">Start Date: </label>
      <br/>
      <input
        type="date"
        id="start_date"
        name="start_date"
        required
        onChange={(e) => setStart_date(e.target.value)}
        value={start_date}/>
      <br/>
      <label htmlFor="end_date">End Date: </label>
      <br/>
      <input
        type="date"
        id="end_date"
        name="end_date"
        required
        onChange={(e) => setEnd_date(e.target.value)}
        value={end_date}/>
      <br/>
      <label htmlFor="description">Description: </label>
      <br/>
      <textarea
        type="Description"
        id="description"
        name="description"
        required
        onChange={(e) => setDescription(e.target.value)}
        value={description}/>
      <br/>
      <input type="submit" value= "Build"/>
    </form>
  </div>
  )
}

export default BuildMesoForm;
