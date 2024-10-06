import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Legend } from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend);

const LineChart = ({ chartData }) => {
  const datasets = chartData.map((exercise) => ({
    label: exercise.label, 
    data: exercise.data, // Percentage improvement data for the exercise
    borderColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`,
    backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.2)`,
    fill: true,
    tension: 0.1,
  }));

  const data = {
    labels: chartData[0]?.dates || [], // Dates for x-axis
    datasets: datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top', 
        labels: {
          boxWidth: 20, 
          padding: 15,  
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Percentage Improvement',
        },
        ticks: {
          callback: (value) => `${value.toFixed(2)}%`, // Format y-axis ticks as percentages
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default LineChart;
