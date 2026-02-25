import React, { useState, useEffect, useMemo, useRef } from "react";

// --- MiniCalendar Component ---
interface MiniCalendarProps {
    selectedDate: string;
    onSelect: (date: string) => void;
    onClose: () => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onSelect, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date(selectedDate || new Date()));

    // Helpers
    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleDayClick = (day: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const offsetDate = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000));
        onSelect(offsetDate.toISOString().split("T")[0]);
        onClose();
    };

    const renderDays = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for start padding
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
        }

        // Day cells
        for (let d = 1; d <= totalDays; d++) {
            const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
            const localDateStr = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split("T")[0];

            const isSelected = localDateStr === selectedDate;
            const isToday = localDateStr === new Date().toISOString().split("T")[0];

            days.push(
                <button
                    key={d}
                    onClick={() => handleDayClick(d)}
                    className={`h-8 w-8 rounded-full text-xs font-medium transition-colors hover:bg-green-100 dark:hover:bg-green-900/30
            ${isSelected ? "bg-green-500 text-white hover:bg-green-600" : "text-gray-700 dark:text-gray-300"}
            ${!isSelected && isToday ? "border border-green-500 text-green-600" : ""}
          `}
                >
                    {d}
                </button>
            );
        }
        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="absolute right-0 bottom-full mb-2 z-[9999] w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
                <button onClick={prevMonth} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm font-bold text-gray-800 dark:text-white">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button onClick={nextMonth} className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            <div className="mb-2 grid grid-cols-7 text-center">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                    <span key={d} className="text-[10px] font-bold text-gray-400 uppercase">{d}</span>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center">
                {renderDays()}
            </div>
        </div>
    );
};

// --- Interfaces ---
interface HarvestScheduleItem {
    date: string;
    farmerName: string;
    acres: number;
    onboardingDate?: string;
}

interface FodderRequest {
    id: string;
    buffaloes: number;
    startDate: string;
    farm: string;
    createdAt: number;
}

interface ProcurementDetailsProps {
    requestId: string;
    onBack: () => void;
}

const ProcurementDetails: React.FC<ProcurementDetailsProps> = ({ requestId, onBack }) => {
    const [request, setRequest] = useState<FodderRequest | null>(null);
    const [harvestDate, setHarvestDate] = useState<string>(() => {
        return localStorage.getItem("harvestDate") || new Date().toISOString().split("T")[0];
    });

    useEffect(() => {
        localStorage.setItem("harvestDate", harvestDate);
    }, [harvestDate]);
    const [showHarvestCalendar, setShowHarvestCalendar] = useState(false);
    const harvestCalendarRef = useRef<HTMLDivElement>(null);

    // Close calendar logic
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (harvestCalendarRef.current && !harvestCalendarRef.current.contains(event.target as Node)) {
                setShowHarvestCalendar(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('fodderRequests');
        if (stored && requestId) {
            try {
                const requests: FodderRequest[] = JSON.parse(stored);
                const found = requests.find(r => r.id === requestId);
                if (found) {
                    setRequest(found);
                }
            } catch (e) {
                console.error("Failed to load requests", e);
            }
        }
    }, [requestId]);

    // --- Helpers ---
    const addDays = (dateStr: string, days: number): string => {
        const date = new Date(dateStr);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    };

    // --- Constants ---
    const CONSTANTS = {
        CONSUMPTION_PER_BUFFALO_KG: 87,
        DAYS_IN_CYCLE: 45,
        YIELD_PER_ACRE_CYCLE: 31.25,
        ACRES_PER_AGENT: 200,
        ACRES_PER_FARMER_CALC: 2,
        // Rule: Farmer needs at least this many acres to be worth visiting/harvesting
        MIN_FARMER_ACRES: 2.0,
        STANDARD_BLOCK_ACRES: 2.5
    };

    const metrics = useMemo(() => {
        if (!request) return null;

        const { buffaloes } = request;

        const totalDailyKg = buffaloes * CONSTANTS.CONSUMPTION_PER_BUFFALO_KG;
        const dailyReqTons = totalDailyKg / 1000;

        const weeklyReqTons = dailyReqTons * 7;
        const monthlyReqTons = dailyReqTons * 30;
        const cycleReqTons = dailyReqTons * CONSTANTS.DAYS_IN_CYCLE;

        const landRequiredAcres = cycleReqTons / CONSTANTS.YIELD_PER_ACRE_CYCLE;

        const dailyHarvestAcres = landRequiredAcres / CONSTANTS.DAYS_IN_CYCLE;
        const weeklyHarvestAcres = dailyHarvestAcres * 7;
        const monthlyHarvestAcres = dailyHarvestAcres * 30;

        const agentsRequired = Math.ceil(landRequiredAcres / CONSTANTS.ACRES_PER_AGENT);
        const farmersRequired = Math.ceil(landRequiredAcres / CONSTANTS.ACRES_PER_FARMER_CALC);

        return {
            dailyReqTons,
            weeklyReqTons,
            monthlyReqTons,
            cycleReqTons,
            landRequiredAcres,
            agentsRequired,
            farmersRequired,
            dailyHarvestAcres,
            weeklyHarvestAcres,
            monthlyHarvestAcres
        };
    }, [request]);

    // State for full agent details (counts) and the specific daily schedule
    const [agentStats, setAgentStats] = useState<{ id: string; name: string; totalFarmers: number; totalAcres: number; allFarmers: HarvestScheduleItem[]; dailyFarmers: HarvestScheduleItem[]; dailyAcres: number }[]>([]);
    const [expandedAgents, setExpandedAgents] = useState<string[]>([]);

    const toggleAgent = (agentId: string) => {
        setExpandedAgents(prev =>
            prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
        );
    };

    useEffect(() => {
        if (!metrics || !request) {
            setAgentStats([]);
            return;
        }
        calculateAgentData(metrics);
    }, [metrics, harvestDate]); // Re-run if metrics or date changes

    const calculateAgentData = (m: any) => {
        // 1. Define Agents
        const agentNames = ["Srinivas Rao", "Abdul Khan", "Rajender Singh"];
        const agents = agentNames.map((name, idx) => ({
            id: `agent-${idx}`,
            name,
            totalFarmers: 0,
            totalAcres: 0,
            allFarmers: [] as HarvestScheduleItem[],
            dailyFarmers: [] as HarvestScheduleItem[],
            dailyAcres: 0
        }));

        // 2. Constants & Variables
        const startDate = request!.startDate; // e.g., "2025-12-20"
        const dailyAcresNeeded = m.dailyHarvestAcres;
        const farmersPerDayFloat = dailyAcresNeeded / CONSTANTS.ACRES_PER_FARMER_CALC;

        // We need to onboard continuously for the duration of the cycle (45 days) to create a rotation
        const daysToOnboard = CONSTANTS.DAYS_IN_CYCLE;

        const farmerNamesSource = [
            "Ramesh", "Suresh", "Mahesh", "Naresh", "Ganesh", "Vijay", "Ajay", "Rajesh", "Dinesh", "Mohan", "Prakash", "Sunil"
        ];

        let globalFarmerIndex = 0;
        let farmersGeneratedCount = 0;
        const totalFarmersCap = m.farmersRequired;

        // 3. Generate Daily Batches
        for (let day = 0; day < daysToOnboard; day++) {
            if (farmersGeneratedCount >= totalFarmersCap) break;

            // Harvest starts immediately from startDate
            const currentHarvestDate = addDays(startDate, day);

            // Calculate how many farmers needed up to this day to meet the rate
            const expectedTotal = Math.ceil((day + 1) * farmersPerDayFloat);
            let dailyFarmersForLoop = expectedTotal - farmersGeneratedCount;

            // Safety cap for the day (don't exceed total cap)
            if (farmersGeneratedCount + dailyFarmersForLoop > totalFarmersCap) {
                dailyFarmersForLoop = totalFarmersCap - farmersGeneratedCount;
            }

            for (let f = 0; f < dailyFarmersForLoop; f++) {
                if (farmersGeneratedCount >= totalFarmersCap) break;

                const agentIndex = globalFarmerIndex % agents.length;
                const farmerName = `${farmerNamesSource[globalFarmerIndex % farmerNamesSource.length]} ${String.fromCharCode(65 + (globalFarmerIndex % 26))}.`;

                const onboardingDate = addDays(currentHarvestDate, -CONSTANTS.DAYS_IN_CYCLE);

                // Calculate acres for this farmer: use standard block size, 
                // but for the last farmer, use the remaining acres to match total requirement exactly.
                const isLastFarmer = farmersGeneratedCount === totalFarmersCap - 1;
                const farmerAcres = isLastFarmer
                    ? Number((m.landRequiredAcres - (farmersGeneratedCount * CONSTANTS.ACRES_PER_FARMER_CALC)).toFixed(2))
                    : CONSTANTS.ACRES_PER_FARMER_CALC;

                const farmer: HarvestScheduleItem = {
                    date: currentHarvestDate,
                    farmerName: farmerName,
                    acres: farmerAcres,
                    onboardingDate: onboardingDate,
                };

                // Add to Agent's Full Roster
                agents[agentIndex].totalFarmers++;
                agents[agentIndex].totalAcres += farmer.acres;
                agents[agentIndex].allFarmers.push(farmer);

                globalFarmerIndex++;
                farmersGeneratedCount++;
            }
        }

        // 4. Select Farmers for the *Selected Calendar Date*
        // We filter the Master Pool for farmers whose harvestDate matches selectedDate
        const selectedDate = harvestDate || new Date().toISOString().split('T')[0];

        agents.forEach(agent => {
            // Filter this agent's farmers who are scheduled for harvest today
            const todaysHarvest = agent.allFarmers.filter(f => f.date === selectedDate);

            agent.dailyFarmers = todaysHarvest;
            agent.dailyAcres = todaysHarvest.reduce((sum, f) => sum + f.acres, 0);
        });

        setAgentStats(agents);
        if (agents.length > 0 && expandedAgents.length === 0) {
            // Optional: auto expand first
        }
    };

    // Flatten logic for Harvest Schedule Table
    const flatHarvestSchedule = useMemo(() => {
        const flat: (HarvestScheduleItem & { assignedAgent: string })[] = [];
        agentStats.forEach(agent => {
            agent.dailyFarmers.forEach(farmer => {
                flat.push({
                    ...farmer,
                    assignedAgent: agent.name
                });
            });
        });
        return flat;
    }, [agentStats]);

    if (!request || !metrics) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-gray-500">Loading request details...</p>
            </div>
        );
    }

    // ... (UI Code will follow in next edit to show columns)

    return (
        <div className="space-y-6">
            <div>
                <button onClick={onBack} className="group mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-green-50 dark:bg-gray-800 dark:group-hover:bg-green-900/20">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </div>
                    <span>Back to Schedule</span>
                </button>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {request.farm || "Unknown Farm"}
                            </h2>
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700">
                                #{request.id.slice(0, 8)}
                            </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-blue-50 p-1.5 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </div>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{request.buffaloes.toLocaleString()}</span>
                                <span>Buffaloes</span>
                            </div>
                            <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-orange-50 p-1.5 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <span>Started on</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{request.startDate}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-900 shadow-sm">
                <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-100 dark:bg-gray-800/50 dark:border-gray-800">
                    <div>
                        <h4 className="text-base font-semibold text-gray-800 dark:text-white">Agent Operations</h4>

                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">AO: Krishna Reddy</p>
                        <p className="text-xs text-gray-500">+91 98480 12345</p>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-800/30 dark:border-gray-800 dark:text-gray-400">
                    <div className="col-span-1 text-center font-black">S.No</div>
                    <div className="col-span-5 px-4 font-black">Agent Name</div>
                    <div className="col-span-3 text-center font-black">No. of Farmers</div>
                    <div className="col-span-3 text-center font-black">No. of Acres</div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {agentStats.map((agent, idx) => {
                        const isExpanded = expandedAgents.includes(agent.id);
                        return (
                            <div key={agent.id} className="bg-white dark:bg-gray-900 transition-colors">
                                <div
                                    onClick={() => toggleAgent(agent.id)}
                                    className="grid grid-cols-12 gap-4 items-center px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                >
                                    <div className="col-span-1 text-sm font-black text-gray-500 flex items-center justify-center gap-1">
                                        <div className={`transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}>
                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                        <span>{String(idx + 1).padStart(2, '0')}</span>
                                    </div>
                                    <div className="col-span-5 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors uppercase tracking-tight">{agent.name}</span>
                                            <span className="text-[10px] font-bold text-gray-500 mt-0.5">+91 98765 {String(43210 + idx).slice(-5)}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-3 flex justify-center">
                                        <span className="inline-flex items-center rounded-lg bg-orange-100/50 px-3 py-1 text-xs font-black text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200/50 dark:border-orange-500/20 uppercase tracking-wider">
                                            {agent.totalFarmers} Farmers
                                        </span>
                                    </div>
                                    <div className="col-span-3 flex justify-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-gray-900 dark:text-white">{agent.totalAcres.toFixed(1)} <span className="text-[10px] text-gray-500 uppercase ml-0.5">Ac</span></span>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 px-6 py-4">
                                        <div className="pl-12">
                                            {agent.allFarmers.length > 0 ? (
                                                <table className="w-full text-sm text-center">
                                                    <thead className="text-[10px] text-gray-400 font-black uppercase bg-gray-50/50 dark:bg-gray-800/30 border-y border-gray-100 dark:border-gray-800">
                                                        <tr>
                                                            <th className="py-2 px-4 font-black w-16">S.No</th>
                                                            <th className="py-2 px-4 font-black">Farmer Name</th>
                                                            <th className="py-2 px-4 font-black">Onboarding Date</th>
                                                            <th className="py-2 px-4 font-black">Harvest Area</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                                                        {agent.allFarmers.map((farmer, fIdx) => (
                                                            <tr key={fIdx} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-800/30 transition-colors">
                                                                <td className="py-2 text-gray-500 text-[10px] font-bold">{String(fIdx + 1).padStart(2, '0')}</td>
                                                                <td className="py-2 text-gray-700 dark:text-gray-300 font-bold tracking-tight">{farmer.farmerName}</td>
                                                                <td className="py-2 text-gray-500 text-[10px] font-bold">{farmer.onboardingDate || '-'}</td>
                                                                <td className="py-2 text-gray-900 dark:text-white font-bold">{farmer.acres.toFixed(2)} <span className="text-[8px] text-gray-400 uppercase">Ac</span></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-xs text-gray-500 italic">No farmers assigned.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
                <h4 className="mb-6 text-base font-semibold text-gray-800 dark:text-white">Overall Progress</h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-orange-50 p-5 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300 mb-2">Daily Goal</p>
                        <div className="mb-4">
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">{metrics.dailyReqTons.toFixed(1)} <span className="text-sm font-normal text-gray-500">Tons</span></p>
                        </div>
                        <div className="border-t border-orange-100 dark:border-orange-800/30 pt-3">
                            <p className="text-lg font-bold text-gray-800 dark:text-white">{metrics.dailyHarvestAcres.toFixed(1)} <span className="text-sm font-normal text-gray-500">Acres</span></p>
                            <p className="text-xs text-gray-500">Daily Harvest Area</p>
                        </div>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-5 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-2">Weekly Goal</p>
                        <div className="mb-4">
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">{metrics.weeklyReqTons.toFixed(1)} <span className="text-sm font-normal text-gray-500">Tons</span></p>
                        </div>
                        <div className="border-t border-blue-100 dark:border-blue-800/30 pt-3">
                            <p className="text-lg font-bold text-gray-800 dark:text-white">{metrics.weeklyHarvestAcres.toFixed(1)} <span className="text-sm font-normal text-gray-500">Acres</span></p>
                            <p className="text-xs text-gray-500">Weekly Harvest Area</p>
                        </div>
                    </div>
                    <div className="rounded-xl bg-purple-50 p-5 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                        <p className="text-xs font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300 mb-2">Monthly Goal</p>
                        <div className="mb-4">
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">{metrics.monthlyReqTons.toFixed(1)} <span className="text-sm font-normal text-gray-500">Tons</span></p>
                        </div>
                        <div className="border-t border-purple-100 dark:border-purple-800/30 pt-3">
                            <p className="text-lg font-bold text-gray-800 dark:text-white">{metrics.monthlyHarvestAcres.toFixed(1)} <span className="text-sm font-normal text-gray-500">Acres</span></p>
                            <p className="text-xs text-gray-500">Monthly Harvest Area</p>
                        </div>
                    </div>
                    <div className="rounded-xl bg-green-50 p-5 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
                        <p className="text-xs font-bold uppercase tracking-wider text-green-800 dark:text-green-300 mb-2">45 Days Goal</p>
                        <div className="mb-4">
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">{metrics.cycleReqTons.toFixed(1)} <span className="text-sm font-normal text-gray-500">Tons</span></p>
                        </div>
                        <div className="border-t border-green-100 dark:border-green-800/30 pt-3">
                            <p className="text-lg font-bold text-gray-800 dark:text-white">{metrics.landRequiredAcres.toFixed(1)} <span className="text-sm font-normal text-gray-500">Acres</span></p>
                            <p className="text-xs text-gray-500">Cycle Harvest Area</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
                    <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">Land Productivity</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded dark:bg-gray-800">
                            <span className="text-gray-600 text-sm">Cycle Duration</span>
                            <span className="font-bold text-gray-900 dark:text-white">{CONSTANTS.DAYS_IN_CYCLE} Days</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded dark:bg-gray-800">
                            <span className="text-gray-600 text-sm">Yield / Cycle</span>
                            <span className="font-bold text-gray-900 dark:text-white">{CONSTANTS.YIELD_PER_ACRE_CYCLE} T/Acre</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
                    <h4 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">Required Staff</h4>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-blue-50 p-4 rounded-xl text-center dark:bg-blue-900/20">
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{agentStats.length}</div>
                            <div className="text-xs text-blue-600 uppercase font-bold tracking-wider">Agents</div>
                        </div>
                        <div className="flex-1 bg-orange-50 p-4 rounded-xl text-center dark:bg-orange-900/20">
                            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                {agentStats.reduce((sum, a) => sum + a.totalFarmers, 0)}
                            </div>
                            <div className="text-xs text-orange-600 uppercase font-bold tracking-wider">Farmers</div>
                        </div>
                        <div className="flex-1 bg-green-50 p-4 rounded-xl text-center dark:bg-green-900/20">
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {agentStats.reduce((sum, a) => sum + a.totalAcres, 0).toFixed(1)}
                            </div>
                            <div className="text-xs text-green-600 uppercase font-bold tracking-wider">Total Acres</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Harvest Schedule Table */}
            <div className="rounded-2xl border border-gray-200 bg-white overflow-visible dark:border-gray-800 dark:bg-gray-900 shadow-sm">
                <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-100 dark:bg-gray-800/50 dark:border-gray-800 overflow-visible rounded-t-2xl">
                    <div>
                        <h4 className="text-base font-semibold text-gray-800 dark:text-white">Harvest Schedule</h4>
                        <p className="text-xs text-gray-500 mt-1">Scheduled farmers for selected date</p>
                    </div>

                    {/* Date Picker */}
                    <div className="flex items-center gap-2 relative">
                        <div ref={harvestCalendarRef}>
                            <button
                                onClick={() => setShowHarvestCalendar(!showHarvestCalendar)}
                                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                            >
                                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="font-medium">{harvestDate}</span>
                            </button>
                            {showHarvestCalendar && (
                                <MiniCalendar
                                    selectedDate={harvestDate}
                                    onSelect={(date) => {
                                        setHarvestDate(date);
                                        // In a real app, we would re-fetch data for "date" here.
                                        // For now, our generateAgentSchedule uses this date,
                                        // but it is called on metrics change.
                                        // We should technically trigger regeneration if we want the "date" property in items to update.
                                        // But simplified: effectively just updating view state
                                    }}
                                    onClose={() => setShowHarvestCalendar(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-b-2xl">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-100 dark:bg-gray-800/80 border-y border-gray-200 dark:border-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">S.No</th>
                                <th scope="col" className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Farmer Name</th>
                                <th scope="col" className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Survey No</th>
                                <th scope="col" className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Harvest Area (Ac)</th>
                                <th scope="col" className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Assigned Agent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                            {flatHarvestSchedule.length > 0 ? flatHarvestSchedule.map((item, idx) => (
                                <tr key={idx} className="bg-white hover:bg-green-50/30 dark:bg-gray-900 dark:hover:bg-green-500/5 transition-colors group">
                                    <td className="px-6 py-4 text-center text-gray-500 text-xs font-bold">{String(idx + 1).padStart(2, '0')}</td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors uppercase tracking-tight">
                                        {item.farmerName}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-500 font-mono text-xs">
                                        {String(100 + idx * 5)}/A
                                    </td>
                                    <td className="px-6 py-4 text-center font-black text-gray-900 dark:text-white">
                                        {item.acres.toFixed(2)} <span className="text-[10px] text-gray-400 uppercase ml-0.5">Ac</span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-500 font-bold text-xs uppercase tracking-tight">
                                        {item.assignedAgent}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No harvest scheduled for this date.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProcurementDetails;
