import { loadJSON, normalize, fixName, toTitleCase, LOC } from "./common.js"
import './jquery-3.7.1.min.js'

export default class GameData {
    constructor(
        gameDataPath,
        options = {
            ignoreSpaces: true,
            caseSensitive: false,
            ignoreAccents: true,
            ignorePunctuation: true,
            includeUnused: true,
        }) {
        this.gameDataPath = gameDataPath
        this.options = {
            ignoreSpaces: true,
            caseSensitive: false,
            ignoreAccents: true,
            ignorePunctuation: true,
            includeUnused: true,
            ...options,
        }
        this.gameData = loadJSON(this.gameDataPath)
        this._language = 'english'

        this.languages = this.gameData.languages

        this.categories = this.gameData.categories

        this.ponies = {}

        this.updatePonies()
    }

    get language() {
        return this._language
    }

    set language(language) {
        this._language = language
    }

    generateFilteredList(options = {
            ignoreSpaces: true,
            caseSensitive: false,
            ignoreAccents: true,
            ignorePunctuation: true,
            includeUnused: true,
        }) {
        
        options = {
            ignoreSpaces: true,
            caseSensitive: false,
            ignoreAccents: true,
            ignorePunctuation: true,
            includeUnused: true,
            ...options,
        }

        let result = {
            namesMap: {},
            altNames: {},
            totalPonies: 0,
        }

        for (let [ponyId, ponyInfo] of Object.entries(this.ponies)) {
            if (!options.includeUnused && (ponyInfo.tags?.includes('unused') || ponyInfo.tags?.includes('npc') || ponyInfo.tags?.includes('quest'))) {
                console.log('skipping', ponyId)
                continue
            }

            let name = fixName(ponyInfo.name[this.language])
            let newName = name
            let nameId = this.transformName(newName, options)

            let isChangeling = !!ponyInfo.changeling?.id
            if (nameId in result.namesMap) {
                if (isChangeling) {
                    console.log('is changeling', ponyId)
                    continue
                }

                newName = `${name} (${toTitleCase(LOC.translate(ponyInfo.location))})`
                nameId = this.transformName(newName, options)

                if (nameId in result.namesMap) {
                    console.log('duplicate found', ponyId, newName)
                    continue
                }
            }

            result.namesMap[nameId] = {
                id: ponyId,
                name: newName,
            }

            result.totalPonies += 1

            if (typeof ponyInfo.alt_name != 'undefined' && typeof ponyInfo.alt_name[this.language] != 'undefined') {
                for (let name of ponyInfo.alt_name[this.language]) {
                    newName = name
                    nameId = this.transformName(newName, options)
                    
                    if (nameId in result.altNames) {
                        if (isChangeling) {
                            console.log('is changeling', ponyId)
                            continue
                        }

                        newName = `${name} (${toTitleCase(LOC.translate(ponyInfo.location))})`
                        nameId = this.transformName(newName, options)

                        if (nameId in result.altNames) {
                            console.log('duplicate found', ponyId, newName)
                            continue
                        }
                    }

                    result.altNames[nameId] = {
                        id: ponyId,
                        name: newName,
                    }
                }
            }
        }

        return result
    }

    updatePonies() {
        for (let category of Object.values(this.categories)) {
            for (let [id, item] of Object.entries(category.items)) {
                item.id = id
            }
        }
        
        
        this.ponies = {}

        for (let [ponyId, ponyInfo] of Object.entries(this.gameData.categories.ponies.items)) {
            
            let searchNames = [
                this.transformName(
                    fixName(ponyInfo.name[this.language])
                )
            ]

            if ('alt_name' in ponyInfo && this.language in ponyInfo.alt_name) {
                for (let altName of ponyInfo.alt_name[this.language]) {
                    console.log(altName)
                    searchNames.push(
                        this.transformName(
                            fixName(altName)
                        )
                    )
                }
            }
            
            this.ponies[ponyId] = {
                ...structuredClone(ponyInfo),
                id: ponyId,
                search_names: searchNames,
            }
        }
    }

    transformName(name, options = {
            ignoreSpaces: true,
            caseSensitive: false,
            ignoreAccents: true,
            ignorePunctuation: true,
            includeUnused: true,
        }) {
            
        options = {
            ignoreSpaces: true,
            caseSensitive: false,
            ignoreAccents: true,
            ignorePunctuation: true,
            includeUnused: true,
            ...options,
        }

        if (!options.caseSensitive) {
            name = name.toLocaleLowerCase()
        }
        if (options.ignorePunctuation) {
            name = name.replaceAll('-', ' ')
            name = name.replaceAll(/[,.()"']/gm, '')
        }
        if (options.ignoreAccents) {
            name = normalize(name)
        }
        if (options.ignoreSpaces) {
            name = name.replaceAll(' ', '')
        }

        return name
    }

    matchName(name, category = 'ponies') {
        let transformedName = this.transformName(name)
        if (transformedName in this.filteredPonyNameMap || transformedName in this.filteredAltPonyNames) {
            let pony = transformedName in this.filteredAltPonyNames ? this.filteredAltPonyNames[transformedName] : this.filteredPonyNameMap[transformedName]
            return this.getItem(pony.id, 'ponies', pony.name)
        }

        return null
    }

    searchName(name, category = 'ponies') {
        if (!(category in this.categories)) {
            throw RangeError(`Category ${category} does not exist`)
        }
        
        const items = this.categories[category].items

        name = this.transformName(name)
        if (name == '') {
            return Object.keys(items)
        }
        let result = []

        function addResult(id) {
            if (!result.includes(id)) {
                result.push(id)
            }
        }

        for (let item of Object.values(items)) {
            if (this.transformName(fixName(item.name[this.language])).includes(name)) {
                addResult(item.id)
            } else if (item.alt_name && item.alt_name[this.language] && item.alt_name[this.language].some((searchName) => this.transformName(fixName(searchName)).includes(name))) {
                addResult(item.id)
            } else if (this.transformName(item.id).includes(name)) {
                addResult(item.id)
            }
        }
        return result
    }

    getItem(id, category = 'ponies', usedName = null) {
        if (!this.categories[category]?.items[id]) {
            return null
        }
        return {
            ...structuredClone(this.categories[category]?.items[id]),
            usedName: usedName,
        }
    }
}
