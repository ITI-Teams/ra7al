import Alpine from 'alpinejs'
window.Alpine = Alpine

document.addEventListener('alpine:init', () => {
    Alpine.store('sidebar', {
        open: true,

        init() {
            const saved = localStorage.getItem('sidebarOpen')
            this.open = saved !== null ? JSON.parse(saved) : true
        },

        toggle() {
            this.open = !this.open
            localStorage.setItem('sidebarOpen', this.open)
        }
    })

    Alpine.store('theme', {
        dark: false,

        init() {
            const saved = localStorage.getItem('theme')
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

            this.dark = saved ? saved === 'dark' : prefersDark
            this.apply()
        },

        toggle() {
            this.dark = !this.dark
            this.apply()
            localStorage.setItem('theme', this.dark ? 'dark' : 'light')
        },

        apply() {
            if (this.dark) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        }
    })
})

document.addEventListener('DOMContentLoaded', () => {
    Alpine.start()
})
