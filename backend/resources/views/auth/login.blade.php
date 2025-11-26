<x-guest-layout>
    <!-- Session Status -->
    <x-auth-session-status class="mb-4" :status="session('status')" />

    <div>
        <div class="grid lg:grid-cols-5 md:grid-cols-2 items-center gap-y-4 h-full">

            <!-- LEFT SIDE IMAGE -->
            <div
                class="max-md:order-1 lg:col-span-3 md:h-screen w-full bg-[#000842] md:rounded-tr-xl md:rounded-br-xl lg:p-0 p-0">
                <img src="{{ Storage::url('admin/login.png') }}" class="w-full h-full object-cover block mx-auto"
                    alt="login-image" />
            </div>

            <!-- RIGHT SIDE FORM -->
            <div class="lg:col-span-2 w-full p-10 bg-[#0b0b14] h-screen flex flex-col justify-center">
                <form method="POST" action="{{ route('login') }}">
                    @csrf

                    <div class="space-y-8">

                        <!-- EMAIL -->
                        <div>
                            <label for="email" class="text-yellow-400 text-[15px] font-medium mb-1 block">Email</label>
                            <div class="relative flex items-center">
                                <input id="email" name="email" type="email" value="{{ old('email') }}" required
                                    autocomplete="email" class="w-full text-sm text-white bg-[#14141f] pl-4 pr-10 py-3.5 rounded-md border outline-none transition-all duration-300
                   @error('email') border-red-500 @enderror" style="
                border-image: linear-gradient(to bottom, #D4AF37 0%, #C49A2C 35%, #8F6A15 80%, #5E450C 100%) 1;
                box-shadow: inset 0 0 6px rgba(212,175,55,0.2);
            " onfocus="this.style.boxShadow='0 0 12px rgba(212,175,55,0.55), inset 0 0 8px rgba(212,175,55,0.4)'; this.style.background='#1a1a27'"
                                    onblur="this.style.boxShadow='inset 0 0 6px rgba(212,175,55,0.2)'; this.style.background='#14141f'"
                                    placeholder="Enter email" />
                            </div>
                            @error('email')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <!-- PASSWORD -->
                        <div>
                            <label for="password"
                                class="text-yellow-400 text-[15px] font-medium mb-1 block">Password</label>
                            <div class="relative flex items-center">
                                <input id="password" name="password" type="password" required
                                    autocomplete="current-password" class="w-full text-sm text-white bg-[#14141f] pl-4 pr-10 py-3.5 rounded-md border outline-none transition-all duration-300
                @error('password') border-red-500 @enderror" style="
                border-image: linear-gradient(to bottom, #D4AF37 0%, #C49A2C 35%, #8F6A15 80%, #5E450C 100%) 1;
                box-shadow: inset 0 0 6px rgba(212,175,55,0.2);
            " onfocus="this.style.boxShadow='0 0 12px rgba(212,175,55,0.55), inset 0 0 8px rgba(212,175,55,0.4)'; this.style.background='#1a1a27'"
                                    onblur="this.style.boxShadow='inset 0 0 6px rgba(212,175,55,0.2)'; this.style.background='#14141f'"
                                    placeholder="Enter password" />

                                <!-- Show password button -->
                                <button type="button" onclick="togglePassword()"
                                    class="absolute right-2 text-yellow-400 hover:text-yellow-300">
                                    <svg id="eye-icon" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                            @error('password')
                            <p class="text-red-500 text-sm mt-1">{{ $message }}</p>
                            @enderror
                        </div>

                        <script>
                            function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a10.056 10.056 0 012.302-3.668m1.992-1.992A9.967 9.967 0 0112 5c4.477 0 8.268 2.943 9.542 7a10.05 10.05 0 01-1.455 2.847M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        `;
    }
}
                        </script>

                        <!-- REMEMBER ME -->
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div class="flex items-center">
                                <input id="remember_me" name="remember" type="checkbox"
                                    class="h-4 w-4 shrink-0 rounded-md cursor-pointer transition"
                                    style="accent-color: #D4AF37; border: 2px solid #C49A2C; box-shadow: inset 0 0 6px rgba(212,175,55,0.3);"
                                    onfocus="this.style.boxShadow='0 0 10px rgba(212,175,55,0.6)'"
                                    onblur="this.style.boxShadow='inset 0 0 6px rgba(212,175,55,0.3)'" {{
                                    old('remember') ? 'checked' : '' }} />
                                <label for="remember_me" class="ml-3 block text-[15px] text-white">
                                    Remember me
                                </label>
                            </div>
                            <div>
                                <a href="{{ route('password.request') }}"
                                    class="text-yellow-400 font-medium text-sm hover:underline">
                                    Forgot Password?
                                </a>
                            </div>
                        </div>

                        <!-- GOLD LOGIN BUTTON -->
                        <button type="submit"
                            class="w-full py-3 text-[16px] font-semibold tracking-wide rounded-md text-white transition-all duration-300"
                            style="
                        background: linear-gradient(
                            to bottom,
                            #D4AF37 0%,
                            #C49A2C 20%,
                            #B4851F 45%,
                            #8F6A15 75%,
                            #5E450C 100%
                        );
                        box-shadow: 
                            inset 0 2px 8px rgba(255, 220, 130, 0.35),
                            inset 0 -2px 6px rgba(0, 0, 0, 0.55),
                            0 0 10px rgba(212, 175, 55, 0.5),
                            0 0 18px rgba(180, 133, 31, 0.3);
                        border: 1px solid #C49A2C;
                    " onmouseover="this.style.boxShadow='inset 0 2px 10px rgba(255, 235, 160, 0.55), inset 0 -3px 8px rgba(0,0,0,0.7), 0 0 18px rgba(212, 175, 55, 0.9), 0 0 28px rgba(180, 133, 31, 0.7)'"
                            onmouseout="this.style.boxShadow='inset 0 2px 8px rgba(255, 220, 130, 0.35), inset 0 -2px 6px rgba(0,0,0,0.55), 0 0 10px rgba(212, 175, 55, 0.5), 0 0 18px rgba(180, 133, 31, 0.3)'">
                            Sign in
                        </button>
                </form>
            </div>
        </div>
    </div>
</x-guest-layout>