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
    constructor() {
        super()

        this.loaded = false
    }

    connectedCallback() {
        const shadow = this.shadowRoot || this.attachShadow({ mode: "open" })

        let container = shadow.getElementById('container')
        if (container == null) {
            container = document.createElement('a')
            container.id = 'container'
            shadow.appendChild(container)
            container.addEventListener('click', linkHandler)
        }

        let name = shadow.getElementById('item-name')
        
        if (name == null) {
            name = document.createElement('span')
            name.classList.add('item-name')
            name.id = 'item-name'
            container.appendChild(name)
        }

        let cardBody = shadow.getElementById('card-body')

        if (cardBody == null) {
            cardBody = document.createElement('div')
            cardBody.classList.add('card-body')
            cardBody.id = 'card-body'
            container.appendChild(cardBody)
        }

        let image = shadow.getElementById('item-image')

        if (image == null) {
            image = document.createElement('img')
            image.classList.add('item-image')
            image.id = 'item-image'
            image.loading = 'lazy'
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

        if (shadow.querySelector('style') == null) {

            const style = document.createElement('style')
            style.textContent = `
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
                }
    
                .item-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    object-position: center;
                    padding: 1rem;
                }
            `
            container.appendChild(style)
        }

        
        this.gameObject = window.gameData.getObject(this.getAttribute('object'))



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

        

        // this.load()
    }

    load() {
        if (this.loaded) {
            return
        }
        const image = this.shadowRoot.getElementById('item-image')
        let imgUrl
        imgUrl = this.gameObject.category == 'ponies' ? this.gameObject.image.full : this.gameObject.image
        image.src = imgUrl
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
