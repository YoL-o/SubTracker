import React, { useMemo } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { Subscription } from '../types';
import { categories, currencies } from '../data/categories';
import { TrendingUp, PieChart, BarChart3, DollarSign } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsProps {
  subscriptions: Subscription[];
  defaultCurrency: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ subscriptions, defaultCurrency }) => {
  const currencySymbol = currencies.find(c => c.code === defaultCurrency)?.symbol || '$';
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);

  const categoryData = useMemo(() => {
    const categoryTotals = new Map<string, number>();
    
    activeSubscriptions.forEach(sub => {
      const monthlyAmount = sub.billingCycle === 'yearly' 
        ? sub.amount / 12 
        : sub.billingCycle === 'custom' && sub.customDays
        ? (sub.amount / sub.customDays) * 30
        : sub.amount;
      
      categoryTotals.set(
        sub.category, 
        (categoryTotals.get(sub.category) || 0) + monthlyAmount
      );
    });

    const sortedCategories = Array.from(categoryTotals.entries())
      .sort(([,a], [,b]) => b - a);

    return {
      labels: sortedCategories.map(([category]) => category),
      amounts: sortedCategories.map(([,amount]) => amount),
      colors: sortedCategories.map(([category]) => 
        categories.find(cat => cat.name === category)?.color || '#95a5a6'
      ),
    };
  }, [activeSubscriptions]);

  const monthlyTrend = useMemo(() => {
    const months = [];
    const amounts = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      
      // For demo purposes, we'll simulate monthly spending
      const monthlySpend = activeSubscriptions.reduce((total, sub) => {
        const monthlyAmount = sub.billingCycle === 'yearly' 
          ? sub.amount / 12 
          : sub.billingCycle === 'custom' && sub.customDays
          ? (sub.amount / sub.customDays) * 30
          : sub.amount;
        return total + monthlyAmount;
      }, 0);
      
      // Add some variation for demo
      amounts.push(monthlySpend * (0.8 + Math.random() * 0.4));
    }
    
    return { months, amounts };
  }, [activeSubscriptions]);

  const pieChartData = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.amounts,
        backgroundColor: categoryData.colors,
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const barChartData = {
    labels: monthlyTrend.months,
    datasets: [
      {
        label: `Monthly Spend (${currencySymbol})`,
        data: monthlyTrend.amounts,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const totalMonthlySpend = categoryData.amounts.reduce((total, amount) => total + amount, 0);
  const averagePerCategory = totalMonthlySpend / categoryData.labels.length || 0;
  const highestCategory = categoryData.labels[0];
  const highestAmount = categoryData.amounts[0] || 0;

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="mb-0">Analytics</h2>
        <p className="text-muted mb-0">Insights into your subscription spending</p>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="card-hover">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Total Monthly</h6>
                  <h3 className="mb-0 text-primary">{currencySymbol}{totalMonthlySpend.toFixed(2)}</h3>
                </div>
                <DollarSign size={32} className="text-primary opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="card-hover">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Categories</h6>
                  <h3 className="mb-0 text-info">{categoryData.labels.length}</h3>
                </div>
                <PieChart size={32} className="text-info opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="card-hover">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Avg per Category</h6>
                  <h3 className="mb-0 text-success">{currencySymbol}{averagePerCategory.toFixed(2)}</h3>
                </div>
                <BarChart3 size={32} className="text-success opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="card-hover">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Top Category</h6>
                  <h3 className="mb-0 text-warning">{currencySymbol}{highestAmount.toFixed(2)}</h3>
                  <small className="text-muted">{highestCategory}</small>
                </div>
                <TrendingUp size={32} className="text-warning opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {activeSubscriptions.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <BarChart3 size={64} className="text-muted mb-3" />
            <h5>No data to analyze</h5>
            <p className="text-muted">Add some subscriptions to see your spending analytics.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {/* Category Breakdown */}
          <Col lg={6} className="mb-4">
            <Card className="card-hover h-100">
              <Card.Header>
                <h5 className="mb-0">
                  <PieChart size={20} className="me-2" />
                  Spending by Category
                </h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pie data={pieChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Monthly Trend */}
          <Col lg={6} className="mb-4">
            <Card className="card-hover h-100">
              <Card.Header>
                <h5 className="mb-0">
                  <BarChart3 size={20} className="me-2" />
                  Monthly Spending Trend
                </h5>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  <Bar data={barChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Category Details */}
          <Col lg={12}>
            <Card className="card-hover">
              <Card.Header>
                <h5 className="mb-0">Category Breakdown</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {categoryData.labels.map((category, index) => {
                    const categoryInfo = categories.find(cat => cat.name === category);
                    const amount = categoryData.amounts[index];
                    const percentage = ((amount / totalMonthlySpend) * 100).toFixed(1);
                    
                    return (
                      <Col key={category} lg={4} md={6} className="mb-3">
                        <Card className="bg-light">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <span className="me-2" style={{ fontSize: '1.5rem' }}>
                                  {categoryInfo?.icon || '📦'}
                                </span>
                                <div>
                                  <h6 className="mb-0">{category}</h6>
                                  <small className="text-muted">{percentage}% of total</small>
                                </div>
                              </div>
                              <div className="text-end">
                                <div className="fw-bold">{currencySymbol}{amount.toFixed(2)}</div>
                                <small className="text-muted">per month</small>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Analytics;