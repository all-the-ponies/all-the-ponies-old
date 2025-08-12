import { CATEGORIES, formatTime, LOC, toTitleCase } from "./common.js";

import Page from "./page.js";

export default class ObjectProfilePage extends Page {
    category = 'ponies'

    id = null
    object = null

    async load(path) {
        this.layout = `/${path[0]}/layout.html`
        await super.load(path)
        this.objectProfileSection = document.getElementById('object-profile')
        
        document.querySelector('.to-search').href = `/search/${this.category}/`

        this.reload(path)
    }

    async reload(path) {
        this.id = path[1]
        this.object = gameData.getObject(this.id, this.category)

        if (!this.object || this.object.category != this.category) {
            document.getElementById('not-found').style.display = 'block'
            document.getElementById('object-profile').style.display = 'none'
        } else {
            document.getElementById('not-found').style.display = 'none'
            document.getElementById('object-profile').style.display = 'block'
            this.createProfile()
        }
    }


    async createProfile() {
        // let pony = await super.showObjectProfile(ponyId)
        const pony = this.object

        if (this.object == null) {
            return
        }
    }
}
