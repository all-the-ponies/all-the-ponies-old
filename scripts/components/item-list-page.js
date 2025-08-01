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

        $('.to-search').on('click', (e) => {
            e.preventDefault()
            setUrlParameter(this.parameter)
            this.updateSearch()
        })

        // window.addEventListener('popstate', (e) => {
        //     console.log(e)
        //     this.reload()
        // })

        this.searchBar.on('input', () => this.updateSearch())

        console.log('loading')
        this.reload()
    }

    async reload() {
        let selectedPony = getUrlParameter(this.parameter)
        
        if (selectedPony) {
            this.currentScreen = 'ponyProfile'
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
            screen = 'ponyProfile'
            this.showItemProfile(getUrlParameter(this.parameter))
        }

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
        // this.searchResultsElement.empty()
        console.log('creating search cards')

        let elements = []
        
        for (let itemId of Object.keys(gameData.categories[this.category].items)) {
            let itemCard = document.getElementById(itemId)
            if (itemCard == null) {
                elements.push(this.createItemCard(itemId))
            } else {
                let item = gameData.getItem(itemId, this.category)
                itemCard.setAttribute('name', item.name[this.language])
                elements.push(itemCard)
            }
        }

        this.searchResultsElement[0].replaceChildren(...elements.sort((a, b) => this.sortResults(a, b)))

        this.searchCreated = true
    }

    sortResults(el1, el2) {
        let item1 = gameData.getItem(el1.id, this.category)
        let item2 = gameData.getItem(el2.id, this.category)
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
        $('.to-search').attr('href', `?q=${encodeURI(this.searchBar.val())}`)
        
        this.currentScreen = 'ponyProfile'

        this.searchSection.css('display', 'none')
        this.ponyProfileSection.css('display', 'block')
    }
}
