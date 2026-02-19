import React, { useState } from 'react';
import {
    PlantIcon,
    TimeIcon,
    PlusIcon,
    HorizontaLDots,
    ListIcon,
    GridIcon
} from '../../icons';

// Mock Data
const batches = [
    {
        id: 'A-204',
        plotName: 'Plot #A-204',
        crop: 'Bermuda Grass',
        size: '2.4 Ha',
        stage: 'Vegetative',
        progress: 75,
        agent: { name: 'David Chen', avatar: 'https://i.pravatar.cc/150?u=David' },
        status: 'Cultivation Started',
        statusType: 'success', // green
        action: 'menu',
        customIcon: 'plant'
    },
    {
        id: 'C-112',
        plotName: 'Plot #C-112',
        crop: 'Kentucky Blue',
        size: '1.8 Ha',
        stage: 'Inspection Required',
        progress: 0, // Not shown as progress bar but alert
        agent: null,
        status: 'Pending Review',
        statusType: 'warning', // yellow
        action: 'button',
        alert: true
    },
    {
        id: 'B-089',
        plotName: 'Plot #B-089',
        crop: 'Zoysia',
        size: '4.1 Ha',
        stage: 'Mature',
        progress: 100,
        agent: { name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?u=Sarah' },
        status: 'Ready for Harvest',
        statusType: 'info', // blue
        action: 'menu'
    },
];

const CultivationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Cultivation Overview');
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const filteredBatches = batches.filter(batch =>
        batch.plotName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.crop.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-6 font-outfit text-gray-800 dark:text-white">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cultivation & Harvesting Status</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time lifecycle monitoring and machine allocation dashboard.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                            placeholder="Search plots or crops..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors">
                            <ListIcon className="w-4 h-4" /> Filters
                        </button>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
                            <PlusIcon className="w-4 h-4 text-white" /> New Batch
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Active Cultivation */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[140px]">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-xl bg-green-50 text-green-600">
                            <PlantIcon className="w-6 h-6" />
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">+12%</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Cultivation</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">1,240.5</h3>
                            <span className="text-lg text-gray-500 font-medium">Ha</span>
                        </div>
                    </div>
                </div>

                {/* Pending Harvest */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between min-h-[140px]">
                    <div className="flex justify-between items-start">
                        <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600">
                            <TimeIcon className="w-6 h-6" />
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Urgent</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Pending Harvest</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">18</h3>
                            <span className="text-lg text-gray-500 font-medium">Plots</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-800 px-6">
                    {['Cultivation Overview', 'Harvesting & Logistics', 'Agent Updates'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                                ? 'border-green-600 text-green-700'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                    <div className="col-span-3">Plot Details</div>
                    <div className="col-span-3">Cultivation Stage</div>
                    <div className="col-span-2">Agent</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredBatches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((batch) => (
                        <div
                            key={batch.id}
                            className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${batch.alert ? 'border-l-4 border-l-yellow-400 bg-yellow-50/10' : 'border-l-4 border-l-transparent'}`}
                        >

                            {/* Plot Details */}
                            <div className="col-span-3 flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${batch.alert ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                                    {batch.alert ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : batch.status === 'Ready for Harvest' ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    ) : (
                                        <GridIcon className="w-5 h-5" />
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{batch.plotName}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">{batch.crop} • {batch.size}</p>
                                </div>
                            </div>

                            {/* Cultivation Stage */}
                            <div className="col-span-3">
                                {batch.alert ? (
                                    <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                                        <span className="w-2 h-2 rounded-full bg-gray-300"></span> Inspection Required
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold uppercase text-green-700">
                                            <span>{batch.stage}</span>
                                            <span>{batch.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                            <div
                                                className="bg-green-600 h-1.5 rounded-full"
                                                style={{ width: `${batch.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Agent */}
                            <div className="col-span-2">
                                {batch.agent ? (
                                    <div className="flex items-center gap-2">
                                        <img src={batch.agent.avatar} alt={batch.agent.name} className="w-6 h-6 rounded-full object-cover" />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{batch.agent.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                                )}
                            </div>

                            {/* Status */}
                            <div className="col-span-2">
                                <span className={`inline-flex px-3 py-1 rounded-md text-xs font-bold border ${/**/
                                    batch.statusType === 'success' ? 'bg-green-50 text-green-700 border-green-100' :
                                        batch.statusType === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                            'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                    {batch.status}
                                </span>
                            </div>

                            {/* Action */}
                            <div className="col-span-2 text-right">
                                {batch.action === 'button' ? (
                                    <button className="px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold rounded uppercase tracking-wide transition-colors">
                                        Assign Now
                                    </button>
                                ) : (
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <HorizontaLDots className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        Showing <span className="font-bold text-gray-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredBatches.length)}</span> of <span className="font-bold text-gray-900 dark:text-white">{filteredBatches.length}</span> active batches
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`p-1 rounded border border-gray-200 w-8 h-8 flex items-center justify-center transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <span className="text-lg">‹</span>
                        </button>
                        {(() => {
                            const pages = [];
                            const total = Math.ceil(filteredBatches.length / itemsPerPage);
                            if (total <= 7) {
                                for (let i = 1; i <= total; i++) pages.push(i);
                            } else {
                                pages.push(1);
                                if (currentPage > 3) pages.push("...");
                                const start = Math.max(2, currentPage - 1);
                                const end = Math.min(total - 1, currentPage + 1);
                                for (let i = start; i <= end; i++) {
                                    if (!pages.includes(i)) pages.push(i);
                                }
                                if (currentPage < total - 2) pages.push("...");
                                pages.push(total);
                            }
                            return pages.map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                    disabled={typeof page !== 'number'}
                                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold border transition-all ${currentPage === page
                                        ? 'bg-green-600 text-white border-green-600'
                                        : typeof page === 'number'
                                            ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 hover:bg-gray-100'
                                            : 'bg-transparent text-gray-400 border-transparent cursor-default'
                                        }`}
                                >
                                    {page}
                                </button>
                            ));
                        })()}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredBatches.length / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(filteredBatches.length / itemsPerPage)}
                            className={`p-1 rounded border border-gray-200 w-8 h-8 flex items-center justify-center transition-colors ${currentPage === Math.ceil(filteredBatches.length / itemsPerPage) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                        >
                            <span className="text-lg">›</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="relative rounded-2xl overflow-hidden min-h-[250px] bg-gray-200 border border-gray-300 flex items-center justify-center group">
                {/* Background Image Placeholder */}
                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-122.4194,37.7749,10,0/800x400@2x?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xsIn0.1')] bg-cover bg-center opacity-40 grayscale"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent dark:from-gray-900/90 pointer-events-none"></div>

                <div className="absolute left-6 top-6 z-10 max-w-md">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Regional Network View</h3>
                    <p className="text-sm text-gray-600 mt-1">Monitoring 12 sites across the Central Valley district.</p>

                    <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200">
                        <GridIcon className="w-4 h-4" /> Open Interactive Map
                    </button>
                </div>

                {/* Map Decorative Elements */}
                <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2 opacity-30">
                    <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 75 Q 50 10 90 75 T 180 75" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
                        <circle cx="10" cy="75" r="4" fill="#64748b" />
                        <circle cx="180" cy="75" r="4" fill="#64748b" />
                    </svg>
                </div>
            </div>

        </div>
    );
};

export default CultivationPage;
