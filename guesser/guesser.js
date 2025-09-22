import { createElement, LOC, pickRandom } from "../scripts/common.js"
import Page from "../scripts/page.js"

export default class GuesserPage extends Page {
    async load() {
        await super.load()

        this.listEl = document.getElementById('guessedList')
        this.nameInput = document.getElementById('name-input')
        this.nameEl = document.getElementById('name')
        this.descriptionEl = document.getElementById('description')
        this.ponyImage = document.getElementById('pony-image')
        this.startButton = document.getElementById('start')
        this.stopButton = document.getElementById('stop')
        this.progressEl = document.getElementById('progress')
        this.skipButton = document.getElementById('skip')
        this.hintButton = document.getElementById('hint')
        this.timerEl = document.getElementById('timer')

        this.startButton.addEventListener('click', () => this.start())
        this.stopButton.addEventListener('click', () => this.stop())
        this.skipButton.addEventListener('click', () => {
            this.showPony()
            this.nameInput.focus()
        })
        this.hintButton.addEventListener('click', () => {
            this.showHint()
            this.nameInput.focus()
        })
        this.nameInput.addEventListener('input', () => this.checkPony())

        this.ponyImage.addEventListener('load', () => {
            this.ponyImage.classList.add('silhouette')
        })

        this.currentPony = null
        this.guessedPonies = []
        this.usedHints = []
    }

    async unload() {
        await super.unload()

        this.stop()
    }

    start() {
        this.startButton.disabled = true
        this.stopButton.disabled = false
        this.skipButton.disabled = false
        this.nameInput.disabled = false
        this.hintButton.disabled = false
        this.currentPony = null
        this.guessedPonies = []
        this.startTime = new Date().getTime()
        this._timerInterval = setInterval(() => this.updateTimer(), 1000)

        this.timerEl.textContent = '0:00'

        this.listEl.replaceChildren()
        
        this.updateProgress()
        this.getRandomPony()

        this.nameInput.focus()
    }

    stop() {
        this.startButton.disabled = false
        this.stopButton.disabled = true
        this.nameInput.disabled = true
        this.hintButton.disabled = true
        this.skipButton.disabled = true

        clearInterval(this._timerInterval)
    }

    getRandomPony() {
        const checks = [
            (pony) => this.guessedPonies.includes(pony.id),
            (pony) => !(pony.group.length == 0 || !pony.group_master),
            (pony) => pony.tags.includes('npc'),
            (pony) => pony.tags.includes('quest'),
        ]

        this.usedHints = []
        this.descriptionEl.textContent = ''
        this.nameEl.textContent = '???'
        this.nameInput.value = ''

        const ponies = Object.values(gameData.categories.ponies.objects)
        this.currentPony = pickRandom(ponies)
        console.log('pony', this.currentPony)
        console.log(checks.map(((f) => f(this.currentPony))))
        while (checks.some(((f) => f(this.currentPony)))) {
            this.currentPony = pickRandom(ponies)
            console.log(this.currentPony)
            console.log(checks.map(((f) => f(this.currentPony))))
        }

        this.createSilhouette()
    }

    createSilhouette() {
        this.ponyImage.src = this.currentPony.image.full

        this.skipButton.disabled = false
        this.hintButton.disabled = false
    }

    checkPony() {
        this.nameInput.value = this.nameInput.value.replaceAll('\n', '')

        let guessedName = gameData.transformName(this.nameInput.value)
        let ponyName = gameData.transformName(app.translate(this.currentPony.name))

        if (ponyName == guessedName) {
            this.nameInput.value = ''
            this.guessedPonies.push(this.currentPony.id)
            this.addToList()
            this.updateProgress()
            this.showPony()
            return
        }

        console.log('alt names', this.currentPony.alt_name[app.language])
        if (this.currentPony.alt_name[app.language]) {
            for (let altName of this.currentPony.alt_name[app.language]) {
                let ponyName = gameData.transformName(altName)

                if (ponyName == guessedName) {
                    this.nameInput.value = ''
                    this.guessedPonies.push(this.currentPony.id)
                    this.addToList()
                    this.updateProgress()
                    this.showPony()
                    return
                }
            }
        }
    }

    updateProgress() {
        this.progressEl.textContent = this.guessedPonies.length
    }

    updateTimer() {
        let now = new Date().getTime()
        let timeElapsed = now - this.startTime

        let seconds = Math.floor((timeElapsed % (1000 * 60)) / 1000);
        let minutes = Math.floor((timeElapsed % (1000 * 60 * 60)) / (1000 * 60))
        let hours = Math.floor((timeElapsed % (1000 * 60 * 60 * 60)) / (1000 * 60 * 60))
        this.timerEl.textContent = (hours > 0 ? `${hours}:` : minutes.toString().length == 1 ? '0' : '') + `${minutes}:${seconds.toString().length == 1 ? '0' : ''}${seconds}`
    }

    showPony() {
        this.skipButton.disabled = true
        this.hintButton.disabled = true

        this.ponyImage.classList.remove('silhouette')
        this.nameEl.textContent = LOC.translate(this.currentPony.name)
        this.descriptionEl.textContent = LOC.translate(this.currentPony.description)

        setTimeout(() => {
            this.getRandomPony()
        }, 2000)
    }

    showHint() {
        const hints = [
            'description',
            // 'show',
        ]

        let hint = pickRandom(hints)
        switch (hint) {
            case 'description':
                const name = app.translate(this.currentPony.name)
                this.descriptionEl.textContent = app.translate(this.currentPony.description).replaceAll(name, '____')
                
                break
            default:
                break
        }
    }

    addToList() {
        let link = `/pony/${this.currentPony.id}/`
        let element = createElement('div', {
                class: 'pony-entry'
            }, [
                createElement('a', {
                    href: link,
                    target: '_blank',
                    class: 'link',
                }, [
                    createElement('img', {
                        src: this.currentPony.image.portrait,
                        alt: LOC.translate(this.currentPony.name),
                    })
                ]),
                createElement('a', {
                    href: link,
                    target: '_blank',
                    class: 'link',
                    textContent: LOC.translate(this.currentPony.name),
                })
            ])
        console.log('added', element)
        this.listEl.prepend(
            element
        )

        
    }
}
