
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ClusteringChart from '@/components/ClusteringChart';
import CustomerStats from '@/components/CustomerStats';
import { generateMallCustomersData, performKMeans, Customer, ClusterResult } from '@/utils/clustering';

const Index = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clusterResult, setClusterResult] = useState<ClusterResult | null>(null);
  const [numClusters, setNumClusters] = useState([3]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Generate sample Mall Customers data
    const data = generateMallCustomersData(200);
    setCustomers(data);
    
    // Perform initial clustering
    const result = performKMeans(data, 3);
    setClusterResult(result);
  }, []);

  const handleClusteringUpdate = async () => {
    if (customers.length === 0) return;
    
    setIsLoading(true);
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = performKMeans(customers, numClusters[0]);
    setClusterResult(result);
    setIsLoading(false);
  };

  useEffect(() => {
    if (customers.length > 0) {
      handleClusteringUpdate();
    }
  }, [numClusters]);

  const clusterColors = [
    '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Customer Segmentation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover customer patterns using K-means clustering analysis on retail purchase data
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-8 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
              Clustering Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Number of Clusters: {numClusters[0]}
                </label>
                <Slider
                  value={numClusters}
                  onValueChange={setNumClusters}
                  max={6}
                  min={2}
                  step={1}
                  className="w-full"
                />
              </div>
              <Button 
                onClick={handleClusteringUpdate}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? 'Analyzing...' : 'Update Clusters'}
              </Button>
            </div>
            
            {clusterResult && (
              <div className="mt-4 flex flex-wrap gap-2">
                {clusterResult.centroids.map((_, index) => (
                  <Badge 
                    key={index} 
                    style={{ backgroundColor: clusterColors[index] }}
                    className="text-white"
                  >
                    Cluster {index + 1}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  Customer Clusters Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clusterResult ? (
                  <ClusteringChart 
                    customers={customers}
                    clusterResult={clusterResult}
                    colors={clusterColors}
                  />
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div>
            <CustomerStats 
              customers={customers}
              clusterResult={clusterResult}
              colors={clusterColors}
            />
          </div>
        </div>

        {/* Algorithm Info */}
        <Card className="mt-8 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
              About K-means Clustering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">How it works:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Groups customers based on Annual Income and Spending Score</li>
                  <li>• Uses iterative algorithm to find optimal cluster centers</li>
                  <li>• Minimizes within-cluster sum of squares</li>
                  <li>• Converges when centroids stabilize</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Business Applications:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Targeted marketing campaigns</li>
                  <li>• Product recommendation systems</li>
                  <li>• Customer retention strategies</li>
                  <li>• Personalized pricing models</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
