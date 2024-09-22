import "../styles/Home.css";
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="grid-container">
      <div className="grids">
        <h2>Plan</h2>
        <div className="button-container">
          <Link to="/buildmeso">
            <button className="build-meso" >Build New Mesocycle</button>
          </Link>
          <Link to="/current-meso">
            <button className="current-meso">Modify Mesocycle</button>
          </Link>
        </div>
      </div>
      <div className="grids">
        <h2>Track</h2>
      </div>
      <div className="grids">
        <h2>Analyze</h2>
      </div>
    </div>
  )
}

export default Home