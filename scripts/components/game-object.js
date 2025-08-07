import { createElement, linkHandler } from "../common.js"

const lazyLoader = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.intersectionRatio > 0) {
            entry.target.load()
            lazyLoader.unobserve(entry.target)
        }
    });
}, {
    root: null,
    rootMargin: '0px',
    threshold: 0,
})

class GameObject extends HTMLElement {
    constructor() {
        super()

        lazyLoader.observe(this)
        const shadow = this.attachShadow({ mode: 'open' })

        shadow.appendChild(createElement(
            'style',
            {
                text: `
                :host {
                    display: inline-block;
                }
                img {
                    object-fit: contain;
                    width: 100%;
                    height: 100%;
                    object-position: center;
                }
                `
            }
        ))
        shadow.appendChild(document.createElement('img'))
    }

    connectedCallback() {
        if (this.hasAttribute('object-id')) {
            this.objectInfo = window.gameData.getObject(this.getAttribute('object-id'))
        } else {
            this.objectInfo = null
        }

        console.log('observing')
        lazyLoader.observe(this)
    }

    disconnectedCallback() {
        lazyLoader.unobserve(this)
    }

    load() {
        console.log('objectInfo', this.objectInfo)
        if (this.objectInfo == null) {
            const image = this.shadowRoot.querySelector('img')
            image.src = null
            image.alt = this.getAttribute('object-id')
            image.title = this.hasAttribute('object-id')
            return
        }


        let imageUrl = null
        if (this.objectInfo.category == 'ponies') {
            if (this.getAttribute('size') == 'full') {
                imageUrl = this.objectInfo.image.full
            } else {
                imageUrl = this.objectInfo.image.portrait
            }
        } else {
            imageUrl = this.objectInfo.image
        }

        const image = this.shadowRoot.querySelector('img')
        image.src = imageUrl
        image.title = window.app.translate(this.objectInfo.name)
        image.alt = window.app.translate(this.objectInfo.name)
    }

    static get observedAttributes() {
        return ["object-id", "size"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.connectedCallback()
    }
}


customElements.define(
    'object-image',
    GameObject,
)
