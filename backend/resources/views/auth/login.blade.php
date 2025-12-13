<x-guest-layout>

    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <div class="flex flex-col md:flex-row w-full h-screen
                bg-gradient-to-br from-[#f7f2ff] to-white ">

        <!-- LEFT IMAGE -->
        <div class="relative w-full md:w-1/2 h-1/2 md:h-full order-2 md:order-1">
            <img src="/assets/auth.avif"
                class="w-full h-full object-cover rounded-b-3xl md:rounded-none shadow-lg"
                alt="Login Image" />

            <!-- overlay mobile -->
            <div class="md:hidden absolute inset-0 bg-black/50"></div>
        </div>

        <!-- RIGHT FORM -->
        <div class="w-full min-h-screen z-30 absolute md:static md:w-1/2 flex items-center justify-center
                    p-8 md:p-20 order-1 md:order-2">

            <div class="w-full max-w-md bg-white/40  backdrop-blur-xl
                        shadow-xl rounded-3xl p-8 md:p-10 border border-white/30 ">

                <h2 class="text-4xl font-extrabold mb-8 text-center
                           bg-gradient-to-r from-[#5e1fbf] to-[#9b4dff]
                           text-transparent bg-clip-text">
                    Sign in
                </h2>

                <form method="POST" action="{{ route('login') }}" class="space-y-7">
                    @csrf

                    <!-- Email -->
                    <div>
                        <label class="text-purple-700  text-[15px] font-medium mb-1 block">
                            Email
                        </label>

                        <input id="email" type="email" name="email"
                            value="{{ old('email') }}" required autocomplete="email"
                            placeholder="Enter your email"
                            class="w-full bg-white/40  px-5 py-3.5 rounded-xl
                                   border border-[#7a30e3]/40 text-gray-900
                                   shadow-sm focus:ring-2 focus:ring-[#7a30e3] outline-none transition
                                   @error('email') border-red-500 @enderror">

                        @error('email')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Password -->
                    <div>
                        <label class="text-purple-700  text-[15px] font-medium mb-1 block">
                            Password
                        </label>

                        <div class="relative">
                            <input id="password" type="password" name="password" required
                                autocomplete="current-password"
                                placeholder="Enter password"
                                class="w-full bg-white/40  px-5 py-3.5 pr-12 rounded-xl
                                       border border-[#7a30e3]/40 text-gray-900
                                       shadow-sm focus:ring-2 focus:ring-[#7a30e3] outline-none transition
                                       @error('password') border-red-500 @enderror">

                            <!-- Toggle Eye -->
                            <button type="button" onclick="togglePassword()"
                                class="absolute right-4 top-1/2 -translate-y-1/2 text-[#5e1fbf]
                                       hover:text-[#4a18a2] transition">
                                <svg id="eye-icon" xmlns="http://www.w3.org/2000/svg"
                                    class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0
                                           8.268 2.943 9.542 7-1.274 4.057-5.065
                                           7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>

                        @error('password')
                            <p class="text-red-400 text-sm mt-1">{{ $message }}</p>
                        @enderror
                    </div>

                    <!-- Remember + Forgot -->
                    <div class="flex items-center justify-between">
                        <label class="flex items-center text-sm text-purple-700  cursor-pointer">
                            <input id="remember_me" name="remember" type="checkbox"
                                class="h-4 w-4 rounded border-purple-600 bg-white  text-purple-600
                                       focus:ring-purple-500"
                                {{ old('remember') ? 'checked' : '' }}>
                            <span class="ml-3">Remember me</span>
                        </label>

                        <a href="{{ route('password.request') }}"
                            class="text-purple-600  text-sm hover:underline">
                            Forgot password?
                        </a>
                    </div>

                    <!-- Button -->
                    <button type="submit"
                        class="w-full py-3.5 text-[16px] font-semibold rounded-xl text-white
                               bg-gradient-to-r from-[#5e1fbf] to-[#7a30e3]
                               hover:opacity-90 transition shadow-lg">
                        Sign in
                    </button>

                </form>
            </div>
        </div>
    </div>

    <script>
        function togglePassword() {
            const input = document.getElementById("password");
            const icon = document.getElementById("eye-icon");

            if (input.type === "password") {
                input.type = "text";
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7
                        a10.056 10.056 0 012.302-3.668m1.992-1.992A9.967 9.967 0 0112 5c4.477
                        0 8.268 2.943 9.542 7a10.05 10.05 0 01-1.455 2.847M15 12a3
                        3 0 11-6 0 3 3 0 016 0z" />
                `;
            } else {
                input.type = "password";
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0
                           8.268 2.943 9.542 7-1.274 4.057-5.065
                           7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                `;
            }
        }
    </script>

</x-guest-layout>
