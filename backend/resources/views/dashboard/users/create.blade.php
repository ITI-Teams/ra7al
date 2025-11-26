<x-app-layout>
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold mb-6">Add User</h1>

        <a href="{{ route('users.index') }}"
           class="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-500 transition">
            <i class="fa fa-arrow-left"></i> Back
        </a>

    </div>


    <form method="POST"
          action="{{ route('users.store') }}"
          enctype="multipart/form-data"
          class="bg-white dark:bg-slate-800 shadow-lg rounded-xl p-6 border dark:border-slate-700">
        @csrf

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Avatar -->
            <div>
                <label class="block mb-1 font-semibold">Avatar</label>
                <input type="file" name="avatar"
                       class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700
                  border dark:border-slate-600 @error('avatar') border-red-500 @enderror">

                @error('avatar')
                <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Name -->
            <div>
                <label class="block mb-1 font-semibold">Name</label>
                <input type="text" name="name" value="{{ old('name') }}"
                       class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700
                              border dark:border-slate-600 @error('name') border-red-500 @enderror">

                @error('name')
                <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Email -->
            <div>
                <label class="block mb-1 font-semibold">Email</label>
                <input type="email" name="email" value="{{ old('email') }}"
                       class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700
                              border dark:border-slate-600 @error('email') border-red-500 @enderror">

                @error('email')
                <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Phone -->
            <div>
                <label class="block mb-1 font-semibold">Phone</label>
                <input type="text" name="phone" value="{{ old('phone') }}"
                       class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700
                              border dark:border-slate-600 @error('phone') border-red-500 @enderror">

                @error('phone')
                <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Role -->
            <div>
                <label class="block mb-1 font-semibold">Role</label>
                <select name="role"
                        class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700
                               border dark:border-slate-600 @error('role') border-red-500 @enderror">
                    @foreach($roles as $role)
                        <option value="{{ $role->name }}"
                            {{ old('role') == $role->name ? 'selected' : '' }}>
                            {{ ucfirst($role->name) }}
                        </option>
                    @endforeach
                </select>

                @error('role')
                <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Password -->
            <div>
                <label class="block mb-1 font-semibold">Password</label>
                <input type="password" name="password"
                       class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700
                              border dark:border-slate-600 @error('password') border-red-500 @enderror">

                @error('password')
                <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

            <!-- Confirm Password -->
            <div>
                <label class="block mb-1 font-semibold">Confirm Password</label>
                <input type="password" name="password_confirmation"
                       class="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-700
                              border dark:border-slate-600">

                @error('password_confirmation')
                <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                @enderror
            </div>

        </div>

        <button class="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500">
            Save User
        </button>

    </form>
</x-app-layout>
