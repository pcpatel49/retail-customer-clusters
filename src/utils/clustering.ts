export interface Customer {
  customerID: number;
  gender: string;
  age: number;
  annualIncome: number;
  spendingScore: number;
}

export interface Centroid {
  annualIncome: number;
  spendingScore: number;
}

export interface ClusterResult {
  centroids: Centroid[];
  assignments: number[];
  iterations: number;
  wcss: number; // Within-cluster sum of squares
}

// Generate Mall Customers dataset similar to Kaggle's version
export const generateMallCustomersData = (numCustomers: number = 200): Customer[] => {
  const customers: Customer[] = [];
  const genders = ['Male', 'Female'];
  
  for (let i = 1; i <= numCustomers; i++) {
    // Create realistic customer segments
    const segment = Math.random();
    let income: number, spending: number, age: number;
    
    if (segment < 0.2) {
      // High income, high spending (luxury customers)
      income = 70 + Math.random() * 50;
      spending = 70 + Math.random() * 30;
      age = 25 + Math.random() * 35;
    } else if (segment < 0.4) {
      // High income, low spending (conservative customers)
      income = 70 + Math.random() * 50;
      spending = 10 + Math.random() * 30;
      age = 35 + Math.random() * 30;
    } else if (segment < 0.6) {
      // Low income, high spending (ambitious customers)
      income = 15 + Math.random() * 35;
      spending = 70 + Math.random() * 30;
      age = 18 + Math.random() * 25;
    } else if (segment < 0.8) {
      // Low income, low spending (budget customers)
      income = 15 + Math.random() * 35;
      spending = 10 + Math.random() * 30;
      age = 25 + Math.random() * 40;
    } else {
      // Middle income, middle spending (average customers)
      income = 40 + Math.random() * 40;
      spending = 40 + Math.random() * 40;
      age = 25 + Math.random() * 35;
    }
    
    customers.push({
      customerID: i,
      gender: genders[Math.floor(Math.random() * genders.length)],
      age: Math.round(age),
      annualIncome: Math.round(income),
      spendingScore: Math.round(spending)
    });
  }
  
  return customers;
};

// Calculate Euclidean distance between two points
const calculateDistance = (point1: Centroid, point2: Centroid): number => {
  const dx = point1.annualIncome - point2.annualIncome;
  const dy = point1.spendingScore - point2.spendingScore;
  return Math.sqrt(dx * dx + dy * dy);
};

// Initialize centroids using k-means++ algorithm for better initialization
const initializeCentroids = (customers: Customer[], k: number): Centroid[] => {
  const centroids: Centroid[] = [];
  
  // Choose first centroid randomly
  const firstCustomer = customers[Math.floor(Math.random() * customers.length)];
  centroids.push({
    annualIncome: firstCustomer.annualIncome,
    spendingScore: firstCustomer.spendingScore
  });
  
  // Choose remaining centroids using k-means++ method
  for (let i = 1; i < k; i++) {
    const distances: number[] = [];
    let totalDistance = 0;
    
    // Calculate squared distances to nearest centroid for each customer
    customers.forEach(customer => {
      const customerPoint = { annualIncome: customer.annualIncome, spendingScore: customer.spendingScore };
      let minDistance = Infinity;
      
      centroids.forEach(centroid => {
        const distance = calculateDistance(customerPoint, centroid);
        minDistance = Math.min(minDistance, distance);
      });
      
      const squaredDistance = minDistance * minDistance;
      distances.push(squaredDistance);
      totalDistance += squaredDistance;
    });
    
    // Choose next centroid with probability proportional to squared distance
    const randomValue = Math.random() * totalDistance;
    let cumulativeDistance = 0;
    
    for (let j = 0; j < customers.length; j++) {
      cumulativeDistance += distances[j];
      if (cumulativeDistance >= randomValue) {
        centroids.push({
          annualIncome: customers[j].annualIncome,
          spendingScore: customers[j].spendingScore
        });
        break;
      }
    }
  }
  
  return centroids;
};

// Assign each customer to the nearest centroid
const assignToCluster = (customers: Customer[], centroids: Centroid[]): number[] => {
  return customers.map(customer => {
    const customerPoint = { annualIncome: customer.annualIncome, spendingScore: customer.spendingScore };
    let minDistance = Infinity;
    let clusterIndex = 0;
    
    centroids.forEach((centroid, index) => {
      const distance = calculateDistance(customerPoint, centroid);
      if (distance < minDistance) {
        minDistance = distance;
        clusterIndex = index;
      }
    });
    
    return clusterIndex;
  });
};

// Update centroids to the mean of assigned customers
const updateCentroids = (customers: Customer[], assignments: number[], k: number): Centroid[] => {
  const newCentroids: Centroid[] = [];
  
  for (let i = 0; i < k; i++) {
    const clusterCustomers = customers.filter((_, index) => assignments[index] === i);
    
    if (clusterCustomers.length === 0) {
      // If cluster is empty, keep the old centroid or reinitialize
      newCentroids.push({
        annualIncome: Math.random() * 100,
        spendingScore: Math.random() * 100
      });
    } else {
      const avgIncome = clusterCustomers.reduce((sum, c) => sum + c.annualIncome, 0) / clusterCustomers.length;
      const avgSpending = clusterCustomers.reduce((sum, c) => sum + c.spendingScore, 0) / clusterCustomers.length;
      
      newCentroids.push({
        annualIncome: avgIncome,
        spendingScore: avgSpending
      });
    }
  }
  
  return newCentroids;
};

// Check if centroids have converged
const hasConverged = (oldCentroids: Centroid[], newCentroids: Centroid[], tolerance: number = 0.1): boolean => {
  for (let i = 0; i < oldCentroids.length; i++) {
    const distance = calculateDistance(oldCentroids[i], newCentroids[i]);
    if (distance > tolerance) {
      return false;
    }
  }
  return true;
};

// Calculate Within-Cluster Sum of Squares (WCSS)
const calculateWCSS = (customers: Customer[], centroids: Centroid[], assignments: number[]): number => {
  let wcss = 0;
  
  customers.forEach((customer, index) => {
    const customerPoint = { annualIncome: customer.annualIncome, spendingScore: customer.spendingScore };
    const centroid = centroids[assignments[index]];
    const distance = calculateDistance(customerPoint, centroid);
    wcss += distance * distance;
  });
  
  return wcss;
};

// Main K-means clustering algorithm
export const performKMeans = (customers: Customer[], k: number, maxIterations: number = 100): ClusterResult => {
  console.log(`Starting K-means clustering with k=${k} and ${customers.length} customers`);
  
  // Initialize centroids using k-means++
  let centroids = initializeCentroids(customers, k);
  let assignments: number[] = [];
  let iterations = 0;
  
  while (iterations < maxIterations) {
    iterations++;
    
    // Assign customers to nearest centroid
    const newAssignments = assignToCluster(customers, centroids);
    
    // Update centroids
    const newCentroids = updateCentroids(customers, newAssignments, k);
    
    // Check for convergence
    if (hasConverged(centroids, newCentroids)) {
      console.log(`K-means converged after ${iterations} iterations`);
      assignments = newAssignments;
      centroids = newCentroids;
      break;
    }
    
    assignments = newAssignments;
    centroids = newCentroids;
  }
  
  const wcss = calculateWCSS(customers, centroids, assignments);
  
  console.log(`Final WCSS: ${wcss.toFixed(2)}`);
  
  return {
    centroids,
    assignments,
    iterations,
    wcss
  };
};

// Calculate optimal number of clusters using elbow method
export const calculateElbowMethod = (customers: Customer[], maxK: number = 10): { k: number; wcss: number }[] => {
  const results: { k: number; wcss: number }[] = [];
  
  for (let k = 1; k <= maxK; k++) {
    const result = performKMeans(customers, k);
    results.push({ k, wcss: result.wcss });
  }
  
  return results;
};
