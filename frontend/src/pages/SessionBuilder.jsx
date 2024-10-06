import "../styles/SessionBuilder.css";
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from "../api";
import Select from 'react-select';
import SessionBuilderForm from '../components/SessionBuilderForm';

function SessionBuilder() {
  const { id } = useParams(); 

  const [mesocycle, setMesocycle] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;


  return ( 
  <SessionBuilderForm mesocycle = {mesocycle}/>
  );
}

export default SessionBuilder;