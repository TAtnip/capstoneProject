import "../styles/Home.css";
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <img src='/chart.png' alt="Chart" />
      <div className="text-container">
        <strong>
          <div>
            Build your program.
          </div>
          <div>
            Identify your needs at a glance.
          </div>
        </strong>
      </div>
    </div>
  );
}

export default Home;
