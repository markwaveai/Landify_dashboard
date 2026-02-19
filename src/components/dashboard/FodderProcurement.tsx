import React, { useState, useEffect, useRef } from "react";
import ProcurementDetails from "./FodderProcurementDetails";

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
    <div className="absolute left-0 top-full mt-1 z-[999] w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
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

// --- Main Types ---
interface FodderRequest {
  id: string;
  buffaloes: number;
  startDate: string;
  farm: string;
  createdAt: number;
}

const FodderProcurement: React.FC = () => {
  // 1. Form Inputs
  const [formBuffaloes, setFormBuffaloes] = useState<string>("");
  const [formStartDate, setFormStartDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [formFarm, setFormFarm] = useState<string>("");

  // Mock Farms
  const FARM_OPTIONS = [
    "Kurnool shed 1",
    "Kurnool shed 2",
    "Hyderabad shed 1",
    "Hyderabad shed 2"
  ];

  // 2. Data State
  const [requests, setRequests] = useState<FodderRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fodderRequests');
      try {
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error("Failed to parse requests", e);
        return [];
      }
    }
    return [];
  });
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // 3. UI State
  const [showFormCalendar, setShowFormCalendar] = useState(false);
  const formCalendarRef = useRef<HTMLDivElement>(null);

  // Removed Load Effect (handled by lazy init)

  // Sync to LS
  useEffect(() => {
    localStorage.setItem('fodderRequests', JSON.stringify(requests));
  }, [requests]);

  // Close calendar logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formCalendarRef.current && !formCalendarRef.current.contains(event.target as Node)) {
        setShowFormCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Actions ---
  const handleBuffaloInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(val)) {
      setFormBuffaloes(val);
    }
  };

  const handleAddSchedule = () => {
    if (!formBuffaloes || parseInt(formBuffaloes) === 0 || !formFarm) return;

    const newRequest: FodderRequest = {
      id: Date.now().toString(),
      buffaloes: parseInt(formBuffaloes),
      startDate: formStartDate,
      farm: formFarm,
      createdAt: Date.now()
    };

    setRequests((prev) => [newRequest, ...prev]);
    setFormBuffaloes(""); // Reset form
    setFormFarm("");
  };

  // If a request is selected, show details view
  if (selectedRequestId) {
    return (
      <ProcurementDetails
        requestId={selectedRequestId}
        onBack={() => setSelectedRequestId(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Request Creation Form */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm relative z-20 overflow-visible">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Create Fodder Schedule
          </h3>
          <p className="text-sm text-gray-500">
            Enter buffalo count and start date to generate a new plan.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 items-end">
          {/* Farm Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Farm
            </label>
            <div className="relative">
              <select
                value={formFarm}
                onChange={(e) => setFormFarm(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="" disabled>Choose Farm...</option>
                {FARM_OPTIONS.map(farm => (
                  <option key={farm} value={farm}>{farm}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Buffaloes Input */}
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Buffaloes
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formBuffaloes}
              onChange={handleBuffaloInput}
              placeholder="eg:3600"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-lg font-bold text-gray-900 focus:border-green-500 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <span className="absolute right-4 top-[2.6rem] text-sm text-gray-400">
              Heads
            </span>
          </div>

          {/* Onboarding Date Input */}
          <div className="relative" ref={formCalendarRef}>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Onboarding Date
            </label>
            <button
              onClick={() => setShowFormCalendar(!showFormCalendar)}
              className="w-full text-left flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-green-500 ring-green-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <span>{formStartDate}</span>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
            {showFormCalendar && (
              <MiniCalendar
                selectedDate={formStartDate}
                onSelect={setFormStartDate}
                onClose={() => setShowFormCalendar(false)}
              />
            )}
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={handleAddSchedule}
              disabled={!formBuffaloes || !formFarm}
              className="w-full rounded-lg bg-green-600 px-6 py-3.5 text-center font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>

      {/* 2. Request List Table */}
      {requests.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-900 shadow-sm">
          <h4 className="px-6 py-4 text-base font-semibold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-800">
            Scheduled Requests
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Reference ID</th>
                  <th className="px-6 py-3">Farm</th>
                  <th className="px-6 py-3">Buffaloes</th>
                  <th className="px-6 py-3">Start Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequestId(req.id)}
                    className="cursor-pointer transition-colors hover:bg-green-50 dark:hover:bg-green-900/10"
                  >
                    <td className="px-6 py-4 font-mono text-gray-500">#{req.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800 dark:text-white">{req.farm || "N/A"}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{req.buffaloes.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{req.startDate}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-green-600 font-medium hover:text-green-800">
                        Open Details
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FodderProcurement;
