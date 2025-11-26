<div class="flex flex-col h-full bg-white/90 dark:bg-slate-900/95" x-data x-init="$store.sidebar.init()">

    <!-- Logo + Toggle Button -->
    <div class="flex items-center justify-between p-5 border-b border-gray-200/30 dark:border-slate-700">
        <div class="flex items-center gap-3">
            <i class="fas fa-rocket text-2xl text-indigo-600"></i>
            <span x-show="$store.sidebar.open"
                  x-transition:enter="transition ease-out duration-300"
                  x-transition:enter-start="opacity-0 transform -translate-x-2"
                  x-transition:enter-end="opacity-100 transform translate-x-0"
                  class="text-xl font-bold text-gray-800 dark:text-white">
                Ra7al
            </span>
        </div>

        <button @click="$store.sidebar.toggle()"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <i :class="$store.sidebar.open ? 'fas fa-chevron-left' : 'fas fa-chevron-right'"
               class="text-gray-600 dark:text-gray-400 text-lg"></i>
        </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4">
        <ul class="space-y-2">
            <li>
                <a href="{{ route('dashboard') }}"
                class="sidebar-item {{ request()->routeIs('dashboard') ? 'active' : '' }}">
                    <i class="fas fa-gauge-high"></i>
                    <span x-show="$store.sidebar.open"
                        x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 transform -translate-x-2"
                        x-transition:enter-end="opacity-100 transform translate-x-0">
                        Dashboard
                    </span>
                </a>
            </li>
            <li>
                <a href="{{ route('messages.index') }}"
                class="sidebar-item {{ request()->routeIs('messages.*') ? 'active' : '' }}">
                    <i class="fas fa-message"></i>
                    <span x-show="$store.sidebar.open"
                        x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 transform -translate-x-2"
                        x-transition:enter-end="opacity-100 transform translate-x-0">
                        Messages
                    </span>
                </a>
            </li>
            <li>
                <a href="{{ route('mails.index') }}"
                class="sidebar-item {{ request()->routeIs('mails.*') ? 'active' : '' }}">
                    <i class="fas fa-envelope"></i>
                    <span x-show="$store.sidebar.open"
                        x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 transform -translate-x-2"
                        x-transition:enter-end="opacity-100 transform translate-x-0">
                        Mails
                    </span>
                </a>
            </li>
            <li>
                <a href="{{ route('users.index') }}"
                class="sidebar-item {{ request()->routeIs('users.*') ? 'active' : '' }}">
                    <i class="fas fa-users"></i>
                    <span x-show="$store.sidebar.open"
                        x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 transform -translate-x-2"
                        x-transition:enter-end="opacity-100 transform translate-x-0">
                        Users
                    </span>
                </a>
            </li>
            <li>
                <a href="{{ route('roles.index') }}"
                class="sidebar-item {{ request()->routeIs('roles.*') || request()->routeIs('permissions.*') ? 'active' : '' }}">
                    <i class="fas fa-shield-halved"></i>
                    <span x-show="$store.sidebar.open"
                        x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 transform -translate-x-2"
                        x-transition:enter-end="opacity-100 transform translate-x-0">
                        Roles & Permissions
                    </span>
                </a>
            </li>
            <li>
                <a href="{{ route('profile.edit') }}"
                class="sidebar-item {{ request()->routeIs('profile.*') ? 'active' : '' }}">
                    <i class="fas fa-user-circle"></i>
                    <span x-show="$store.sidebar.open"
                        x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 transform -translate-x-2"
                        x-transition:enter-end="opacity-100 transform translate-x-0">
                        Profile
                    </span>
                </a>
            </li>
        </ul>
    </nav>

    <div class="p-4 border-t border-gray-200/30 dark:border-slate-700">
        <button @click="$store.theme.toggle()"
                class="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
            <i x-show="!$store.theme.dark" class="fas fa-moon text-indigo-600"></i>
            <i x-show="$store.theme.dark" class="fas fa-sun text-yellow-400"></i>
            <span x-show="$store.sidebar.open"
                  x-transition:enter="transition ease-out duration-300"
                  x-transition:enter-start="opacity-0 transform -translate-x-2"
                  x-transition:enter-end="opacity-100 transform translate-x-0"
                  class="font-medium text-gray-700 dark:text-gray-300">
                <span x-text="$store.theme.dark ? 'Light Mode' : 'Dark Mode'"></span>
            </span>
        </button>
    </div>
</div>
