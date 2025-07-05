
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Customer, ClusterResult } from '@/utils/clustering';

interface ClusteringChartProps {
  customers: Customer[];
  clusterResult: ClusterResult;
  colors: string[];
}

const ClusteringChart: React.FC<ClusteringChartProps> = ({ customers, clusterResult, colors }) => {
  const scatterData = customers.map((customer, index) => ({
    x: customer.annualIncome,
    y: customer.spendingScore,
    cluster: clusterResult.assignments[index],
    customerID: customer.customerID,
    age: customer.age,
    gender: customer.gender
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">Customer #{data.customerID}</p>
          <p className="text-sm text-gray-600">Age: {data.age}</p>
          <p className="text-sm text-gray-600">Gender: {data.gender}</p>
          <p className="text-sm text-gray-600">Income: ${data.x}k</p>
          <p className="text-sm text-gray-600">Spending Score: {data.y}</p>
          <p className="text-sm font-medium" style={{ color: colors[data.cluster] }}>
            Cluster {data.cluster + 1}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Annual Income" 
            unit="k$"
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Spending Score" 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Customer data points */}
          <Scatter data={scatterData} fill="#8884d8">
            {scatterData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[entry.cluster]} />
            ))}
          </Scatter>
          
          {/* Centroids */}
          <Scatter 
            data={clusterResult.centroids.map((centroid, index) => ({
              x: centroid.annualIncome,
              y: centroid.spendingScore,
              cluster: index
            }))}
            fill="none"
            shape="cross"
          >
            {clusterResult.centroids.map((_, index) => (
              <Cell 
                key={`centroid-${index}`} 
                fill={colors[index]}
                stroke={colors[index]}
                strokeWidth={3}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Customer Data Points</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-purple-500 bg-white"></div>
          <span>Cluster Centroids</span>
        </div>
      </div>
    </div>
  );
};

export default ClusteringChart;
