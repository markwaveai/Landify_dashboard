import React, { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";


// Fallback icon if BoxCubeIcon doesn't exist in index.ts (I saw box-cube.svg but need to check index.ts export if I use it)
// For safety, I'll use text or generic div if icon missing, but let's assume standard icons are available.
// Actually, I'll define a simple Icon wrapper if needed, but I'll try to stick to what's likely there.
// I see box-cube.svg in file list.

interface FodderMetrics {
    totalFodderAnnual: number;
    totalFodderAdjusted: number;
    dailyFodder: number;
    dailyActualConsumption: number;
    totalAcres: number;
    totalAgents: number;
    totalFarmers: number;
    dailyTrips: number;
    tractorsNeeded: number;
    bufferStock: number;
}

interface LocationStats {
    name: string;
    acres: number;
    agents: number;
    fodderPerDay: number;
    tripsPerDay: number;
}

const FodderProcurement: React.FC = () => {
    const [buffaloes, setBuffaloes] = useState<number>(6000);
    const [stressFactor, setStressFactor] = useState<number>(0); // 0% stress default
    const [fodderCostPerTon, setFodderCostPerTon] = useState<number>(2500); // ₹
    const [tripsPerTractor, setTripsPerTractor] = useState<number>(3); // Avg trips per day

    // Constants
    const FODDER_PER_BUFFALO_YEAR = 31.25;
    const BUFFER_PERCENT = 0.15;
    const YIELD_PER_ACRE_YEAR = 100; // tons
    const ACRES_PER_AGENT = 180; // Based on story: 2160 acres / 12 agents
    const ACRES_PER_FARMER = 2;
    const TONS_PER_TRIP = 10;
    const BUFFER_DAYS = 15;

    // Calculations
    const calculate = (): FodderMetrics & { locations: LocationStats[] } => {
        const totalFodderAnnual = buffaloes * FODDER_PER_BUFFALO_YEAR;
        const totalFodderAdjusted = totalFodderAnnual * (1 + BUFFER_PERCENT);

        // Stress test: Reduce yield or Increase requirement? 
        // Usually drought = less yield. So we need MORE acres to get same fodder.
        // If stress factor is e.g. 20% failure, yield becomes 80 tons/acre.
        const currentYield = YIELD_PER_ACRE_YEAR * (1 - stressFactor / 100);

        const totalAcres = totalFodderAdjusted / currentYield;
        const totalAgents = Math.ceil(totalAcres / ACRES_PER_AGENT);
        const totalFarmers = Math.ceil(totalAcres / ACRES_PER_FARMER);

        const dailyActualConsumption = totalFodderAnnual / 365;
        const dailyFodder = totalFodderAdjusted / 365;
        const dailyTrips = Math.ceil(dailyFodder / TONS_PER_TRIP);
        const tractorsNeeded = Math.ceil(dailyTrips / tripsPerTractor);
        const bufferStock = dailyFodder * BUFFER_DAYS;

        // Locations
        const locations: LocationStats[] = [
            { name: "Adoni", share: 0.4 },
            { name: "Veldurthi", share: 0.3 },
            { name: "Krishnagiri", share: 0.3 }
        ].map(loc => ({
            name: loc.name,
            acres: Math.round(totalAcres * loc.share),
            agents: Math.max(1, Math.round(totalAgents * loc.share)),
            fodderPerDay: Math.round(dailyFodder * loc.share),
            tripsPerDay: Math.round(dailyTrips * loc.share)
        }));

        return {
            totalFodderAnnual,
            totalFodderAdjusted,
            dailyFodder,
            dailyActualConsumption,
            totalAcres,
            totalAgents,
            totalFarmers,
            dailyTrips,
            tractorsNeeded,
            bufferStock,
            locations
        };
    };

    const metrics = calculate();

    // Charts
    const chartOptions: ApexOptions = {
        chart: { type: 'donut', fontFamily: 'Outfit, sans-serif' },
        labels: metrics.locations.map(l => l.name),
        colors: ['#3C50E0', '#80CAEE', '#0FADCF'],
        legend: { position: 'bottom' },
        dataLabels: { enabled: true },
        tooltip: { y: { formatter: (val) => `${val} Acres` } }
    };

    const chartSeries = metrics.locations.map(l => l.acres);

    // Harvest Calendar (Static Logic based on Story/Assumption)
    const harvestCalendar = [
        { month: "Jan", status: "High Harvest", crop: "Maize/Napier" },
        { month: "Feb", status: "Medium", crop: "Napier" },
        { month: "Mar", status: "Low (Lean)", crop: "Silage Usage" },
        { month: "Apr", status: "Low (Lean)", crop: "Silage Usage" },
        { month: "May", status: "Preparation", crop: "Sowing" },
        { month: "Jun", status: "Early Harvest", crop: "Sorghum" },
        { month: "Jul", status: "High Harvest", crop: "Maize" },
        { month: "Aug", status: "Peak", crop: "All Crops" },
        { month: "Sep", status: "Peak", crop: "All Crops" },
        { month: "Oct", status: "Medium", crop: "Napier" },
        { month: "Nov", status: "Medium", crop: "Napier" },
        { month: "Dec", status: "High Harvest", crop: "Maize" },
    ];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] mt-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Kurnool Fodder Operations Story</h3>
                    <p className="text-sm text-gray-500">Operational Planning & Procurement Dashboard</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <label className="text-xs font-medium text-gray-500 mb-1">Buffaloes Count</label>
                        <input
                            type="number"
                            value={buffaloes}
                            onChange={(e) => setBuffaloes(Math.max(0, parseInt(e.target.value) || 0))}
                            className="px-3 py-2 border rounded-lg w-32 text-right dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>

                    <div className="flex flex-col items-end">
                        <label className="text-xs font-medium text-gray-500 mb-1">Drought Stress (%)</label>
                        <input
                            type="range"
                            min="0" max="50"
                            value={stressFactor}
                            onChange={(e) => setStressFactor(parseInt(e.target.value))}
                            className="w-32"
                        />
                        <span className="text-xs text-red-500 font-bold">{stressFactor}% Yield Loss</span>
                    </div>
                </div>
            </div>

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-blue-50 bg-opacity-50 rounded-xl dark:bg-white/5 border border-blue-100 dark:border-white/10">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Annual Requirement</p>
                    <h4 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metrics.totalFodderAdjusted.toLocaleString()} <span className="text-sm text-gray-400">Tons</span></h4>
                    <p className="text-xs text-gray-400 mt-1">Includes 15% Buffer</p>
                </div>
                <div className="p-4 bg-green-50 bg-opacity-50 rounded-xl dark:bg-white/5 border border-green-100 dark:border-white/10">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Land Required</p>
                    <h4 className="text-2xl font-bold text-green-600 dark:text-green-400">{Math.round(metrics.totalAcres).toLocaleString()} <span className="text-sm text-gray-400">Acres</span></h4>
                    <p className="text-xs text-gray-400 mt-1">@ {Math.round(YIELD_PER_ACRE_YEAR * (1 - stressFactor / 100))} Tons/Acre</p>
                </div>
                <div className="p-4 bg-purple-50 bg-opacity-50 rounded-xl dark:bg-white/5 border border-purple-100 dark:border-white/10">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Network Strength</p>
                    <div className="flex gap-4 mt-1">
                        <div>
                            <h4 className="text-xl font-bold text-purple-600 dark:text-purple-400">{metrics.totalAgents}</h4>
                            <p className="text-[10px] text-gray-400">Agents</p>
                        </div>
                        <div className="w-px bg-gray-300 dark:bg-gray-700"></div>
                        <div>
                            <h4 className="text-xl font-bold text-purple-600 dark:text-purple-400">{metrics.totalFarmers}</h4>
                            <p className="text-[10px] text-gray-400">Farmers</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-orange-50 bg-opacity-50 rounded-xl dark:bg-white/5 border border-orange-100 dark:border-white/10 col-span-1 md:col-span-2 lg:col-span-1">
                    <p className="text-xs text-gray-500 uppercase font-semibold">Daily Operations</p>
                    <div className="space-y-3 mt-2">
                        <div className="flex justify-between items-end">
                            <div>
                                <h4 className="text-xl font-bold text-orange-600 dark:text-orange-400">{Math.round(metrics.dailyActualConsumption)} T</h4>
                                <p className="text-[10px] text-gray-400">Farm Intake (Req)</p>
                            </div>
                            <div className="text-right">
                                <h4 className="text-xl font-bold text-orange-600 dark:text-orange-400">~{Math.round(metrics.dailyFodder)} T</h4>
                                <p className="text-[10px] text-gray-400">Procurement Target</p>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-orange-200 dark:border-white/10 flex justify-between items-center">
                            <div>
                                <h4 className="text-lg font-bold text-gray-700 dark:text-white">{metrics.tractorsNeeded} <span className="text-xs font-normal text-gray-500">Tractors</span></h4>
                                <p className="text-[10px] text-gray-400">@ {metrics.dailyTrips} Trips/Day</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <label className="text-[10px] text-gray-400">Trips/Tractor</label>
                                <input
                                    type="number"
                                    className="w-12 h-6 text-xs border rounded text-center dark:bg-gray-800 dark:border-gray-700"
                                    value={tripsPerTractor}
                                    onChange={(e) => setTripsPerTractor(Math.max(1, parseInt(e.target.value) || 1))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Location Distribution */}
                <div className="col-span-1 lg:col-span-1 border border-gray-100 rounded-xl p-4 dark:border-gray-800">
                    <h4 className="font-semibold text-gray-700 dark:text-white mb-4">Sourcing Hubs</h4>
                    <div className="flex justify-center">
                        <Chart options={chartOptions} series={chartSeries} type="donut" height={250} />
                    </div>
                    <div className="space-y-3 mt-4">
                        {metrics.locations.map(loc => (
                            <div key={loc.name} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-600 dark:text-gray-300">{loc.name}</span>
                                <div className="flex gap-3 text-gray-500">
                                    <span className="text-xs bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded">{loc.agents} Agents</span>
                                    <span className="font-bold">{loc.acres} Ac</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Model & Incentives */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="border border-gray-100 rounded-xl p-5 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-700 dark:text-white">Financial Projections</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Cost/Ton (₹):</span>
                                <input
                                    type="number" className="w-20 border rounded px-1 py-0.5 text-xs text-right"
                                    value={fodderCostPerTon}
                                    onChange={(e) => setFodderCostPerTon(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                                <p className="text-xs text-gray-500">Annual Procurement Cost</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">₹ {((metrics.totalFodderAdjusted * fodderCostPerTon) / 10000000).toFixed(2)} Cr</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                                <p className="text-xs text-gray-500">Est. Agent Commisson</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">₹ {((metrics.totalFodderAdjusted * 50) / 100000).toFixed(2)} L</p>
                                <p className="text-[10px] text-gray-400">@ ₹50/ton incentive</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg dark:bg-gray-800">
                                <p className="text-xs text-gray-500">Logistics Cost (Approx)</p>
                                <p className="text-lg font-bold text-gray-800 dark:text-white">₹ {((metrics.dailyTrips * 365 * 1500) / 10000000).toFixed(2)} Cr</p>
                                <p className="text-[10px] text-gray-400">@ ₹1500/trip</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <h5 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Agent Incentive Structure</h5>
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>• <strong className="text-gray-700 dark:text-gray-300">Base Pay:</strong> ₹15,000 / month (monitoring & coordination)</p>
                                <p>• <strong className="text-gray-700 dark:text-gray-300">Variable:</strong> ₹50 / ton procured (Performance linked)</p>
                                <p>• <strong className="text-gray-700 dark:text-gray-300">Bonus:</strong> Quarterly bonus for 0% stockout & quality compliance.</p>
                            </div>
                        </div>
                    </div>

                    {/* Harvest Calendar */}
                    <div className="border border-gray-100 rounded-xl p-5 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-700 dark:text-white mb-3">Harvest Calendar</h4>
                        <div className="grid grid-cols-6 gap-2">
                            {harvestCalendar.map((m) => (
                                <div key={m.month} className={`text-center p-2 rounded-lg text-xs ${m.status.includes("High") || m.status.includes("Peak") ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    m.status.includes("Low") ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                    <div className="font-bold">{m.month}</div>
                                    <div className="text-[10px] truncate">{m.crop}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Operational Hierarchy */}
            <div className="mt-6 border border-gray-100 rounded-xl p-5 dark:border-gray-800">
                <h4 className="font-semibold text-gray-700 dark:text-white mb-4">Operational Support Structure</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-xs text-gray-400 uppercase">Leadership</p>
                        <p className="font-bold text-gray-700 dark:text-gray-200">Sub-Branch Head</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-xs text-gray-400 uppercase">Logistics</p>
                        <p className="font-bold text-gray-700 dark:text-gray-200">Logistics Coordinator</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-xs text-gray-400 uppercase">Quality</p>
                        <p className="font-bold text-gray-700 dark:text-gray-200">Quality Supervisor</p>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <p className="text-xs text-gray-400 uppercase">Finance</p>
                        <p className="font-bold text-gray-700 dark:text-gray-200">Accounts Coordinator</p>
                    </div>
                </div>
            </div>

            {/* Field Force Directory */}
            <div className="mt-6 border border-gray-100 rounded-xl p-5 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-700 dark:text-white">Field Force Directory</h4>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded dark:bg-blue-900/30 dark:text-blue-400">Total Agents: {metrics.totalAgents}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700 text-xs text-gray-400 uppercase">
                                <th className="p-3">Agent Name</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Location</th>
                                <th className="p-3 text-right">Target (Acres)</th>
                                <th className="p-3 text-right">Farmers</th>
                                <th className="p-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {metrics.locations.map((loc) => (
                                Array.from({ length: loc.agents }).map((_, i) => (
                                    <tr key={`${loc.name}-${i}`} className="border-b border-gray-50 last:border-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-medium text-gray-700 dark:text-white">
                                            {loc.name} Agent {i + 1}
                                        </td>
                                        <td className="p-3 text-gray-500">Field Agent</td>
                                        <td className="p-3 text-gray-500">{loc.name}</td>
                                        <td className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                                            {Math.round(loc.acres / loc.agents)} Ac
                                        </td>
                                        <td className="p-3 text-right text-gray-500">
                                            {Math.round((loc.acres / loc.agents) / ACRES_PER_FARMER)}
                                        </td>
                                        <td className="p-3 text-right">
                                            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                                        </td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FodderProcurement;
