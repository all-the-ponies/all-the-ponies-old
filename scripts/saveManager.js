// import * as Papa from ''
// import Papa from "./papaparse.js"

import csv from "./csv.js"
import api from "./api.js"
import { toTitleCase } from "./common.js"

export default class SaveManager {
    STRUCTURE = {
        version: 1,
        player_info: {
            join_date: '',
            total_playtime: 0,
        },
        inventory: {
            categories: {
                ponies: {},
                shops: {},
            }
        },
        notes: {},
        lists: []
    }
    OBJECT_STRUCTURES = {
        ponies: {
            owned: false,
            stars: 0,
            minigame: '',
        }
    }
    localStorageKey = 'save'
    
    constructor() {
        this.reset()

        this.loadFromLocalStorage()
    }

    reset() {
        this.data = structuredClone(this.STRUCTURE)
    }

    loadFromLocalStorage() {
        const localStorageData = localStorage.getItem(this.localStorageKey)

        if (localStorageData != null) {
            this.data = JSON.parse(localStorageData)
        }

        if ('total_playtime' in this.data) {
            this.data.player_info = {
                join_date: '',
                total_playtime: this.data.total_playtime,
            }
            delete this.data.total_playtime
            this.saveToLocalStorage()
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

    get houses() {
        const houses = []
        for (let pony of Object.keys(this.data.inventory.categories.ponies)) {
            const house = gameData.getObject(pony, 'ponies').house
            if (!houses.includes(house)) {
                houses.push(house)
            }
        }

        return houses
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

    setOwned(id, owned = true, level = null) {
        const object = gameData.getObject(id)

        if (!owned) {
            this.removeObject(id, object.category)
        } else {
            const info = structuredClone(this.getInfo(id) || this.OBJECT_STRUCTURES[object.category] || {owned: false})
    
            if (object.category == 'ponies') {
                if (object.max_level) {
                    info.stars = 5
                } else if (level !== null) {
                    info.stars = level
                } else if (!('stars' in info)) {
                    info.stars = 0
                }
            }
    
            info.owned = true

            this.setInfo(id, object.category, info)
        }

        this.saveToLocalStorage()
    }

    async importFromCloud(friendCode) {
        const saveData = await api.getSave(friendCode)

        if ('detail' in saveData) {
            throw Error(saveData['detail'])
        }
        
        this.reset()

        this.data.player_info.join_date = saveData.player_info.join_date
        this.data.player_info.total_playtime = saveData.player_info.total_playtime

        for (let pony of saveData.inventory.ponies) {
            this.setOwned(
                pony.id,
                true,
                pony.level,
            )
        }

        for (let shopId of saveData.inventory.shops) {
            this.setOwned(
                shopId
            )
        }
    }

    export(format, options = {}) {
        switch (format) {
            case 'csv':
                return this.exportCSV(options.category || 'ponies')
        }
    }

    exportCSV(category) {
        const HEADERS = {
            ponies: ['ID', 'Name', 'Location', 'House', 'Stars', 'Pro', 'Changeling'],
            houses: ['ID', 'Name', 'Location'],
            shops: ['ID', 'Name', 'Location'],
        }
        
        const table = [HEADERS[category]]

        switch (category) {
            case 'ponies':
                for (let [id, info] of Object.entries(this.data.inventory.categories.ponies)) {
                    if (!info.owned) {
                        continue
                    }
                    const row = [id]
                    const pony = gameData.getObject(id, 'ponies')
                    row.push(app.translate(pony.name))
                    row.push(toTitleCase(app.translate(pony.location)))
                    const house = gameData.getObject(pony.house, 'houses')
                    row.push(app.translate(house.name))
                    row.push(info.stars)
                    let pro = pony.pro
                    if (pro === 'random') {
                        row.push(pro)
                    } else if (pro in gameData.gameData.group_quests.quests) {
                        row.push(app.translate(gameData.gameData.group_quests.quests[pro].name))
                    } else {
                        row.push('')
                    }

                    if (pony.changeling.is_changeling) {
                        let changeling = gameData.getObject(pony.changeling.id, 'ponies')
                        row.push(app.translate(changeling.name))
                    } else {
                        row.push('')
                    }

                    table.push(row)
                }
                break
        }

        return csv.writeCSV(table)
    }
}
