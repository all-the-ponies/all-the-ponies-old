import { loadJSON, createElement, getUrlParameter, LOC, setUrlParameter, toTitleCase, setURL, CATEGORIES, getCurrentScroll, formatTime, downloadFile } from "../scripts/common.js";
import Page from "../scripts/page.js"
import '../scripts/jquery-3.7.1.min.js'

import { objectCard } from "../scripts/components/object-card.js";

export default class InventoryPage extends Page {
    category = 'ponies'
    categories = ['ponies', 'houses', 'shops']


    // layout = '/search/layout.html'

    searchQuery = ''
    searchScroll = 0

    filters = {
        ponies: {
            playable: {
                name: LOC.dictionary['PLAYABLE_CHARACTERS'],
                type: 'bool',
                default: true,
                test: (object) => object.tags.length == 0,
            },
            pro: {
                name: LOC.dictionary['PRO_PONIES'],
                type: 'bool',
                default: true,
                test: (object) => object.pro != null,
            },
            unused: {
                name: LOC.dictionary['UNUSED_CHARACTERS'],
                type: 'bool',
                default: false,
                test: (object) => object.tags.includes('unused'),
            },
            npc: {
                name: LOC.dictionary['NPC_CHARACTERS'],
                type: 'bool',
                default: false,
                test: (object) => object.tags.includes('npc'),
            },
            quest: {
                name: LOC.dictionary['QUEST_CHARACTERS'],
                type: 'bool',
                default: false,
                test: (object) => object.tags.includes('quest'),
            },
        },

        decor: {
            regular: {
                name: LOC.dictionary['REGULAR_DECOR'],
                type: 'bool',
                default: true,
                test: (object) => !object.pro.is_pro,
            },
            pro: {
                name: LOC.dictionary['PRO_DECOR'],
                type: 'bool',
                default: true,
                test: (object) => object.pro.is_pro,
            },
        },
    }

    sorters = {
        ponies: {
            index: {
                name: {english: 'Game order'},
                check: (a, b) => a.index - b.index,
            },
            name: {
                name: {english: 'Alphabetically'},
                check: (a, b) => app.localeCompare(
                    app.translate(a.name),
                    app.translate(b.name),
                ),
            },
        },
        houses: {
            index: {
                name: {english: 'Game order'},
                check: (a, b) => a.index - b.index,
            },
            name: {
                name: {english: 'Alphabetically'},
                check: (a, b) => app.localeCompare(
                    app.translate(a.name),
                    app.translate(b.name),
                ),
            },
        },
        shops: {
            index: {
                name: {english: 'Game order'},
                check: (a, b) => a.index - b.index,
            },
            name: {
                name: {english: 'Alphabetically'},
                check: (a, b) => app.localeCompare(
                    app.translate(a.name),
                    app.translate(b.name),
                ),
            },
        },
        decor: {
            index: {
                name: {english: 'Game order'},
                check: (a, b) => a.index - b.index,
            },
            name: {
                name: {english: 'Alphabetically'},
                check: (a, b) => app.localeCompare(
                    app.translate(a.name),
                    app.translate(b.name),
                ),
            },
        }
    }
    
    async load(path) {
        await super.load(path)

        this.searchSection = $('#search-section')
        this.searchBar = $('#search-bar')
        this.searchResultsElement = $('#search-results')
        
        this.appliedFilters = {}
        this.sortMethod = 'index'
        this.reverseSort = false
        
        this.elementCache = {}

        document.getElementById('filter-button').addEventListener('click', () => {
            this.showFilterDialog()
        })
        document.getElementById('sort-button').addEventListener('click', () => {
            this.showSortDialog()
        })
        document.getElementById('category-selector').addEventListener('change', (e) => {
            this.category = e.target.value
            this.updateFilters()
            this.createSearchCards()
        })

        document.querySelector('#filters-dialog .dialog-confirmation [value="ok"]').addEventListener('click', () => this.getChosesFilters())
        document.querySelector('#sort-dialog .dialog-confirmation [value="ok"]').addEventListener('click', () => {
            this.reverseSort = document.querySelector('#sort-dialog [name="reverse"]').checked
            this.sortMethod = [...document.querySelectorAll('#sort-dialog .options-group input')].find((e) => e.checked)?.value
            this.createSearchCards()
        })

        this.initImportDialog()
        this.initExportDialog()


        this.searchBar.on('input', () => this.updateSearch())

        console.log('loading')
        this.reload(path)
    }

    async reload(path) {
        super.reload(path)
        this.elements = {}

        let category = getUrlParameter('category') || 'ponies'

        const searchQuery = getUrlParameter('q')
        if (searchQuery != null) {
            this.searchBar.val(searchQuery)
        } else if (this.category == category) {
            this.searchBar.val(this.searchQuery)
        } else {
            this.searchScroll = 0
        }

        this.showStats()

        this.category = category
        this.searchResultsElement[0].replaceChildren()

        this.updateFilters()

        this.sortMethod = getUrlParameter('sort') || 'index'
        this.reverseSort = getUrlParameter('reversed') == 'true'
        this.category = getUrlParameter('category')
        if (!this.categories.includes(this.category)) {
            this.category = 'ponies'
        }
        this.createCategorySelector()
        

        // this.searchBar[0].focus()

        // if (!this.searchCreated) {
        await this.createSearchCards()
        // }

        // this.updateSearch()
        
        console.log('searchScroll', this.searchScroll)
        window.scrollTo(0, this.searchScroll)
    }

    
    async update(path) {
        super.update(path)

        this.showStats()
        this.createCategorySelector()

        // if (reload) {
        await this.createSearchCards()
        // }
        
        if (getUrlParameter('q')) {
            this.searchBar.val(getUrlParameter('q'))
        } else {
            this.searchBar.val('')
        }
        // this.updateSearch()
    }

    async unload(path) {
        await super.unload(path)
        this.elementCache = {}

        if (path[0] == CATEGORIES[this.category].page) {
            this.searchScroll = getCurrentScroll()
            console.log('saving scroll', this.searchScroll)
        } else {
            this.searchScroll = 0
            console.log('resetting scroll')
        }
    }

    createCategorySelector() {
        const selector = document.getElementById('category-selector')
        for (let category of this.categories) {
            let option = selector.querySelector(`[value="${category}"]`)
            if (option == null) {
                selector.appendChild(option = createElement('option', {
                    value: category,
                }))
            }
            option.textContent = LOC.translate(CATEGORIES[category].string)
        }
        selector.value = this.category
    }

    updateFilters() {
        const filters = this.filters[this.category]
        let urlFilters = getUrlParameter('filter')
        if (urlFilters != null) {
            urlFilters = urlFilters.split('.')
        } else {
            urlFilters = []
        }
        this.appliedFilters = {}
        if (filters) {
            for (let [filter, data] of Object.entries(filters)) {
                if (urlFilters.length) {
                    if (urlFilters.includes(filter)) {
                        this.appliedFilters[filter] = true
                    }
                } else {
                    this.appliedFilters[filter] = data.default
                }
            }
        }
    }

    showStats() {
        let stats = {
            ponies: 0,
            houses: saveManager.houses.length,
            shops: 0,
        }
        for (let category of Object.keys(stats)) {
            if (category == 'houses') {
                continue
            }
            let objects = window.saveManager.data.inventory.categories[category] || []
            stats[category] = Object.keys(objects).length
        }
        console.log('stats', stats)

        let statsText = []

        for (let [stat, value] of Object.entries(stats)) {
            const span = document.createElement('span')
            span.textContent = `${toTitleCase(LOC.translate(CATEGORIES[stat].string))}: ${value}`
            statsText.push(span)
        }

        if (saveManager.data.total_playtime) {
            const span = document.createElement('span')
            span.textContent = `${toTitleCase(LOC.translate('TOTAL_PLAYTIME'))}: ${formatTime(saveManager.data.total_playtime)}`
            statsText.push(span)
        }
        
        document.getElementById('stats').replaceChildren(...statsText)
    }

    cardRemoveCallback(element) {
        element.remove()
        this.showStats()
        if (this.searchResultsElement[0].children.length == 0) {
            this.setNoneText()
        }
    }

    createObjectCard(objectId) {
        // let object = gameData.getObject(objectId, this.category)
        const element = objectCard(objectId, CATEGORIES[this.category].page)
        element.removeCallback = (el) => this.cardRemoveCallback(el)
        return element
    }

    showSearch() {
        this.currentScreen = 'search'
        this.searchSection.css('display', 'block')
        this.objectProfileSection.css('display', 'none')
    }

    setNoneText() {
        this.searchResultsElement[0].appendChild(createElement('a', {
            textContent: `Add ${toTitleCase(LOC.translate(CATEGORIES[this.category == 'houses' ? 'ponies' : this.category].string))}`,
            class: 'link',
            href: this.category == 'houses' ? `/search/ponies/` : `/search/${this.category}/`
        }))
    }

    async createSearchCards() {
        const waitForNextTask = () => {
            const { port1, port2 } = waitForNextTask.channel ??= new MessageChannel();
            return new Promise( (res) => {
                port1.addEventListener("message", () => res(), { once: true } );
                port1.start();
                port2.postMessage("");
            } );
        };

        const startTime = new Date().getTime()
        
        // this.searchResultsElement.empty()
        console.log('creating search cards')

        let ids = []
        if (this.category == 'houses') {
            ids = saveManager.houses
        } else {
            ids = Object.keys(saveManager.data.inventory.categories[this.category] || {})
        }

        console.log('ids', ids)
        if (ids.length == 0) {
            this.searchResultsElement[0].replaceChildren()
            this.setNoneText()
            return
        }
        
        const objects = ids.map(id => gameData.getObject(id, this.category))
        const elements = []

        window.app.progressBar.max = objects.length
        window.app.progressBar.progress = 0
        
        let i = 0
        const chunk_size = 200

        objects.sort((a, b) => (this.sortResults(a, b)))
        // this.searchResultsElement[0].replaceChildren()
        await waitForNextTask()
        for (let itemId of objects) {
            if (!this.running) {
                window.app.progressBar.progress = 0
                return
            }

            let objectCard = document.getElementById(itemId.id)
            // let objectCard = null
            // let objectCard = this.elements[itemId] || null
            
            if (objectCard == null) {
                elements.push(this.createObjectCard(itemId))
            } else {
                // let object = gameData.getObject(itemId, this.category)
                // objectCard.setAttribute('name', object.name[this.language])
                elements.push(objectCard)
            }
            // this.elements[itemId] = objectCard
            window.app.progressBar.progress += 1
            if (i++ % chunk_size === 0) {
                await waitForNextTask()
            }
        }

        this.searchResultsElement[0].replaceChildren(...elements)

        this.searchCreated = true

        this.updateSearch()
        await waitForNextTask()
        if (app.debug) {
            let timerEl = document.getElementById('timer')
            if (timerEl == null) {
                timerEl = createElement(
                    'span',
                    {
                        id: 'timer',
                    }
                )
                document.querySelector('.search-container').appendChild(timerEl)
            }
            timerEl.textContent = new Date().getTime() - startTime
        }
    }

    sortResults(item1, item2) {
        // return el1.index - el2.index
        // let item1 = gameData.getObject(item1, this.category)
        // let item2 = gameData.getObject(item2, this.category)
        const sortMethods = this.sorters[this.category]
        let sortFunc = (a, b) => a.index - b.index
        if (sortMethods) {
            sortFunc = sortMethods[this.sortMethod].check
        }
        return sortFunc(item1, item2) * (this.reverseSort * -2 + 1)
    }

    async updateSearch() {
        this.searchQuery = this.searchBar.val()
        setUrlParameter('q', this.searchBar.val(), true)
        setUrlParameter('filter', Object.keys(this.appliedFilters)
            .filter(option => this.appliedFilters[option])
            .join('.'),
            true
        )
        setUrlParameter('sort', this.sortMethod != 'index' ? this.sortMethod : '' , true)
        setUrlParameter('reversed', this.reverseSort ? 'true' : '', true)
        setUrlParameter('category', this.category, true)
        
        const filters = this.filters[this.category]

        let searchResults = gameData.searchName(this.searchBar.val(), this.category)
        // console.log(searchResults)

        for (let child of this.searchResultsElement[0].children) {
            const object = child.gameObject

            let hide = false
            if (filters) {
                let objectCategories = Object.keys(filters).filter((option) => filters[option].test(object))
                hide = !objectCategories.some((option) => this.appliedFilters[option])
            }
            
            if (hide || !searchResults.includes(child.id)) {
                child.style.display = 'none'
                // this.classList.add('hide')
            } else {
                child.style.display = 'block'

                // this.classList.remove('hide')
            }
        }
    }

    async showFilterDialog() {
        await this.createFilterOption()
        document.getElementById('filters-dialog').showModal()
    }

    async createFilterOption() {
        const options = this.filters[this.category]
        console.log('options', options, this.category)
        const optionsElement = document.querySelector('#filters-dialog .form-options')
        optionsElement.replaceChildren()
        if (!options) {
            return
        }

        for (let [option, info] of Object.entries(options)) {
            console.log('option', option, info)
            switch (info.type) {
                case 'bool':
                    optionsElement.append(
                        createElement('label', {
                            class: 'option checkbox',
                        }, [
                            createElement('input', {
                                type: 'checkbox',
                                name: `filter-${option}`,
                                checked: this.appliedFilters[option],
                            }),
                            createElement('span', {
                                text: app.translate(info.name),
                            })
                        ])
                    )
                    break;
            
                default:
                    break;
            }
        }
    }

    getChosesFilters() {
        const options = this.filters[this.category]
        const optionsElement = document.querySelector('#filters-dialog .form-options')
        if (!options) {
            return
        }

        for (let [option, info] of Object.entries(options)) {
            let optionEl = optionsElement.querySelector(`[name="filter-${option}"]`)
            switch (info.type) {
                case 'bool':
                    this.appliedFilters[option] = optionEl.checked
                    break;
            
                default:
                    break;
            }
        }

        this.updateSearch()
    }

    async showSortDialog() {
        await this.createSortDialog()
        document.getElementById('sort-dialog').showModal()
    }

    async createSortDialog() {
        const sortMethods = this.sorters[this.category]
        const sortMethodsElement = document.querySelector('#sort-dialog .options-group')
        sortMethodsElement.replaceChildren()
        if (!sortMethods) {
            return
        }

        document.querySelector('#sort-dialog [name="reverse"]').checked = this.reverseSort

        for (let [method, info] of Object.entries(sortMethods)) {
            sortMethodsElement.append(
                createElement('label', {
                    class: 'option radio',
                }, [
                    createElement('input', {
                        type: 'radio',
                        name: 'sort',
                        value: method,
                        checked: this.sortMethod == method,
                    }),
                    createElement('span', {
                        textContent: app.translate(info.name),
                    })
                ])
            )
        }
    }

    initExportDialog() {
        const exportDialogButton = document.getElementById('export-button')
        const exportDialog = document.getElementById('export-dialog')
        const exportFormatSelector = document.getElementById('export-format-selector')
        const optionsElement = document.getElementById('export-format-options')
        const exportSubmitButton = document.getElementById('export-submit-button')

        exportDialogButton.addEventListener('click', () => exportDialog.showModal())

        const options = {}

        const updateOptions = () => {
            optionsElement.replaceChildren()

            switch (exportFormatSelector.value) {
                case 'json':
                    break
                case 'csv':
                    const categorySelector = createElement('select', {
                            class: 'dropdown',
                            id: 'export-format-category',
                        }, [
                            createElement('option', {
                                value: 'ponies',
                                textContent: LOC.translate(CATEGORIES['ponies'].string),
                            }),
                            createElement('option', {
                                value: 'houses',
                                textContent: LOC.translate(CATEGORIES['houses'].string),
                                disabled: true,
                            }),
                            createElement('option', {
                                value: 'shops',
                                textContent: LOC.translate(CATEGORIES['shops'].string),
                                disabled: true,
                            }),
                        ])
                    optionsElement.appendChild(
                        createElement('label', {}, [
                            'Category',
                            categorySelector,
                        ])
                    )

                    options.category = categorySelector.value

                    categorySelector.addEventListener('change', e => {
                        options.category = categorySelector.value
                        console.log('category', options.value)
                    })
                    break
                default:
                    break
            }
        }

        exportFormatSelector.addEventListener('change', updateOptions())
        updateOptions()
        
        exportSubmitButton.addEventListener('click', () => {
            let content = saveManager.export(
                exportFormatSelector.value,
                options,
            )
            downloadFile(
                content,
                `application/${exportFormatSelector.value}`,
                `${options.category}.${exportFormatSelector.value}`,
            )
        })
    }

    updateExportFormat() {
        const optionsElement = document.getElementById('export-format-options')

        optionsElement.replaceChildren()
    }

    initImportDialog() {
        const importButton = document.getElementById('import-button')
        const importDialog = document.getElementById('import-dialog')
        const friendCodeInput = document.getElementById('friend-code-input')
        const importMessage = document.getElementById('import-message')
        const importSubmitButton = document.getElementById('import-submit-button')
        // const importCloseButton = 

        importButton.addEventListener('click', () => {
            importDialog.showModal()
            importSubmitButton.disabled = false
            friendCodeInput.disabled = false
            importMessage.innerText = ''
        })

        const importFriendCode = () => {
            const friendCode = friendCodeInput.value
            friendCodeInput.disabled = true
            importSubmitButton.disabled = true
            importMessage.innerText = ''
            saveManager.importFromCloud(friendCode)
                .then(() => {
                    this.update()
                    importDialog.close()
                })
                .catch((error) => {
                    importMessage.innerText = error.toString()
                })
                .finally(() => {
                    importSubmitButton.disabled = false
                    friendCodeInput.disabled = false
                    friendCodeInput.focus()
                })
        }
        
        importSubmitButton.addEventListener('click', importFriendCode)
        friendCodeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                importFriendCode()
            }
        })
    }
}
