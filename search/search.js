import { loadJSON, createElement, getUrlParameter, LOC, setUrlParameter, toTitleCase, setURL, CATEGORIES, getCurrentScroll } from "../scripts/common.js";
import Page from "../scripts/page.js"
import '../scripts/jquery-3.7.1.min.js'

import { objectCard } from "../scripts/components/object-card.js";

export default class ObjectSearchPage extends Page {
    category = 'ponies'

    layout = '/search/layout.html'

    searchQuery = ''
    searchScroll = 0
    
    async load(path) {
        await super.load(path)

        this.searchSection = $('#search-section')
        this.searchBar = $('#search-bar')
        this.searchResultsElement = $('#search-results')
        
        this.filters = {}

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

        // this.searchBar[0].focus()

        // if (!this.searchCreated) {
        await this.createSearchCards()
        // }

        if (this.currentScreen == 'search') {
            this.updateSearch()
        }
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

        console.log('searchScroll', this.searchScroll)
        window.scrollTo(0, this.searchScroll)
    }

    sortResults(el1, el2) {
        // return el1.index - el2.index
        let item1 = gameData.getObject(el1, this.category)
        let item2 = gameData.getObject(el2, this.category)
        return item1.index - item2.index
    }

    async updateSearch() {
        this.showSearch()

        this.searchQuery = this.searchBar.val()
        setUrlParameter('q', this.searchBar.val(), true)


        let searchResults = gameData.searchName(this.searchBar.val(), this.category)
        // console.log(searchResults)

        this.searchResultsElement.children().each(function () {
            if (!searchResults.includes(this.id)) {
                this.style.display = 'none'
                // this.classList.add('hide')
            } else {
                this.style.display = 'block'

                // this.classList.remove('hide')
            }
        })
    }
}
