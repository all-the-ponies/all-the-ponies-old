export default class Page {
    showScrollToTop = true
    
    layout = 'layout.html'

    constructor() {
        this.running = false
        
        this.content = document.getElementById('page-content')
        this.languageSelector = document.getElementById('language')
    }

    get language() {
        return this.languageSelector.value
    }

    async load(path) {
        this.running = true
        const response = await fetch(this.layout)
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const text = await response.text()
        this.content.innerHTML = text
        window.scrollTo(0,0)
    }
    async reload(path) {
        window.scrollTo(0,0)
    }
    async update(path) {}
    async unload(path) {
        this.running = false
    }
}
