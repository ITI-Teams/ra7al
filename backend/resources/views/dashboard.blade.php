<x-app-layout>
    <!-- PAGE HEADER WITH GRADIENT -->
    <div class="mb-8 relative overflow-hidden">
        <div
            class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-pink-600/20 blur-3xl">
        </div>
        <div class="relative">
            <h1
                class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent animate-fade-in">
                Welcome to Your Dashboard
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2 text-lg animate-slide-up">
                Here's what's happening today.
            </p>
        </div>
    </div>

    <!-- SUMMARY CARDS WITH ENHANCED DESIGN -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        @php
            $cards = [
                ['label' => 'Users', 'id' => 'totalUsers', 'icon' => '👥', 'color' => 'from-blue-500 to-cyan-500', 'bg' => 'bg-blue-50 dark:bg-blue-900/20'],
                ['label' => 'Properties', 'id' => 'totalProperties', 'icon' => '🏠', 'color' => 'from-purple-500 to-pink-500', 'bg' => 'bg-purple-50 dark:bg-purple-900/20'],
                ['label' => 'Messages', 'id' => 'totalMessages', 'icon' => '💬', 'color' => 'from-orange-500 to-red-500', 'bg' => 'bg-orange-50 dark:bg-orange-900/20'],
                ['label' => 'Cities', 'id' => 'totalCities', 'icon' => '🌆', 'color' => 'from-green-500 to-emerald-500', 'bg' => 'bg-green-50 dark:bg-green-900/20']
            ];
        @endphp

        @foreach ($cards as $card)
            <div class="group relative overflow-hidden rounded-2xl shadow-lg bg-white dark:bg-gray-800 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 cursor-pointer card-animate"
                style="animation-delay: {{ $loop->index * 0.1 }}s">
                <!-- Background Gradient -->
                <div
                    class="absolute inset-0 bg-gradient-to-br {{ $card['color'] }} opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                </div>

                <!-- Icon Circle -->
                <div
                    class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br {{ $card['color'] }} opacity-10 group-hover:scale-150 transition-transform duration-700">
                </div>

                <div class="relative p-6">
                    <div class="flex items-center justify-between mb-3">
                        <h2 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {{ $card['label'] }}</h2>
                        <span
                            class="text-3xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{{ $card['icon'] }}</span>
                    </div>
                    <p id="{{ $card['id'] }}"
                        class="text-4xl font-extrabold bg-gradient-to-r {{ $card['color'] }} bg-clip-text text-transparent counter-number">
                        0</p>
                    <div
                        class="mt-3 h-1 w-0 group-hover:w-full bg-gradient-to-r {{ $card['color'] }} rounded-full transition-all duration-700">
                    </div>
                </div>
            </div>
        @endforeach
    </div>

    <!-- CHARTS GRID WITH ENHANCED STYLING -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <!-- Chart Card Template with Enhanced Design -->
        @php
            $charts = [
                ['id' => 'usersChart', 'title' => 'Users per Month', 'icon' => '📈', 'color' => 'from-blue-500 to-cyan-500'],
                ['id' => 'propertiesCityChart', 'title' => 'Properties per City', 'icon' => '🏙️', 'color' => 'from-amber-500 to-orange-500'],
                ['id' => 'propertiesStatusChart', 'title' => 'Properties by Status', 'icon' => '📊', 'color' => 'from-green-500 to-emerald-500'],
                ['id' => 'usersRoleChart', 'title' => 'Users by Role', 'icon' => '👔', 'color' => 'from-purple-500 to-pink-500'],
                ['id' => 'messagesPriorityChart', 'title' => 'Messages by Priority', 'icon' => '⚡', 'color' => 'from-red-500 to-orange-500']
            ];
        @endphp

        @foreach ($charts as $chart)
            <div class="group relative overflow-hidden p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 chart-card-animate"
                style="animation-delay: {{ $loop->index * 0.15 }}s">
                <!-- Decorative Background -->
                <div
                    class="absolute inset-0 bg-gradient-to-br {{ $chart['color'] }} opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                </div>

                <!-- Header -->
                <div class="relative flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <span
                            class="text-2xl transform group-hover:scale-125 transition-transform duration-300">{{ $chart['icon'] }}</span>
                        {{ $chart['title'] }}
                    </h3>
                    <div class="w-3 h-3 rounded-full bg-gradient-to-r {{ $chart['color'] }} animate-pulse"></div>
                </div>

                <!-- Chart Container -->
                <div class="relative">
                    <canvas id="{{ $chart['id'] }}" height="150"></canvas>
                </div>
            </div>
        @endforeach
    </div>

    <style>
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(10px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes cardSlide {
            from {
                opacity: 0;
                transform: translateX(-30px) scale(0.95);
            }

            to {
                opacity: 1;
                transform: translateX(0) scale(1);
            }
        }

        @keyframes chartSlide {
            from {
                opacity: 0;
                transform: translateY(30px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .animate-fade-in {
            animation: fadeIn 0.8s ease-out;
        }

        .animate-slide-up {
            animation: slideUp 0.8s ease-out 0.2s both;
        }

        .card-animate {
            animation: cardSlide 0.6s ease-out both;
        }

        .chart-card-animate {
            animation: chartSlide 0.6s ease-out both;
        }

        .counter-number {
            transition: all 0.3s ease;
        }
    </style>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        const isDark = document.documentElement.classList.contains('dark');

        // Enhanced color schemes
        const colorSchemes = {
            blue: ['#3b82f6', '#60a5fa', '#93c5fd'],
            purple: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
            orange: ['#f97316', '#fb923c', '#fdba74'],
            green: ['#10b981', '#34d399', '#6ee7b7'],
            red: ['#ef4444', '#f87171', '#fca5a5'],
            pink: ['#ec4899', '#f472b6', '#f9a8d4'],
            yellow: ['#eab308', '#facc15', '#fde047']
        };

        function generateGradientColors(n, scheme = 'blue') {
            const colors = colorSchemes[scheme] || colorSchemes.blue;
            return Array.from({ length: n }, (_, i) => colors[i % colors.length]);
        }

        function getGradient(ctx, color1, color2) {
            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            return gradient;
        }

        async function fetchData(url) {
            const res = await fetch(url, { credentials: 'same-origin' });
            return res.json();
        }

        function animateCounter(element, target) {
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 20);
        }

        function createChart(ctx, type, labels, data, options = {}) {
            const bgColors = options.backgroundColor || generateGradientColors(labels.length, options.colorScheme);
            const borderColor = options.borderColor || bgColors[0];

            // Debug: log chart data
            console.log('Creating chart:', { type, labels, data });

            return new Chart(ctx, {
                type: type,
                data: {
                    labels: labels,
                    datasets: [{
                        label: options.label || '',
                        data: data,
                        backgroundColor: bgColors,
                        borderColor: borderColor,
                        borderWidth: 3,
                        fill: type === 'line' ? true : false,
                        tension: 0.4,
                        pointRadius: type === 'line' ? 6 : 0,
                        pointHoverRadius: type === 'line' ? 10 : 0,
                        pointBackgroundColor: borderColor,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 3,
                        pointHoverBorderWidth: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: {
                        duration: 1500,
                        easing: 'easeInOutQuart',
                        delay: (context) => context.dataIndex * 100
                    },
                    plugins: {
                        legend: {
                            display: type === 'doughnut',
                            position: 'bottom',
                            labels: {
                                font: { size: 13, weight: '600' },
                                padding: 15,
                                color: isDark ? '#e5e7eb' : '#374151',
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            backgroundColor: isDark ? '#1f2937' : '#ffffff',
                            titleColor: isDark ? '#f3f4f6' : '#111827',
                            bodyColor: isDark ? '#e5e7eb' : '#374151',
                            borderColor: isDark ? '#374151' : '#e5e7eb',
                            borderWidth: 1,
                            padding: 12,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                                label: function (ctx) {
                                    const value = ctx.raw;
                                    if (type === 'doughnut') {
                                        const total = data.reduce((a, b) => a + b, 0);
                                        const percent = ((value / total) * 100).toFixed(1);
                                        return `${ctx.label}: ${value} (${percent}%)`;
                                    }
                                    return `${options.label || ctx.label}: ${value}`;
                                }
                            }
                        }
                    },
                    scales: type !== 'doughnut' ? {
                        x: {
                            display: true,
                            grid: {
                                display: true,
                                color: isDark ? '#374151' : '#f3f4f6',
                                drawBorder: false
                            },
                            ticks: {
                                color: isDark ? '#9ca3af' : '#6b7280',
                                font: { size: 11 }
                            }
                        },
                        y: {
                            display: true,
                            beginAtZero: true,
                            grid: {
                                display: true,
                                color: isDark ? '#374151' : '#f3f4f6',
                                drawBorder: false
                            },
                            ticks: {
                                color: isDark ? '#9ca3af' : '#6b7280',
                                font: { size: 11 },
                                precision: 0
                            }
                        }
                    } : undefined,
                    ...options.chartOptions
                }
            });
        }

        // Load summary cards with animation
        fetchData('/api/dashboard/stats').then(data => {
            animateCounter(document.getElementById('totalUsers'), data.totalUsers);
            animateCounter(document.getElementById('totalProperties'), data.totalProperties);
            animateCounter(document.getElementById('totalMessages'), data.totalMessages);
            animateCounter(document.getElementById('totalCities'), data.totalCities);
        });

        // Charts with enhanced styling
        fetchData('/api/dashboard/users-per-month')
            .then(json => {
                console.log('Users per month data:', json);
                const ctx = document.getElementById('usersChart').getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(59,130,246,0.6)');
                gradient.addColorStop(1, 'rgba(59,130,246,0.05)');

                createChart(ctx, 'line', json.labels, json.data, {
                    label: 'Users',
                    backgroundColor: gradient,
                    borderColor: '#3b82f6',
                    colorScheme: 'blue'
                });
            })
            .catch(err => console.error('Error loading users chart:', err));

        fetchData('/api/dashboard/properties-per-city?limit=8')
            .then(json => {
                console.log('Properties per city data:', json);
                createChart(
                    document.getElementById('propertiesCityChart').getContext('2d'),
                    'bar', json.labels, json.data,
                    {
                        label: 'Properties',
                        colorScheme: 'orange'
                    }
                );
            })
            .catch(err => console.error('Error loading properties city chart:', err));

        fetchData('/api/dashboard/properties-by-status')
            .then(json => createChart(
                document.getElementById('propertiesStatusChart').getContext('2d'),
                'doughnut', json.labels, json.data,
                {
                    label: 'Status',
                    backgroundColor: ['#10b981', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899']
                }
            ));

        fetchData('/api/dashboard/users-by-role')
            .then(json => createChart(
                document.getElementById('usersRoleChart').getContext('2d'),
                'bar', json.labels, json.data,
                {
                    label: 'Users',
                    colorScheme: 'purple'
                }
            ));

        fetchData('/api/dashboard/messages-by-priority')
            .then(json => createChart(
                document.getElementById('messagesPriorityChart').getContext('2d'),
                'doughnut', json.labels, json.data,
                {
                    label: 'Priority',
                    backgroundColor: ['#f97316', '#eab308', '#ef4444', '#3b82f6']
                }
            ));
    </script>
</x-app-layout>