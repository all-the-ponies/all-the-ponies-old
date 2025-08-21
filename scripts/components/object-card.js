import { checkVisible, createElement, linkHandler, LOC } from "../common.js"
import { setURL } from "../common.js"


const cardLoader = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        console.log('intersectionRatio', entry.isIntersecting)
        if (entry.isIntersecting) {
            entry.target.load()
            cardLoader.unobserve(entry.target)
        }
    });
}, {
    root: null,
    rootMargin: '50px',
    threshold: 0,
})


class ObjectCard extends HTMLElement {
    _style = `
        * {
            box-sizing: border-box;
            padding: 0;
            margin: 0;
        }

        :host {
            left: 0px;
            background-color: white;

            width: var(--grid-size, 10rem);
            height: calc(var(--grid-size, 10rem) * (4 / 3));
            aspect-ratio: 3 / 4;

            border-radius: 0.8rem;
            --box-shadow: inset 0px -1px 4px hsl(211, 30%, 80%);
            box-shadow: var(--box-shadow);

            cursor: pointer;
            container-type: inline-size;
            text-decoration: none;

            transition: box-shadow 150ms ease-out,
                        scale 150ms ease-out;
        }
        
        :host(:hover),
        :host(:focus) {
            box-shadow: var(--box-shadow),
                        0px 0px 5px hsl(211, 30%, 30%);
            scale: 105%;
        }

        .add-button {
            visibility: visible;
        }

        :host(:hover) .add-button {
            visibility: visible;
        }

        a {
            border-radius: inherit;
            text-decoration: none;
        }

        .item-name {
            font-size: 10cqw;
            word-break: break-word;
            text-shadow: var(--text-shadow);

            color: white;
            text-align: center;
            display: grid;
            align-items: center;
            width: 100%;
            height: 20%;
            background-image: linear-gradient(var(--pink-light), var(--pink));
            /* box-shadow: 0px 1px 0px 1px var(--pink-dark); */
            border-bottom: 2px solid var(--pink-dark);
            
            border-top-left-radius: inherit;
            border-top-right-radius: inherit;
        }
        
        .card-body {
            width: 100%;
            height: 80%;
            position: relative;
        }

        .item-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: center;
            padding: 1rem;
        }

        .left-container,
        .right-container {
            height: 100%;
            width: 2rem;
            position: absolute;
            display: flex;
            justify-content: center;

            padding: 0.4rem 0.3rem;
        }
        .left-container {
            left: 0;
        }
        .right-container {
            right: 0;
        }

        .left-container > *,
        .right-container > * {
            width: 1.5rem;
            height: 1.5rem;

            margin: 0;
        }
    `

    constructor() {
        super()
        this.loaded = false
    }

    connectedCallback() {
        this.gameObject = window.gameData.getObject(this.getAttribute('object'))
        
        const shadow = this.shadowRoot || this.attachShadow({ mode: "open" })

        let container = shadow.getElementById('container')
        if (container == null) {
            container = document.createElement('a')
            container.id = 'container'
            shadow.appendChild(container)
            container.addEventListener('click', linkHandler)

            container.appendChild(createElement('link', {
                rel: 'stylesheet',
                href: '/styles/style.css',
            }))
            container.appendChild(createElement('style', {
                textContent: this._style
            }))

            container.appendChild(createElement('span', {
                class: 'item-name',
                id: 'item-name',
            }))

            const cardBody = createElement('div', {
                class: 'card-body',
                id: 'card-body',
            })
            container.appendChild(cardBody)

            const leftContainer = createElement('div', {
                class: 'left-container'
            })
            const rightContainer = createElement('div', {
                class: 'right-container'
            })

            cardBody.appendChild(leftContainer)
            cardBody.appendChild(rightContainer)

            const addButton = createElement('button', {
                class: 'add-button button-circle button-green',
                textContent: '+',
                id: 'add-button',
                'data-state': 'add',
            })
            rightContainer.appendChild(addButton)
            addButton.addEventListener('click', (e) => {
                e.stopPropagation()
                e.preventDefault()

                saveManager.setOwned(this.gameObject.id, addButton.getAttribute('data-state') == 'add')
                
                this.updateAddButton()
            })
            
            const image = createElement('img', {
                class: 'item-image',
                id: 'item-image',
                loading: 'lazy',
            })
            image.style.visibility = 'hidden'
            cardBody.appendChild(image)

            image.addEventListener('load', () => {
                this.loaded = true
                image.style.visibility = 'visible'
            })

            image.addEventListener('error', () => {
                if (image.src == this.getAttribute('image-placeholder')) {
                    return
                }
                image.src = this.getAttribute('image-placeholder')
            })
        }
        

        cardLoader.observe(this)
        this.updateElement()
    }

    disconnectedCallback() {
        cardLoader.unobserve(this)
    }

    static get observedAttributes() {
        return ["object"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.gameObject = window.gameData.getObject(this.getAttribute('object'))
        if (this.isConnected) {
            this.updateElement()
        }
    }

    updateElement() {
        const shadow = this.shadowRoot
        const container = shadow.getElementById('container')
        container.href = this.getAttribute('href')
        
        const name = shadow.getElementById('item-name')
        const cardBody = shadow.getElementById('card-body')

        name.textContent = LOC.translate(this.gameObject.name)

        
        this.updateAddButton()
        this.updateSides()

        // this.load()
    }

    updateAddButton() {
        const addButton = this.shadowRoot.getElementById('add-button')
        if (saveManager.owned(this.gameObject.id)) {
            addButton.classList.remove('button-green')
            addButton.classList.add('button-red')
            addButton.setAttribute('data-state', 'remove')
            addButton.textContent = '-'
        } else {
            addButton.classList.remove('button-red')
            addButton.classList.add('button-green')
            addButton.setAttribute('data-state', 'add')
            addButton.textContent = '+'
        }
    }

    updateSides() {
        const shadow = this.shadowRoot
        
        const leftContainer = shadow.querySelector('.left-container')
        const rightContainer = shadow.querySelector('.right-container')

        const leftElements = []

        let pro = shadow.getElementById('pro')
        if (this.gameObject.pro) {
            if (pro == null) {
                pro = createElement('img', {
                    id: 'pro',
                    loading: 'lazy',
                })
                pro.style.visibility = 'hidden'
            }
            pro.addEventListener('load', () => {
                pro.style.visibility = 'visible'
            })
            leftElements.push(pro)
        }

        leftContainer.replaceChildren(...leftElements)
    }

    load() {
        if (this.loaded) {
            return
        }
        const image = this.shadowRoot.getElementById('item-image')
        let imgUrl
        imgUrl = this.gameObject.category == 'ponies' ? this.gameObject.image.full : this.gameObject.image
        image.src = imgUrl

        const pro = this.shadowRoot.getElementById('pro')
        if (pro != null) {
            pro.src = '/assets/images/ui/pro-pony.png'
        }
    }
}

customElements.define(
    'object-card',
    ObjectCard,
)

export function ponyCard(pony) {
    return createElement('item-card', {
        id: pony.id,
        name: pony.name[app.language],
        image: pony.image.full,
        href: `?pony=${pony.id}`,
    })
}

export function objectCard(object, parameter = 'pony') {
    const imagePlaceholders = {
        'pony': '/assets/images/ponies/full/Pony_Placeholder.png',
    }

    return createElement('object-card', {
        id: object.id,
        object: object.id,
        // name: object.name[app.language],
        // image: parameter == 'pony' ? object.image.full : object.image,
        href: `/${parameter}/${object.id}/`,
        'image-placeholder': imagePlaceholders[parameter] ? imagePlaceholders[parameter] : imagePlaceholders['pony'],
    })
}
