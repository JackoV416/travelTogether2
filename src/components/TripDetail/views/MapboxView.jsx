import React from 'react';
import { Map } from 'lucide-react';

const MapboxView = ({ items }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
            <Map className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold mb-2">Mapbox 3D View</h3>
            <p>Coming Soon in V1.2.6</p>
        </div>
    );
};

export default MapboxView;
