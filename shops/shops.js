import { createElement, formatTime, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import Page from "../scripts/page.js"
import '../scripts/jquery-3.7.1.min.js'

import ItemListPage from "../scripts/components/item-list-page.js"

export default class Shops extends ItemListPage {
    category = 'shops'
    parameter = 'shop'

    async showItemProfile(itemId) {
        const item = await super.showItemProfile(itemId)

        console.log('showing', item)

        document.querySelector('[data-item-info="town"]').textContent = toTitleCase(LOC.translate(item.location))
        document.querySelector('[data-item-info="level"]').textContent = item.unlock_level
        document.querySelector('[data-item-info="grid-size"]').textContent = `${item.grid_size}x${item.grid_size}`
        document.querySelector('[data-item-info="build-time"]').textContent = formatTime(item.build.time)
        document.querySelector('[data-item-info="build-skip"]').textContent = item.build.skip_cost
        document.querySelector('[data-item-info="build-reward"]').textContent = item.build.xp

        
        document.querySelector('[data-item-info="product-name"]').textContent = app.translate(item.product.name)
        document.querySelector('[data-item-info="product-image"]').src = item.product.image
        document.querySelector('[data-item-info="product-image"]').alt = app.translate(item.product.name)
        document.querySelector('[data-item-info="production-time"]').textContent = formatTime(item.product.time)
        document.querySelector('[data-item-info="profit"]').textContent = item.product.bits || item.product.gems
        document.querySelector('[data-item-info="product-xp"]').textContent = item.product.xp
        document.querySelector('[data-item-info="product-skip"]').textContent = item.product.skip_cost
    }
}
