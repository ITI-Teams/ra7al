<!DOCTYPE html>
<html lang="en" x-data="themeData()" x-data="{ open: true }">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ra7al Dashboard</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

</head>

<body class="text-gray-800 dark:text-gray-200 min-h-screen" >

<div class="flex min-h-screen">

    <!-- Sidebar -->
    <aside
           :class="open ? 'w-64 sidebar-expanded' : 'w-20 sidebar-collapsed'"
           class="glass-light dark:glass-dark fixed h-full transition-all duration-300 border-r border-white/20 z-10">

        <!-- Logo + Toggle -->
        <div class="flex items-center justify-between p-4">
            <div class="flex items-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
                <i class="fas fa-rocket mr-2"></i>
                <span class="sidebar-text">Ra7al</span>
            </div>

            <button @click="open = !open"
                    class="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                <i :class="open ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"></i>
            </button>
        </div>

        <!-- Navigation -->
        <nav class="mt-4">
            <ul class="space-y-2 p-2">
                <li>
                    <a href="#"
                       class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-500/20 transition">
                        <i class="fas fa-gauge-high text-lg"></i>
                        <span class="sidebar-text">Dashboard</span>
                    </a>
                </li>

                <li>
                    <a href="#"
                       class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-500/20 transition">
                        <i class="fas fa-briefcase text-lg"></i>
                        <span class="sidebar-text">Jobs</span>
                    </a>
                </li>

                <li>
                    <a href="#"
                       class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-500/20 transition">
                        <i class="fas fa-folder-open text-lg"></i>
                        <span class="sidebar-text">Projects</span>
                    </a>
                </li>

                <li>
                    <a href="#"
                       class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-500/20 transition">
                        <i class="fas fa-users text-lg"></i>
                        <span class="sidebar-text">Team</span>
                    </a>
                </li>

                <li>
                    <a href="#"
                       class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-500/20 transition">
                        <i class="fas fa-cog text-lg"></i>
                        <span class="sidebar-text">Settings</span>
                    </a>
                </li>
            </ul>
        </nav>

        <!-- Sidebar Footer -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
            <button @click="toggleDarkMode()"
                    class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition">
                <i x-show="!dark" class="fas fa-moon"></i>
                <i x-show="dark" class="fas fa-sun"></i>
                <span class="sidebar-text" x-text="dark ? 'Light Mode' : 'Dark Mode'"></span>
            </button>
        </div>
    </aside>

    <!-- MAIN CONTENT -->
    <div class="flex-1 flex flex-col transition-all duration-300 main-content"
         :class="open ? 'ml-64' : 'ml-20'">

        <!-- Header -->
        <header class="glass-light dark:glass-dark shadow-md border-b border-white/10 px-6 py-3 flex justify-between items-center">

            <!-- Breadcrumb -->
            <div class="flex items-center gap-2 text-sm">
                <a href="#" class="text-indigo-600 dark:text-indigo-400 hover:underline">Dashboard</a>
                <i class="fas fa-chevron-right text-xs text-gray-400"></i>
                <span class="text-gray-500 dark:text-gray-400">Home</span>
            </div>

            <!-- Right Menu -->
            <div class="flex items-center gap-5">

                <!-- Notifications -->
                <button class="relative text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    <i class="fas fa-bell text-xl"></i>
                    <span class="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
                </button>

                <!-- Messages -->
                <button class="relative text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    <i class="fas fa-envelope text-xl"></i>
                    <span class="absolute -top-1 -right-2 bg-indigo-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
                </button>

                <!-- Theme -->
                <button @click="toggleDarkMode()"
                        class="hidden md:flex items-center gap-2 p-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    <i x-show="!dark" class="fas fa-moon text-xl"></i>
                    <i x-show="dark" class="fas fa-sun text-xl"></i>
                </button>

                <!-- Profile -->
                <div class="relative" x-data="{ open: false }">

                    <button @click="open = !open"
                            class="rounded-full border-2 border-indigo-600 dark:border-indigo-400 p-1 hover:border-indigo-500 dark:hover:border-indigo-300 transition">
                        <img src="https://i.pravatar.cc/300"
                            class="w-10 h-10 rounded-full">
                    </button>

                    <!-- Dropdown -->
                    <div x-show="open" @click.away="open=false" x-cloak
                        class="absolute right-0 mt-3 w-56 dropdown-panel bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl z-50"> <!-- زودنا z-index -->

                        <div class="flex items-center gap-3 p-3 border-b border-white/10">
                            <img src="https://i.pravatar.cc/300" class="w-10 h-10 rounded-full">
                            <div>
                                <p class="font-semibold text-gray-800 dark:text-gray-200">John Doe</p>
                                <p class="text-xs text-gray-600 dark:text-gray-400">john@example.com</p>
                            </div>
                        </div>

                        <a href="#" class="flex items-center gap-2 p-3 hover:bg-indigo-500/10 rounded-lg text-gray-700 dark:text-gray-300">
                            <i class="fas fa-user"></i> Profile
                        </a>

                        <a href="#" class="flex items-center gap-2 p-3 hover:bg-indigo-500/10 rounded-lg text-gray-700 dark:text-gray-300">
                            <i class="fas fa-cog"></i> Settings
                        </a>

                        <a href="#" class="flex items-center gap-2 p-3 text-red-500 hover:bg-red-500/10 rounded-lg">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </div>

                </div>
            </div>
        </header>

        <!-- PAGE CONTENT -->
        <main class="p-6 flex-1">

            <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Welcome to Your Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">
                Here's what's happening today.
            </p>

            <!-- Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div class="stat-card rounded-xl p-5">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                            <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">$24,580</h3>
                        </div>
                        <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <i class="fas fa-dollar-sign text-green-600 dark:text-green-400"></i>
                        </div>
                    </div>
                    <p class="text-xs text-green-600 dark:text-green-400 mt-3 flex items-center">
                        <i class="fas fa-arrow-up mr-1"></i> 12.5% from last month
                    </p>
                </div>

                <div class="stat-card rounded-xl p-5">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">New Users</p>
                            <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">1,248</h3>
                        </div>
                        <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <i class="fas fa-users text-blue-600 dark:text-blue-400"></i>
                        </div>
                    </div>
                    <p class="text-xs text-blue-600 dark:text-blue-400 mt-3 flex items-center">
                        <i class="fas fa-arrow-up mr-1"></i> 8.2% from last month
                    </p>
                </div>

                <div class="stat-card rounded-xl p-5">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Active Projects</p>
                            <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">42</h3>
                        </div>
                        <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <i class="fas fa-folder-open text-purple-600 dark:text-purple-400"></i>
                        </div>
                    </div>
                    <p class="text-xs text-purple-600 dark:text-purple-400 mt-3 flex items-center">
                        <i class="fas fa-arrow-up mr-1"></i> 3.1% from last month
                    </p>
                </div>

                <div class="stat-card rounded-xl p-5">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
                            <h3 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-1">24.8%</h3>
                        </div>
                        <div class="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <i class="fas fa-chart-line text-amber-600 dark:text-amber-400"></i>
                        </div>
                    </div>
                    <p class="text-xs text-amber-600 dark:text-amber-400 mt-3 flex items-center">
                        <i class="fas fa-arrow-up mr-1"></i> 2.7% from last month
                    </p>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div class="stat-card rounded-xl p-5">
                    <h3 class="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h3>
                    <div class="space-y-4">
                        <div class="flex items-start gap-3">
                            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <i class="fas fa-user-plus text-blue-600 dark:text-blue-400"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-800 dark:text-gray-200">New user registered</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <i class="fas fa-shopping-cart text-green-600 dark:text-green-400"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-800 dark:text-gray-200">New order received</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">15 minutes ago</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3">
                            <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <i class="fas fa-ticket-alt text-purple-600 dark:text-purple-400"></i>
                            </div>
                            <div>
                                <p class="text-sm text-gray-800 dark:text-gray-200">Support ticket updated</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stat-card rounded-xl p-5">
                    <h3 class="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">Project Progress</h3>
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-700 dark:text-gray-300">Website Redesign</span>
                                <span class="text-gray-600 dark:text-gray-400">75%</span>
                            </div>
                            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full" style="width: 75%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-700 dark:text-gray-300">Mobile App</span>
                                <span class="text-gray-600 dark:text-gray-400">45%</span>
                            </div>
                            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-green-600 dark:bg-green-500 rounded-full" style="width: 45%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-700 dark:text-gray-300">API Integration</span>
                                <span class="text-gray-600 dark:text-gray-400">90%</span>
                            </div>
                            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div class="h-full bg-amber-600 dark:bg-amber-500 rounded-full" style="width: 90%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer class="mt-auto text-center py-4 glass-light dark:glass-dark border-t border-white/10 text-gray-600 dark:text-gray-400">
            © 2025 Ra7al — All Rights Reserved
        </footer>

    </div>

</div>


</body>
</html>
