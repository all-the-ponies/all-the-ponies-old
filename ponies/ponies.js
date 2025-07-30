import { createElement, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import Page from "../scripts/page.js"
import '../scripts/jquery-3.7.1.min.js'

import { ponyCard } from "/scripts/components/item-card.js";

export default class Ponies extends Page {
    async load() {
        await super.load()


        this.searchSection = $('#search-section')
        this.ponyProfileSection = $('#pony-profile')
        this.searchBar = $('#search-bar')
        this.searchResultsElement = $('#search-results')

        this.searchCreated = false
        
        this.currentScreen = 'search'
        
        this.filters = {}

        let selectedPony = getUrlParameter('pony')

        $('.to-search').on('click', (e) => {
            e.preventDefault()
            setUrlParameter('pony')
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
        let selectedPony = getUrlParameter('pony')
        
        if (selectedPony) {
            this.currentScreen = 'ponyProfile'
            this.showPonyProfile(selectedPony)
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
        if (getUrlParameter('pony') in gameData.ponies) {
            screen = 'ponyProfile'
            this.showPonyProfile(getUrlParameter('pony'))
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

    createPonyCard(ponyId) {
        let pony = gameData.getPony(ponyId)
        return ponyCard(pony)
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
        
        for (let ponyId of Object.keys(gameData.ponies)) {
            let ponyCard = document.getElementById(ponyId)
            if (ponyCard == null) {
                elements.push(this.createPonyCard(ponyId))
            } else {
                let pony = gameData.getPony(ponyId)
                ponyCard.setAttribute('name', pony.name[this.language])
                elements.push(ponyCard)
            }
        }

        this.searchResultsElement[0].replaceChildren(...elements.sort(this.sortResults))

        this.searchCreated = true
    }

    sortResults(el1, el2) {
        let pony1 = gameData.getPony(el1.id)
        let pony2 = gameData.getPony(el2.id)
        return pony1.index - pony2.index
    }

    async updateSearch() {
        this.showSearch()

        setUrlParameter('q', this.searchBar.val(), true)


        let searchResults = gameData.searchName(this.searchBar.val(), 'ponies')
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

    async showPonyProfile(ponyId) {
        $('.to-search').attr('href', `?q=${encodeURI(this.searchBar.val())}`)
        
        this.currentScreen = 'ponyProfile'

        this.searchSection.css('display', 'none')
        this.ponyProfileSection.css('display', 'block')

        let pony = gameData.getPony(ponyId)
        // this.searchResultsElement.empty()


        this.ponyProfileSection.find('#pony-profile-name').text(pony.name[this.language])
        console.log(pony.image.full)
        this.ponyProfileSection.find('#pony-profile-image').attr('src', pony.image.full)
        this.ponyProfileSection.find('#pony-profile-portrait-image').attr('src', pony.image.portrait)
        this.ponyProfileSection.find('#pony-profile-description').text(pony.description[this.language])
        this.ponyProfileSection.find('[data-pony-info="level"]').text(pony.unlock_level)
        this.ponyProfileSection.find('[data-pony-info="town"]').text(toTitleCase(LOC.translate(pony.location)))
        this.ponyProfileSection.find('[data-pony-info="arrival-bonus"]').text(pony.arrival_xp)
        this.ponyProfileSection.find('[data-pony-info="House"]').text(pony.house)
        this.ponyProfileSection.find('[data-pony-info="minigame-cooldown"]').text(pony.minigame.cooldown + 's')
        this.ponyProfileSection.find('[data-pony-info="minigame-skip-cost"]').text(pony.minigame.skip_cost)

        return
        let starRewardsElement = this.ponyProfileSection.find('[data-pony-info="star-rewards"]')
        let starRewardsBar = starRewardsElement.find('.star-rewards-bar')
        if (pony.rewards.length == 0 || pony.max_level) {
            starRewardsBar.css('display', 'none')
            starRewardsElement.find('.none-star-rewards').css('display', 'inline')
        } else {
            starRewardsBar.css('display', 'flex')
            starRewardsElement.find('.none-star-rewards').css('display', 'none')
            let i = 0
            for (let i = 0; i < 5; i++) {
                let reward = pony.rewards[i]
                let item = gameData.getItem(reward.item)
                let img = starRewardsBar.children().eq(i).find('img')
                img.attr('src', item.image)
            }
        }
        // this.ponyProfileSection.find('[data-pony-info="minigame-skip-cost"]').text(pony.minigames.minigame_skip_cost)

    }
}
