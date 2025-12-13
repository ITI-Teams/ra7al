<!DOCTYPE html>
<html lang="en" class="h-full" x-data>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Ra7al Dashboard</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <style>
        [x-cloak] {
            display: none !important;
        }
    </style>
</head>

<body
    class="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 antialiased transition-colors duration-300"
    x-cloak>

    <div class="flex h-screen overflow-hidden">

        <!-- Sidebar -->
        <aside :class="$store.sidebar.open ? 'w-64' : 'w-20'"
            class="fixed inset-y-0 left-0 z-50 flex-shrink-0 transition-all duration-300 ease-in-out glass-sidebar shadow-2xl">
            @include('components.sidebar')
        </aside>

        <!-- Main Content + Header -->
        <div class="flex-1 flex flex-col transition-all duration-300" :class="$store.sidebar.open ? 'ml-64' : 'ml-20'">

            <!-- Header -->
            <header class="glass-header shadow-lg border-b border-gray-200/20 dark:border-slate-800/50 
           px-6 py-4 flex justify-between items-center 
           relative z-[5000] !overflow-visible">
                @include('components.header')
            </header>

            <!-- Main Content -->
            <main class="flex-1 overflow-y-auto bg-gray-50/80 dark:bg-slate-900/90 p-6">
                @include('components.toast')
                @include('components.confirm-modal')
                {{ $slot }}
            </main>

            @include('components.footer')
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            if (!window.Alpine) {
                console.error('Alpine.js not loaded');
                return;
            }
            if (window.Alpine.store('sidebar') && window.Alpine.store('theme')) {
                window.Alpine.store('sidebar').init();
                window.Alpine.store('theme').init();
            }
        });
    </script>

    {{-- Stack for all component JS --}}
    @stack('scripts')



</body>

</html>