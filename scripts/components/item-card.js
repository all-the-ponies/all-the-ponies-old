import { createElement } from "../common.js"
import { setURL } from "../common.js"

class ItemCard extends HTMLElement {
    constructor() {
        super()

        const shadow = this.attachShadow({ mode: "open" })

        const container = document.createElement('a')
        container.id = 'container'

        const name = document.createElement('span')
        name.classList.add('item-name')
        name.id = 'item-name'

        const cardBody = document.createElement('div')
        cardBody.classList.add('card-body')
        cardBody.id = 'card-body'

        const image = document.createElement('img')
        image.classList.add('item-image')
        image.id = 'item-image'

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
            
            :host(:hover) {
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
        container.appendChild(name)
        cardBody.appendChild(image)
        container.appendChild(cardBody)
        shadow.appendChild(container)

        this.addEventListener('click', () => {
            console.log('pony-card clicked')
            // if (this.hasAttribute('href')) {
            //     setURL(this.getAttribute('href'))
            //     window.app.refreshPage()
            // }
        })
    }

    connectedCallback() {
        this.updateElement()
    }

    static get observedAttributes() {
        return ["name", "image"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.updateElement()
    }

    updateElement() {
        const shadow = this.shadowRoot
        const container = shadow.getElementById('container')
        container.href = this.getAttribute('href')
        
        const name = shadow.getElementById('item-name')
        const cardBody = shadow.getElementById('card-body')
        const image = shadow.getElementById('item-image')

        name.textContent = this.getAttribute('name')

        let imgUrl
        if (this.hasAttribute('image')) {
            imgUrl = this.getAttribute('image')
        } else {
            imgUrl = '/assets/images/ponies/full/Pony_Placeholder.png'
        }

        image.loading = 'lazy'
        image.src = imgUrl
    }


}

customElements.define(
    'item-card',
    ItemCard,
)

export function ponyCard(pony) {
    return createElement('item-card', {
        id: pony.id,
        name: pony.name[app.language],
        image: pony.image.full,
        href: `?pony=${pony.id}`,
    })
}
