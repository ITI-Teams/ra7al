<div class="flex justify-between items-center w-full">

    <!-- Breadcrumb -->
    <div class="text-sm breadcrumbs">
        <ul class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <li><a href="#" class="text-indigo-600 dark:text-indigo-400 hover:underline">Dashboard</a></li>
            <li><i class="fas fa-chevron-right text-xs mx-2"></i> Home</li>
        </ul>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-4">

        <button @click="$store.theme.toggle()" class="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition">
            <i x-show="!$store.theme.dark" class="fas fa-moon text-xl text-gray-600 dark:text-gray-400"></i>
            <i x-show="$store.theme.dark" class="fas fa-sun text-xl text-yellow-400"></i>
        </button>

        <!-- Notifications -->
        <button class="relative p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition">
            <i class="fas fa-bell text-xl text-gray-600 dark:text-gray-400"></i>
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
        </button>

        <!-- Profile -->
        <div x-data="{ open: false }" class="relative">
             <button @click="open = !open" class="w-9 h-9 rounded-full ring-1 ring-indigo-300 dark:ring-indigo-500 overflow-hidden border border-white dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <img
                    @if(Auth::user()->avatar)
                        src="{{ asset(Auth::user()->avatar) }}"
                    @else
                        src="https://i.pravatar.cc/150?img=5"
                    @endif

                    alt="User" class="w-full h-full object-cover">
            </button>

            <div x-show="open"
                x-transition:enter="transition ease-out duration-200"
                x-transition:enter-start="opacity-0 transform scale-95 -translate-y-2"
                x-transition:enter-end="opacity-100 transform scale-100 translate-y-0"
                x-transition:leave="transition ease-in duration-150"
                x-transition:leave-start="opacity-100 transform scale-100 translate-y-0"
                x-transition:leave-end="opacity-0 transform scale-95 -translate-y-2"
                @click.away="open = false"
                class="absolute right-0 mt-3 w-64 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden z-50"
                style="display: none;">

                <div class="p-4 border-b border-gray-100/50 dark:border-slate-700/50 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-800">
                    <p class="font-semibold text-gray-800 dark:text-white text-sm">{{ Auth::user()->name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ Auth::user()->email }}</p>
                </div>

                <div class="py-2">
                    <a href="{{ route('profile.edit') }}" class="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group">
                        <i class="fas fa-user-circle text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 w-4 text-center"></i>
                        <span>Profile</span>
                    </a>


                    <div class="border-t border-gray-100 dark:border-slate-700/50 my-1"></div>

                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <a onclick="event.preventDefault();
                                            this.closest('form').submit();" class="flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group">
                            <i class="fas fa-sign-out-alt w-4 text-center"></i>
                            <span>Logout</span>
                        </a>
                    </form>

                </div>
            </div>
        </div>
    </div>
</div>
