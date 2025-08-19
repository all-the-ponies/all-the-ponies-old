import { loadJSON, createElement, getUrlParameter, LOC, setUrlParameter, toTitleCase, setURL, CATEGORIES, getCurrentScroll } from "../scripts/common.js";
import Page from "../scripts/page.js"
import '../scripts/jquery-3.7.1.min.js'

import { objectCard } from "../scripts/components/object-card.js";

export default class ObjectSearchPage extends Page {
    category = 'ponies'

    layout = '/search/layout.html'

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


        document.getElementById('filter-button').addEventListener('click', () => {
            this.showFilterDialog()
        })
        document.getElementById('sort-button').addEventListener('click', () => {
            this.showSortDialog()
        })

        document.querySelector('#filters-dialog .dialog-confirmation [value="ok"]').addEventListener('click', () => this.getChosesFilters())
        document.querySelector('#sort-dialog .dialog-confirmation [value="ok"]').addEventListener('click', () => {
            this.reverseSort = document.querySelector('#sort-dialog [name="reverse"]').checked
            this.sortMethod = [...document.querySelectorAll('#sort-dialog .options-group input')].find((e) => e.checked)?.value
            this.createSearchCards()
        })


        this.searchBar.on('input', () => this.updateSearch())

        console.log('loading')
        this.reload(path)
    }

    async reload(path) {
        super.reload(path)
        this.elements = {}

        if (path[0] != 'search') {
            path = ['search', path[0]]
        }
        
        let category = path[1]
        if (!(category in CATEGORIES)) {
            category = 'ponies'
            path[1] = category
        }
        const url = new URL(location.href)
        url.pathname = '/' + path.join('/') + '/'
        setURL(url, true)

        const searchQuery = getUrlParameter('q')
        if (searchQuery != null) {
            this.searchBar.val(searchQuery)
        } else if (this.category == category) {
            this.searchBar.val(this.searchQuery)
        } else {
            this.searchScroll = 0
        }

        this.category = category
        this.searchResultsElement[0].replaceChildren()

        const filters = this.filters[this.category]
        this.appliedFilters = {}
        if (filters) {
            for (let [filter, data] of Object.entries(filters)) {
                this.appliedFilters[filter] = data.default
            }
        }

        // this.searchBar[0].focus()

        // if (!this.searchCreated) {
        await this.createSearchCards()
        // }

        this.updateSearch()
        
        console.log('searchScroll', this.searchScroll)
        window.scrollTo(0, this.searchScroll)
    }

    
    async update(path) {
        super.update(path)

        // if (reload) {
        await this.createSearchCards()
        // }
        
        if (getUrlParameter('q')) {
            this.searchBar.val(getUrlParameter('q'))
        } else {
            this.searchBar.val('')
        }
        this.updateSearch()
    }

    async unload(path) {
        await super.unload(path)

        if (path[0] == CATEGORIES[this.category].page) {
            this.searchScroll = getCurrentScroll()
            console.log('saving scroll', this.searchScroll)
        } else {
            this.searchScroll = 0
            console.log('resetting scroll')
        }
    }

    createObjectCard(objectId) {
        let object = gameData.getObject(objectId, this.category)
        return objectCard(object, CATEGORIES[this.category].page)
    }

    showSearch() {
        this.currentScreen = 'search'
        this.searchSection.css('display', 'block')
        this.objectProfileSection.css('display', 'none')
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

        const objects = Object.keys(gameData.categories[this.category].objects)
        const elements = []

        window.app.progressBar.max = objects.length
        window.app.progressBar.progress = 0
        
        let i = 0
        const chunk_size = 200

        await waitForNextTask()
        for (let itemId of objects.sort((a, b) => (this.sortResults(a, b)))) {
            if (!this.running) {
                window.app.progressBar.progress = 0
                return
            }

            let objectCard = document.getElementById(itemId)
            // let objectCard = this.elements[itemId] || null
            
            if (objectCard == null) {
                elements.push(this.createObjectCard(itemId))
            } else {
                let object = gameData.getObject(itemId, this.category)
                objectCard.setAttribute('name', object.name[this.language])
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

        // let timerEl = document.getElementById('timer')
        // if (timerEl == null) {
        //     timerEl = createElement(
        //         'span',
        //         {
        //             id: 'timer',
        //         }
        //     )
        //     document.querySelector('.search-container').appendChild(timerEl)
        // }
        // timerEl.textContent = new Date().getTime() - startTime

    }

    sortResults(el1, el2) {
        // return el1.index - el2.index
        let item1 = gameData.getObject(el1, this.category)
        let item2 = gameData.getObject(el2, this.category)
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

        const filters = this.filters[this.category]
        console.log('appliedFilters', this.appliedFilters)

        let searchResults = gameData.searchName(this.searchBar.val(), this.category)
        // console.log(searchResults)

        for (let child of this.searchResultsElement[0].children) {
            const object = gameData.getObject(child.id)

            let hide = false
            if (filters) {
                let objectCategories = Object.keys(filters).filter((option) => filters[option].test(object))
                hide = objectCategories.some((option) => !this.appliedFilters[option])
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
}
