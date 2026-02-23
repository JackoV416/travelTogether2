import React from 'react';
import { useTour } from '../../contexts/TourContext';
import Dashboard from './Dashboard';

/**
 * Wrapper component to access TourContext inside TourProvider
 * and pass isMockMode to Dashboard as prop
 */
const DashboardWithTour = (props) => {
    const { isMockMode } = useTour();
    return <Dashboard {...props} isMockMode={isMockMode} />;
};

export default DashboardWithTour;
