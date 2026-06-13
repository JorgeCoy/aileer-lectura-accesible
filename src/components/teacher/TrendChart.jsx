import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ data, title = "Evolución de Velocidad (WPM)" }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No hay datos suficientes para mostrar tendencias.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
            <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="date"
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="wpm"
                            stroke="#4f46e5"
                            strokeWidth={4}
                            dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrendChart;
