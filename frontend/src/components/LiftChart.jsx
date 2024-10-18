import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip } from 'chart.js';

// This component contains the necessary logic to create the Line charts for both Powerlifting and Bodybuilding views. 
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

const LineChart = ({ chartData, isPLView }) => {
  // Colors are predefined as allowing random colors lead to difficulty differentiating between them. 
  const predefinedColors = [
    { borderColor: 'rgba(0, 128, 0, 1)', backgroundColor: 'rgba(0, 128, 0, 0.6)' }, // Green
    { borderColor: 'rgba(0, 0, 255, 1)', backgroundColor: 'rgba(0, 0, 255, 0.6)' }, // Blue
    { borderColor: 'rgba(255, 0, 0, 1)', backgroundColor: 'rgba(255, 0, 0, 0.6)' }, // Red
    { borderColor: 'rgba(128, 0, 128, 1)', backgroundColor: 'rgba(128, 0, 128, 0.6)' }, // Purple
    { borderColor: 'rgba(255, 165, 0, 1)', backgroundColor: 'rgba(255, 165, 0, 0.6)' }, // Orange
    { borderColor: 'rgba(128, 128, 128, 1)', backgroundColor: 'rgba(128, 128, 128, 0.6)' }, // Gray
  ];
  
  // Notably, there are two datasets potentially being graphed; percent improvement and set count for that exercise. Set count is only graphed if the user is on the bodybuilding graph
  const datasets = chartData.flatMap((exercise, index) => {
    const color = predefinedColors[index % predefinedColors.length];

    const improvementDataset = {
      label: `${exercise.label}`,
      data: exercise.data,
      borderColor: color.borderColor,
      backgroundColor: color.backgroundColor,
      tension: 0.4,
      spanGaps: true,
      pointHoverRadius: 7,
      pointRadius: 5,
      yAxisID: 'y', // 'y' for improvement
    };
  
    const setCountsDataset = {
      label: `${exercise.label} Sets`,
      data: exercise.setCounts,
      borderColor: color.borderColor, // Black for set counts
      backgroundColor: color.backgroundColor, // Use the same background color as improvement for the corresponding exercise
      tension: 0,
      spanGaps: true,
      pointStyle: false,
      pointHoverRadius: 8,
      pointRadius: 7,
      yAxisID: 'y1', // 'y1' for set counts
      hidden: isPLView, // Hide set count datasets when isPLView is true
    };

    // Only concerned with set count data if the user is on the bodybuilding view
    return isPLView ? [improvementDataset] : [improvementDataset, setCountsDataset];
  });

  const data = {
    labels: chartData[0]?.dates || [],  // Continuous dates for x-axis
    datasets: datasets,
  };

  const scales = {
    x: {
      title: {
        display: true,
        text: 'Date',
        font: {
          size: 14,
        },
      },
      grid: {
        display: false,
      },
    },
    y: {
      title: {
        display: true,
        text: 'Improvement (%)',
        font: {
          size: 14,
        },
      },
      ticks: {
        font: {
          size: 14,
        },
        callback: (value) => `${value.toFixed(0)}%`, // Show percentage
      },
      grid: {
        display: isPLView,
      },
      min: 0, 
      max: Math.max(...datasets.flatMap(dataset => dataset.data)) // Adjust max based on data.
    },
  };

  // Conditionally add the second Y-axis only when isPLView is false (Bodybuilding view)
  if (!isPLView) {
    const setCountsData = datasets
      .filter(dataset => dataset.label.includes('Sets'))  // Only consider datasets for set counts
      .flatMap(dataset => dataset.data);  // Extract the data points
  
    const maxSetCount = setCountsData.length > 0 ? Math.max(...setCountsData) : 0;  // Find the max set count
  
    scales.y1 = {  // Second Y-axis for set counts
      type: 'linear', 
      position: 'right', // Sets to be held on the right side of the graph
      title: {
        display: true,
        text: 'Set Counts',
        font: {
          size: 14,
        }
      },
      ticks: {
        font: {
          size: 14,
        },
      },
      grid: {
        display: true, 
      },
      min: 0,
      max: maxSetCount + 5,  // Buffer to the maximum set count value
    };
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        align: 'center',
        labels: {
          font: {
            size: 16,
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
            const targetDatasetIndex = 0; // Set to the index of the improvement dataset in order to only show this for that dataset
            
            if (datasetIndex === targetDatasetIndex) {
              const oneRepMax = context.raw;
              const date = context.label;
              const exerciseName = context.dataset.label;
              return `${exerciseName} - Date: ${date} - 1RM change from baseline: ${oneRepMax.toFixed(2)}%`;
            }
          }
        }
      }
    },
    
    scales: scales,
    hover: {
      mode: 'nearest',
      intersect: true,
    },
  };
  
  return <Line data={data} options={options} />;
};

export default LineChart;
