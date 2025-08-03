import { createElement, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../common.js";
import Page from "../page.js"
import '../jquery-3.7.1.min.js'

import { itemCard } from "./item-card.js";

export default class ItemListPage extends Page {
    category = 'ponies'
    parameter = 'pony'
    
    async load() {
        await super.load()


        this.searchSection = $('#search-section')
        this.ponyProfileSection = $('#pony-profile')
        this.searchBar = $('#search-bar')
        this.searchResultsElement = $('#search-results')

        this.searchCreated = false
        
        this.currentScreen = 'search'
        
        this.filters = {}

        let selectedPony = getUrlParameter(this.parameter)

        this.searchScroll = 0

        $('.to-search').on('click', (e) => {
            e.preventDefault()
            setUrlParameter(this.parameter)
            this.updateSearch()

            scrollTo({top: this.searchScroll})
        })

        this.searchBar.on('input', () => this.updateSearch())

        console.log('loading')
        this.reload()
    }

    async reload() {
        let selectedPony = getUrlParameter(this.parameter)
        
        if (selectedPony) {
            this.currentScreen = 'itemProfile'
            this.showItemProfile(selectedPony)
        } else {
            this.currentScreen = 'search'
        }

        const searchQuery = getUrlParameter('q')
        if (searchQuery != null) {
            this.searchBar.val(searchQuery)
        }

        // if (!this.searchCreated) {
            this.createSearchCards()
        // }

        if (this.currentScreen == 'search') {
            this.updateSearch()
        }
    }

    
    async update(reload = false) {
        let screen = 'search'
        if (getUrlParameter(this.parameter) in gameData.categories[this.category].items) {
            if (this.currentScreen == 'search') {
                this.searchScroll = document.documentElement.scrollTop || document.body.scrollTop
            }
            
            screen = 'itemProfile'
            
            scrollTo({top: 0})
            this.showItemProfile(getUrlParameter(this.parameter))
        }
        
        this.currentScreen = screen

        if (reload) {
            await this.createSearchCards()
        }
        
        if (screen == 'search') {
            if (getUrlParameter('q')) {
                this.searchBar.val(getUrlParameter('q'))
            } else {
                this.searchBar.val('')
            }
            this.updateSearch()
        }
    }

    createItemCard(itemId) {
        let item = gameData.getItem(itemId, this.category)
        return itemCard(item, this.parameter)
    }

    showSearch() {
        this.currentScreen = 'search'
        this.searchSection.css('display', 'block')
        this.ponyProfileSection.css('display', 'none')
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

        let elements = []
        const items = Object.keys(gameData.categories[this.category].items)

        window.app.progressBar.max = items.length
        window.app.progressBar.progress = 0
        
        let i = 0
        const chunk_size = 200

        await waitForNextTask()
        for (let itemId of items.sort((a, b) => (this.sortResults(a, b)))) {
            if (!this.running) {
                window.app.progressBar.progress = 0
                return
            }

            let itemCard = document.getElementById(itemId)
            if (itemCard == null) {
                elements.push(this.createItemCard(itemId))
            } else {
                let item = gameData.getItem(itemId, this.category)
                itemCard.setAttribute('name', item.name[this.language])
                elements.push(itemCard)
            }
            window.app.progressBar.progress += 1
            if (i++ % chunk_size === 0) {
                await waitForNextTask()
            }
        }

        this.searchResultsElement[0].replaceChildren(...elements)

        this.searchCreated = true

        // document.querySelector('.search-container').appendChild(createElement(
        //     'span',
        //     {
        //         text: new Date().getTime() - startTime
        //     }
        // ))
    }

    sortResults(el1, el2) {
        // return el1.index - el2.index
        let item1 = gameData.getItem(el1, this.category)
        let item2 = gameData.getItem(el2, this.category)
        return item1.index - item2.index
    }

    async updateSearch() {
        this.showSearch()

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

    async showItemProfile(itemId) {
        const item = gameData.getItem(itemId, this.category)
        
        $('.to-search').attr('href', `?q=${encodeURI(this.searchBar.val())}`)
        
        this.currentScreen = 'itemProfile'

        this.searchSection.css('display', 'none')
        this.ponyProfileSection.css('display', 'block')

        console.log('item', itemId, item)
        if (this.category == 'ponies') {
            document.getElementById('item-profile-portrait-image').src = item.image.portrait
            document.getElementById('item-profile-description').textContent = item.description[this.language]
        }
        document.getElementById('item-profile-image').src = this.category == 'ponies' ? item.image.full : item.image
        document.getElementById('item-profile-name').textContent = item.name[this.language]

        return item
    }
}
