<x-app-layout>
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Properties</h1>
    </div>

    <!-- Search -->
    <div class="mb-4">
        <input id="searchInput"
               type="text"
               placeholder="Search properties..."
               class="w-full px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border dark:border-slate-700 focus:ring focus:ring-indigo-300 dark:text-white">
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-slate-800 border dark:border-slate-700">
        <table class="w-full text-left">
            <thead class="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
            <tr>
                <th class="px-4 py-3">Title</th>
                <th class="px-4 py-3">City</th>
                <th class="px-4 py-3">Owner</th>
                <th class="px-4 py-3">Price</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Actions</th>
            </tr>
            </thead>

            <tbody id="tableData">
            @foreach($properties as $property)
                <tr class="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                    <td class="px-4 py-3">{{ $property->title }}</td>
                    <td class="px-4 py-3">{{ $property->city->name }}</td>
                    <td class="px-4 py-3">{{ $property->owner->name }}</td>
                    <td class="px-4 py-3">{{ $property->price }}</td>

                    <td class="px-4 py-3">
                        <span class="px-3 py-1 text-sm rounded-full
                            @if($property->admin_approval_status == 'approved') bg-green-600/20 text-green-600
                            @elseif($property->admin_approval_status == 'rejected') bg-red-600/20 text-red-600
                            @else bg-yellow-600/20 text-yellow-600
                            @endif">
                            {{ ucfirst($property->admin_approval_status) }}
                        </span>
                    </td>

                    <td class="px-4 py-3 flex gap-2">

                        <!-- Details Button -->
                        <button onclick="openModal('{{ $property->id }}')"
                                class="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500">
                            Details
                        </button>

                        <!-- Approve -->
                        <form method="POST" action="{{ route('properties.approve', $property->id) }}">
                            @csrf
                            <button class="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-500">
                                Approve
                            </button>
                        </form>

                        <!-- Reject -->
                        <form method="POST" action="{{ route('properties.reject', $property->id) }}">
                            @csrf
                            <button class="px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-500">
                                Reject
                            </button>
                        </form>

                        <!-- Delete -->
                        <form method="POST" action="{{ route('properties.destroy', $property->id) }}">
                            @csrf
                            @method('DELETE')
                            <button
                                @click="$dispatch('confirm-delete', { url: '{{ route('properties.destroy', $property->id) }}', name:'property' })"
                                type="button"
                                class="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-500">
                                Delete
                            </button>
                        </form>

                    </td>
                </tr>

                <!-- Modal -->
                <div id="modal-{{ $property->id }}" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <!-- Header -->
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">{{ $property->title }}</h2>
                                <div class="flex items-center mt-2">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-medium rounded-full">
                        {{ ucfirst($property->accommodation_type ?? 'Apartment') }}
                    </span>
                                    @if($property->is_verified)
                                        <span class="ml-2 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-sm font-medium rounded-full">
                            Verified
                        </span>
                                    @endif
                                </div>
                            </div>
                            <button onclick="closeModal('{{ $property->id }}')"
                                    class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <!-- Images Gallery -->
                        @if($property->images && $property->images->count() > 0)
                            <div class="mb-6">
                                <div class="grid grid-cols-2 gap-2">
                                    @foreach($property->images->take(4) as $image)
                                        <div class="{{ $loop->first ? 'col-span-2' : '' }}">
                                            <img src="{{ asset('storage/' . $image->path) }}"
                                                 alt="Property Image {{ $loop->iteration }}"
                                                 class="w-full h-48 object-cover rounded-lg {{ $loop->first ? 'h-64' : 'h-32' }}">
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        @endif

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Left Column: Basic Info -->
                            <div>
                                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Basic Information</h3>

                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Price per Month:</span>
                                        <span class="font-bold text-green-600 dark:text-green-400">${{ number_format($property->price, 2) }}</span>
                                    </div>

                                    <div class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Security Deposit:</span>
                                        <span class="font-medium">${{ number_format($property->security_deposit ?? 0, 2) }}</span>
                                    </div>

                                    <div class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Available From:</span>
                                        <span>{{ \Carbon\Carbon::parse($property->available_from)->format('M d, Y') }}</span>
                                    </div>

                                    @if($property->available_to)
                                        <div class="flex justify-between">
                                            <span class="text-gray-600 dark:text-gray-400">Available Until:</span>
                                            <span>{{ \Carbon\Carbon::parse($property->available_to)->format('M d, Y') }}</span>
                                        </div>
                                    @endif

                                    <div class="flex justify-between">
                                        <span class="text-gray-600 dark:text-gray-400">Minimum Stay:</span>
                                        <span>{{ $property->minimum_stay_months ?? 1 }} month(s)</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Column: Property Details -->
                            <div>
                                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Property Details</h3>

                                <div class="grid grid-cols-2 gap-3">
                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                        </svg>
                                        <span>{{ $property->total_rooms }} Rooms</span>
                                    </div>

                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                        <span>{{ $property->available_rooms }} Available</span>
                                    </div>

                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                                        </svg>
                                        <span>{{ $property->bathrooms_count }} Bathrooms</span>
                                    </div>

                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                        </svg>
                                        <span>{{ $property->beds }} Beds</span>
                                    </div>

                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        <span>{{ $property->size ?? 'N/A' }} m²</span>
                                    </div>

                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                        </svg>
                                        <span>{{ $property->available_spots }} Spots</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Location & Requirements -->
                        <div class="mt-6">
                            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Location & Requirements</h3>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <div class="flex items-center mb-2">
                                        <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        </svg>
                                        <span class="font-medium">Address</span>
                                    </div>
                                    <p class="text-gray-600 dark:text-gray-400">{{ $property->address }}</p>

                                    <div class="mt-3">
                                        <span class="text-gray-600 dark:text-gray-400">City:</span>
                                        <span class="font-medium ml-2">{{ $property->city->name ?? 'N/A' }}</span>
                                    </div>

                                    <div>
                                        <span class="text-gray-600 dark:text-gray-400">Area:</span>
                                        <span class="font-medium ml-2">{{ $property->area->name ?? 'N/A' }}</span>
                                    </div>
                                </div>

                                <div>
                                    <div class="mb-3">
                                        <span class="text-gray-600 dark:text-gray-400">Gender Requirement:</span>
                                        <span class="font-medium ml-2 capitalize">{{ $property->gender_requirement }}</span>
                                    </div>

                                    <div class="flex items-center mb-2">
                                        <span class="text-gray-600 dark:text-gray-400 mr-4">Smoking:</span>
                                        <span class="{{ $property->smoking_allowed ? 'text-green-600' : 'text-red-600' }}">
                            {{ $property->smoking_allowed ? 'Allowed' : 'Not Allowed' }}
                        </span>
                                    </div>

                                    <div class="flex items-center">
                                        <span class="text-gray-600 dark:text-gray-400 mr-4">Pets:</span>
                                        <span class="{{ $property->pets_allowed ? 'text-green-600' : 'text-red-600' }}">
                            {{ $property->pets_allowed ? 'Allowed' : 'Not Allowed' }}
                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="mt-6">
                            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Description</h3>
                            <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {{ $property->description }}
                                </p>
                            </div>
                        </div>

                        <!-- Amenities -->
                        @if($property->amenities && $property->amenities->count() > 0)
                            <div class="mt-6">
                                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Amenities</h3>
                                <div class="flex flex-wrap gap-2">
                                    @foreach($property->amenities as $amenity)
                                        <span class="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                    {{ $amenity->name }}
                </span>
                                    @endforeach
                                </div>
                            </div>
                        @endif

                        <!-- University Info -->
                        @if($property->university)
                            <div class="mt-6">
                                <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Nearby Universities</h3>
                                <p class="text-gray-600 dark:text-gray-400">{{ $property->university }}</p>
                            </div>
                        @endif

                        <!-- Contact Info -->
                        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Contact Information</h3>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                @if($property->contact_phone)
                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                        </svg>
                                        <div>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                            <p class="font-medium">{{ $property->contact_phone }}</p>
                                        </div>
                                    </div>
                                @endif

                                @if($property->contact_email)
                                    <div class="flex items-center">
                                        <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                        <div>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                            <p class="font-medium">{{ $property->contact_email }}</p>
                                        </div>
                                    </div>
                                @endif
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="mt-8 flex justify-end space-x-4">
                            <button onclick="closeModal('{{ $property->id }}')"
                                    class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>


            @endforeach
            </tbody>
        </table>
    </div>

    <div class="mt-6">
        {{ $properties->links() }}
    </div>

    <script>
        function openModal(id) {
            document.getElementById('modal-' + id).classList.remove('hidden');
        }

        function closeModal(id) {
            document.getElementById('modal-' + id).classList.add('hidden');
        }

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
