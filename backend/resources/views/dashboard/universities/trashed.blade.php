<x-app-layout>
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Trashed Universities</h1>
        <a href="{{ route('universities.index') }}"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500">
            Back to Universities
        </a>
    </div>

    <div class="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
        <table class="w-full text-left">
            <thead class="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
                <tr>
                    <th class="px-4 py-3">Name</th>
                    <th class="px-4 py-3">City</th>
                    <th class="px-4 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach($universities as $uni)
                    <tr class="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                        <td class="px-4 py-3">{{ $uni->name }}</td>
                        <td class="px-4 py-3">{{ $uni->city->name ?? 'N/A' }}</td>
                        <td class="px-4 py-3 flex gap-2">
                            <form action="{{ route('universities.restore', $uni->id) }}" method="POST">
                                @csrf
                                <button type="submit"
                                    class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-500">
                                    Restore
                                </button>
                            </form>

                            <form action="{{ route('universities.force-delete', $uni->id) }}" method="POST">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-500">
                                    Delete Permanently
                                </button>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="mt-6">
        {{ $universities->links() }}
    </div>
</x-app-layout>