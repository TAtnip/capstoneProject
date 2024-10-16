import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip } from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

const LineChart = ({ chartData }) => {
  const predefinedColors = [
    { borderColor: 'rgba(0, 128, 0, 1)', backgroundColor: 'rgba(0, 128, 0, 0.6)' }, // Green
    { borderColor: 'rgba(0, 0, 255, 1)', backgroundColor: 'rgba(0, 0, 255, 0.6)' }, // Blue
    { borderColor: 'rgba(255, 0, 0, 1)', backgroundColor: 'rgba(255, 0, 0, 0.6)' }, // Red
    { borderColor: 'rgba(128, 0, 128, 1)', backgroundColor: 'rgba(128, 0, 128, 0.6)' }, // Purple
    { borderColor: 'rgba(255, 165, 0, 1)', backgroundColor: 'rgba(255, 165, 0, 0.6)' }, // Orange
    { borderColor: 'rgba(128, 128, 128, 1)', backgroundColor: 'rgba(128, 128, 128, 0.6)' }, // Gray
  ];
  
  const datasets = chartData.flatMap((exercise, index) => {
    // Assign the color for both improvement and set counts using the same predefined color
    const color = predefinedColors[index % predefinedColors.length];
  
    const improvementDataset = {
      label: `${exercise.label} Improvement`,
      data: exercise.data, // Percentage improvement data for the exercise
      borderColor: color.borderColor,
      backgroundColor: color.backgroundColor,
      tension: 0.4,
      spanGaps: true,
      pointHoverRadius: 7,
      pointRadius: 5,
      yAxisID: exercise.isPLView ? 'y' : 'y1', // Correct Y-axis for improvements
    };
  
    const setCountsDataset = {
      label: `${exercise.label} Sets`,
      data: exercise.setCounts, // Set counts data
      borderColor: 'rgba(0, 0, 0, 1.0)', // Use the same color for set counts
      backgroundColor: color.backgroundColor, // Use the same background color as improvement
      tension: 0.4,
      spanGaps: true,
      pointStyle: 'triangle',
      pointHoverRadius: 8,
      pointRadius: 7,
      yAxisID: 'y1', // Always use y1 for set counts
      hidden: exercise.isPLView, // Hide when isPLView is true
    };
  
    return [improvementDataset, setCountsDataset]; // Return both datasets
  });
  

  const data = {
    labels: chartData[0]?.dates || [],  // Continuous dates for x-axis
    datasets: datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: 20,
          boxWidth: 30,
          boxHeight: 15,
          borderRadius: 5,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            const datasetIndex = context.datasetIndex;
            const targetDatasetIndex = 0; // Set this to the index of the dataset you want the custom tooltip for
            
            if (datasetIndex === targetDatasetIndex) {
              // Custom tooltip for the specific dataset
              const oneRepMax = context.raw;
              const date = context.label;
              const exerciseName = context.dataset.label;
              return `${exerciseName} - Date: ${date} - 1RM change from baseline: ${oneRepMax.toFixed(2)}%`;
            } else {
              // Default tooltip for other datasets
              return;
            }
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Improvement',
        },
        ticks: {
          callback: (value) => `${value.toFixed(0)}%`, // Show percentage
        },
        min: 0, // Set minimum value for the Y-axis
        max: Math.max(...datasets.flatMap(dataset => dataset.data)) // Adjust max based on your data

      },
      y1: {  // Second Y-axis
        type: 'linear', // Ensure it's a linear scale
        position: 'right', // Position it on the right
        title: {
          display: true,
          text: 'Set Counts',  // Change this to whatever you want for the second Y-axis
        },
        grid: {
          display: false, // Disable grid lines for this Y-axis
        },
        ticks: {
          
        },
      },
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
  };
  
  

  return <Line data={data} options={options} />;
};

export default LineChart;
