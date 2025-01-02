import React, { useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import api from "../api";

// Register all Chart.js components
Chart.register(...registerables);

const GratitudeChart = ({chartData}) => {
//   const [chartData, setChartData] = useState(props.chartData);

//   useEffect(() => {
//     api.get("/gratitude_growth/alovelace").then((response) => {
//       const data = response.data;

//       const labels = data.map((entry) =>
//         new Date(entry.timestamp).toLocaleDateString("en-US", {
//           month: "short",
//           day: "numeric",
//         })
//       );
//       const counts = data.map((entry) => entry.count);

//       setChartData({
//         labels,
//         datasets: [
//           {
//             label: "Gratitude Growth",
//             data: counts,
//             borderColor: "rgba(75,192,192,1)",
//             backgroundColor: "rgba(75,192,192,0.2)",
//             pointBorderColor: "rgba(75,192,192,1)",
//             pointBackgroundColor: "rgba(75,192,192,0.2)",
//             tension: 0.4,
//           },
//         ],
//       });
//     });
//   }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Gratitude Count",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div >
      <h2 className="text-center text-2xl mb-4">Gratitude Growth Over Time</h2>
      {chartData ? (
        <Line className="flex justify-center items-center mt-10 gap-10 w-full h-[200px]" data={chartData} options={options} />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default GratitudeChart;
