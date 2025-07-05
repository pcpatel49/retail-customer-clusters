
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Customer, ClusterResult } from '@/utils/clustering';

interface CustomerStatsProps {
  customers: Customer[];
  clusterResult: ClusterResult | null;
  colors: string[];
}

const CustomerStats: React.FC<CustomerStatsProps> = ({ customers, clusterResult, colors }) => {
  if (!clusterResult) {
    return (
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const clusterStats = clusterResult.centroids.map((centroid, index) => {
    const clusterCustomers = customers.filter((_, i) => clusterResult.assignments[i] === index);
    const avgAge = clusterCustomers.reduce((sum, c) => sum + c.age, 0) / clusterCustomers.length;
    const genderDistribution = clusterCustomers.reduce((acc, c) => {
      acc[c.gender] = (acc[c.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      index,
      count: clusterCustomers.length,
      percentage: (clusterCustomers.length / customers.length) * 100,
      avgIncome: Math.round(centroid.annualIncome),
      avgSpending: Math.round(centroid.spendingScore),
      avgAge: Math.round(avgAge),
      maleCount: genderDistribution['Male'] || 0,
      femaleCount: genderDistribution['Female'] || 0,
    };
  });

  const getClusterLabel = (stats: typeof clusterStats[0]) => {
    if (stats.avgIncome > 70 && stats.avgSpending > 70) return 'High Value';
    if (stats.avgIncome > 70 && stats.avgSpending < 40) return 'Conservative';
    if (stats.avgIncome < 40 && stats.avgSpending > 70) return 'Ambitious';
    if (stats.avgIncome < 40 && stats.avgSpending < 40) return 'Budget Conscious';
    return 'Moderate';
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
            Dataset Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Customers</span>
              <span className="font-semibold">{customers.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Clusters</span>
              <span className="font-semibold">{clusterResult.centroids.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Iterations</span>
              <span className="font-semibold">{clusterResult.iterations}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {clusterStats.map((stats) => (
        <Card key={stats.index} className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: colors[stats.index] }}
                ></div>
                Cluster {stats.index + 1}
              </div>
              <Badge variant="secondary" className="text-xs">
                {getClusterLabel(stats)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Size</span>
                  <span className="text-sm font-medium">{stats.count} customers</span>
                </div>
                <Progress 
                  value={stats.percentage} 
                  className="h-2"
                  style={{
                    backgroundColor: `${colors[stats.index]}20`,
                  }}
                />
                <span className="text-xs text-gray-500">{stats.percentage.toFixed(1)}% of total</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Avg Income</span>
                  <p className="font-semibold">${stats.avgIncome}k</p>
                </div>
                <div>
                  <span className="text-gray-600">Avg Spending</span>
                  <p className="font-semibold">{stats.avgSpending}/100</p>
                </div>
                <div>
                  <span className="text-gray-600">Avg Age</span>
                  <p className="font-semibold">{stats.avgAge} years</p>
                </div>
                <div>
                  <span className="text-gray-600">Gender Split</span>
                  <p className="font-semibold text-xs">
                    {stats.maleCount}M / {stats.femaleCount}F
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CustomerStats;
