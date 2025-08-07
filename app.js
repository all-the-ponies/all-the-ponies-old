import { Localization } from "/scripts/common.js"
import GameData from "/scripts/gameData.js"
import '/scripts/jquery-3.7.1.min.js'

import Index from "./index.js"
import Ponies from "./ponies/ponies.js"
import Houses from "./houses/houses.js"
import Shops from "./shops/shops.js"
import Quiz from "./quiz/quiz.js"

import './scripts/components/game-object.js'

import { linkHandler, setURL } from "./scripts/common.js"

window.LOC = new Localization('/assets/json/localization.json')
window.gameData = new GameData('/assets/json/game-data.json')

document.addEventListener('click', linkHandler)

window.addEventListener('popstate', (e) => {
    window.app.refreshPage()
})

class App {
    constructor() {
        this.progressBar = {
            element: document.getElementById('loading-bar'),
            set max(max) {
                this.element.max = max
            },
            get max() {
                return this.element.max
            },
            set progress(progress) {
                this.element.value = progress
                if (this.progress < this.max) {
                    this.element.style.display = 'block'
                } else {
                    this.element.style.display = 'none'
                }
            },
            get progress() {
                return this.element.value
            }
        }



        this.languageSelector = document.getElementById('language')
        this.languageSelector.addEventListener('change', () => this.refreshAll(true))
        this.sidebarToggle = document.getElementById('sidebar-toggle')
        this.createLanguageSelector()

        this.content = document.getElementById('page-content')
        this.sidebarElement = document.getElementById('sidebar-links')

        this.currentPage = null
        this.currentRoute = null

        this.refreshAll()
    }

    get language() {
        return this.languageSelector.value
    }

    createLanguageSelector() {
        let preferredLanguage = null
        const userLanguages = navigator.languages

        this.languageSelector.replaceChildren()
        for (let [key, data] of Object.entries(gameData.languages)) {
            let option = document.createElement('option')
            option.value = key
            option.innerText = data.name
            this.languageSelector.append(option)

            if (userLanguages.includes(data.code)) {
                if (preferredLanguage != null && userLanguages.indexOf(data.code) > userLanguages.indexOf(preferredLanguage.code)) {
                    option.selected = true
                    preferredLanguage = {
                        code: data.code
                    }
                }
            }
        }
    }

    translate(string) {
        if (this.language in string) {
            return string[this.language]
        }
        return string['english']
    }

    routes = {
        '/': new Index(),
        '/ponies/': new Ponies(),
        '/houses/': new Houses(),
        '/shops/': new Shops(),
        '/quiz/': new Quiz(),
    }

    get sidebar() {
        return [
            ['/ponies/', gameData.categories.ponies.name],
            ['/houses/', gameData.categories.houses.name],
            ['/shops/', gameData.categories.shops.name],
            '~',
            ['/quiz/', {'english': 'Pony quiz'}],
        ]
    }

    refreshAll(reload = false) {
        document.documentElement.lang = gameData.languages[this.language].code

        this.refreshSidebar()
        this.refreshPage(reload)
    }

    refreshPage(reload = false) {
        let url = new URL(location)

        let path = url.pathname

        let pathParts = path.split('/')

        if (pathParts[0] == '') {
            pathParts.splice(0, 1)
        }
        if (pathParts[pathParts.length - 1] == '') {
            pathParts.splice(pathParts.length - 1, 1)
        }

        if (pathParts.length) {
            if (pathParts[pathParts.length - 1].includes('.')) {
                url.pathname = '/' + pathParts.join('/')
                setURL(url, true)
                path = '/' + pathParts.slice(0, pathParts.length - 1).join('/') + '/'
            } else {
                path = `/${pathParts.join('/')}/`
                url.pathname = path
                setURL(url, true)
            }
        }


        this.sidebarToggle.checked = false

        if (path in this.routes) {
            let route = this.routes[path]
            if (path == this.currentPage) {
                console.log('updating')
                route.update(reload)
            } else {
                if (this.currentRoute) this.currentRoute.running = false
                route.running = true
                route.load()
            }
            this.currentPage = path
            this.currentRoute = route
        } else {
            this.content.innerHTML = '404 Error'
        }

    }

    refreshSidebar() {
        this.sidebarElement.replaceChildren()

        console.log(this.language)

        for (let item of this.sidebar) {
            if (item == '~') {
                let hr = document.createElement('hr')
                hr.classList.add('sidebar-separator')
                this.sidebarElement.append(hr)
            } else {
                let li = document.createElement('li')
                let link = document.createElement('a')
                li.append(link)

                link.href = item[0]
                console.log(item)
                link.innerText = this.translate(item[1])

                this.sidebarElement.append(li)
            }
        }
    }
}

window.app = new App()
