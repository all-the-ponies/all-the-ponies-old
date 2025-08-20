export default class SaveManager {
    STRUCTURE = {
        version: 1,
        inventory: {
            categories: {}
        },
        notes: {},
        lists: []
    }
    OBJECT_STRUCTURES = {
        'ponies': {
            owned: false,
            stars: 0,
            minigame: '',
        }
    }
    localStorageKey = 'save'
    
    constructor() {
        this.data = structuredClone(this.STRUCTURE)

        this.loadFromLocalStorage()
    }

    loadFromLocalStorage() {
        const localStorageData = localStorage.getItem(this.localStorageKey)

        if (localStorageData != null) {
            this.data = JSON.parse(localStorageData)
        }
    }

    saveToLocalStorage() {
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.data))
    }

    getNotes(id) {
        return this.data.notes[id] || ''
    }

    setNote(id, note) {
        this.data.notes[id] = note
        this.saveToLocalStorage()
    }

    getInfo(id) {
        for (let category of Object.values(this.data.inventory.categories)) {
            if (id in category) {
                return structuredClone(category[id])
            }
        }
    }

    removeObject(id, category) {
        if (this.data.inventory.categories[category][id]) {
            delete this.data.inventory.categories[category][id]
        }
    }

    setInfo(id, category, data) {
        if (!this.data.inventory.categories[category]) {
            this.data.inventory.categories[category] = {}
        }
        this.data.inventory.categories[category][id] = data
        this.saveToLocalStorage()
    }

    owned(id) {
        const info = this.getInfo(id)
        return info != null && info.owned
    }

    setOwned(id, owned = true) {
        const object = gameData.getObject(id)

        if (!owned) {
            this.removeObject(id, object.category)
        } else {
            const info = structuredClone(this.getInfo(id) || this.OBJECT_STRUCTURES[object.category] || {owned: false})
    
            if (object.category == 'ponies') {
                if (object.max_level) {
                    info.stars = 5
                } else if (!('stars' in info)) {
                    info.stars = 0
                }
            }
    
            info.owned = true

            this.setInfo(id, object.category, info)
        }

        this.saveToLocalStorage()
    }
}
