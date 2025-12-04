<x-app-layout>
    <h1 class="text-2xl font-bold mb-6">Edit City</h1>

    <form action="{{ route('cities.update', $city->id) }}" method="POST" class="space-y-4">
        @csrf
        @method('PUT')

        <div>
            <label class="block mb-1 font-medium">City Name</label>
            <input type="text" name="name" value="{{ old('name', $city->name) }}"
                class="w-full px-4 py-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                placeholder="Enter city name">
            @error('name') <span class="text-red-500 text-sm">{{ $message }}</span> @enderror
        </div>

        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
            Update City
        </button>
    </form>
</x-app-layout>