import Alpine from "alpinejs";

window.Alpine = Alpine;

window.themeData = function () {
    return {
        dark: false,
        open: true,

        init() {
            const saved = localStorage.getItem('theme');
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.dark = saved ? saved === 'dark' : systemDark;

            this.applyTheme();
        },

        toggleDarkMode() {
            this.dark = !this.dark;
            if(this.dark){
                document.body.classList.add('dark');
            } else {
                document.body.classList.remove('dark');
            }
            localStorage.setItem('theme', this.dark ? 'dark' : 'light');
            this.applyTheme();
        },

        applyTheme() {
            if (this.dark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }
}

Alpine.start();
