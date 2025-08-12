import { CATEGORIES, createElement, formatTime, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import ObjectProfilePage from "../scripts/object-profile.js";

export default class ShopPage extends ObjectProfilePage {
    category = 'shops'

    async createProfile() {
        await super.createProfile()

        if (this.object == null) {
            return
        }

        const object = this.object

        document.getElementById('object-profile-name').textContent = app.translate(object.name)
        document.getElementById('object-profile-image').src = object.image


        document.querySelector('[data-object-info="town"]').textContent = toTitleCase(LOC.translate(object.location))
        document.querySelector('[data-object-info="level"]').textContent = object.unlock_level
        document.querySelector('[data-object-info="grid-size"]').textContent = `${object.grid_size}x${object.grid_size}`
        document.querySelector('[data-object-info="build-time"]').textContent = formatTime(object.build.time)
        document.querySelector('[data-object-info="build-skip"]').textContent = object.build.skip_cost
        document.querySelector('[data-object-info="build-reward"]').textContent = object.build.xp

        
        document.querySelector('[data-object-info="product-name"]').textContent = app.translate(object.product.name)
        document.querySelector('[data-object-info="product-image"]').src = object.product.image
        document.querySelector('[data-object-info="product-image"]').alt = app.translate(object.product.name)
        document.querySelector('[data-object-info="production-time"]').textContent = formatTime(object.product.time)
        document.querySelector('[data-object-info="profit"]').textContent = object.product.bits || object.product.gems
        document.querySelector('[data-object-info="profit-currency"]').setAttribute('object-id', object.product.gems ? 'Gems' : 'Bits')
        document.querySelector('[data-object-info="product-xp"]').textContent = object.product.xp
        document.querySelector('[data-object-info="product-skip"]').textContent = object.product.skip_cost
    }
}
