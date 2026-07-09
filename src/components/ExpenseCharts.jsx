import { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Info } from 'lucide-react';

// Register ChartJS elements
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const CATEGORY_METADATA = {
  Food: { color: '#486056', label: 'Food' },
  Travel: { color: '#748F84', label: 'Travel' },
  Shopping: { color: '#8DA99E', label: 'Shopping' },
  Clothing: { color: '#A8C9AF', label: 'Clothing' },
  Bills: { color: '#1F2E2B', label: 'Bills' },
  Entertainment: { color: '#BCCFBF', label: 'Entertainment' },
  Health: { color: '#364E46', label: 'Health' },
  Education: { color: '#D9E8DC', label: 'Education' },
  Other: { color: '#BFBCAE', label: 'Other' },
};

export function ExpenseCharts({ expenses }) {
  const [chartType, setChartType] = useState('pie'); // 'pie' or 'bar'

  // Aggregate values by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const cat = expense.category || 'Other';
    const amt = Number(expense.amount || 0);
    acc[cat] = (acc[cat] || 0) + amt;
    return acc;
  }, {});

  const activeCategories = Object.keys(categoryTotals).filter(cat => categoryTotals[cat] > 0);
  const dataValues = activeCategories.map(cat => categoryTotals[cat]);
  const bgColors = activeCategories.map(cat => CATEGORY_METADATA[cat]?.color || '#cbd5e1');
  const borderColors = bgColors;

  // Chart configuration
  const chartData = {
    labels: activeCategories,
    datasets: [
      {
        label: 'Spent Amount (₹)',
        data: dataValues,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: "'Poppins', sans-serif",
            size: 11,
          },
          color: '#1F2E2B',
          boxWidth: 12,
          padding: 12,
        },
      },
      tooltip: {
        titleFont: { family: "'Poppins', sans-serif" },
        bodyFont: { family: "'Poppins', sans-serif" },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        titleFont: { family: "'Poppins', sans-serif" },
        bodyFont: { family: "'Poppins', sans-serif" },
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(31, 46, 43, 0.08)',
        },
        ticks: {
          color: '#1F2E2B',
          font: {
            family: "'Poppins', sans-serif",
            size: 10,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#1F2E2B',
          font: {
            family: "'Poppins', sans-serif",
            size: 10,
          },
        },
      },
    },
  };

  const hasData = activeCategories.length > 0;

  return (
    <div className="expense-charts-card animate-fade">
      <div className="card-header-flex">
        <div>
          <h3 className="card-title">Expense Overview</h3>
          <p className="card-subtitle">See where your money goes</p>
        </div>
        
        {hasData && (
          <div className="segmented-control-container">
            <button
              type="button"
              className={`segmented-control-btn ${chartType === 'pie' ? 'active' : ''}`}
              onClick={() => setChartType('pie')}
            >
              Pie Chart
            </button>
            <button
              type="button"
              className={`segmented-control-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              Bar Chart
            </button>
          </div>
        )}
      </div>

      <div className="chart-content-container">
        {hasData ? (
          <div className="chart-wrapper">
            {chartType === 'pie' ? (
              <Pie data={chartData} options={pieOptions} />
            ) : (
              <Bar data={chartData} options={barOptions} />
            )}
          </div>
        ) : (
          <div className="chart-empty-state">
            <Info size={32} className="empty-state-icon" />
            <h4 className="empty-state-title">Visualization Unavailable</h4>
            <p className="empty-state-text">
              Log transactions to see a graphical distribution of your expenses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpenseCharts;
