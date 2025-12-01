import { CATEGORIES, createElement, formatTime, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import ObjectProfilePage from "../scripts/object-profile.js";

export default class BackgroundPage extends ObjectProfilePage {
    category = 'backgrounds'

    async createProfile() {
        await super.createProfile()
        const pony = this.object

        if (this.object == null) {
            return
        }

        const background = this.object

        document.getElementById('object-profile-name').textContent = app.translate(background.name)
        document.getElementById('object-profile-image').src = background.image.main
        document.getElementById('object-profile-preview').src = background.image.preview

        document.querySelector('[data-object-info="default"]').textContent = background.is_default
    }
}
