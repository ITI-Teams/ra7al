<x-app-layout>
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Universities</h1>

        <div class="flex gap-3">
            <a href="{{ route('universities.create') }}"
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-500">
                <i class="fa fa-plus"></i> Add University
            </a>

            <a href="{{ route('universities.trashed') }}"
                class="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-500">
                <i class="fa fa-trash"></i> Trashed
            </a>
        </div>
    </div>

    <!-- Search -->
    <div class="mb-4">
        <input id="searchInput" type="text" placeholder="Search universities..."
            class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 focus:ring focus:ring-indigo-300 dark:text-white">
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
        <table class="w-full text-left">
            <thead class="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
                <tr>
                    <th class="px-4 py-3">Name</th>
                    <th class="px-4 py-3">City</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>

            <tbody id="tableData">
                @foreach($universities as $uni)
                    <tr class="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                        <td class="px-4 py-3">{{ $uni->name }}</td>
                        <td class="px-4 py-3">{{ $uni->city->name ?? 'N/A' }}</td>
                        <td class="px-4 py-3 flex gap-2">

                            <a href="{{ route('universities.edit', $uni->id) }}"
                                class="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500">
                                Edit
                            </a>

                            <form action="{{ route('universities.destroy', $uni->id) }}" method="POST">
                                @csrf
                                @method('DELETE')
                                <button type="button"
                                    @click="$dispatch('confirm-delete', { url: '{{ route('universities.destroy', $uni->id) }}' })"
                                    class="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500">
                                    Delete
                                </button>
                            </form>

                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Pagination -->
    <div class="mt-6">
        {{ $universities->links() }}
    </div>

    <!-- JS Search -->
    <script>
        document.getElementById('searchInput').addEventListener('keyup', function () {
            let filter = this.value.toLowerCase();
            let rows = document.querySelectorAll('#tableData tr');

            rows.forEach(row => {
                row.style.display =
                    row.textContent.toLowerCase().includes(filter)
                        ? '' : 'none';
            });
        });
    </script>

</x-app-layout>