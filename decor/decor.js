import { CATEGORIES, createElement, formatTime, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import ObjectProfilePage from "../scripts/object-profile.js";

export default class DecorPage extends ObjectProfilePage {
    category = 'decor'

    async createProfile() {
        await super.createProfile()
        const decor = this.object

        if (this.object == null) {
            return
        }
        
        document.getElementById('object-profile-name').textContent = app.translate(decor.name)
        document.getElementById('object-profile-image').src = decor.image


        document.querySelector('[data-object-info="town"]').textContent = toTitleCase(LOC.translate(decor.location))
        document.querySelector('[data-object-info="xp"]').textContent = decor.xp
        document.querySelector('[data-object-info="unlock-level"]').textContent = decor.unlock_level
        document.querySelector('[data-object-info="grid-size"]').textContent = `${decor.grid_size}x${decor.grid_size}`
        document.querySelector('[data-object-info="xp"]').textContent = decor.xp

        document.querySelector('[data-object-info="fusion-points"]').textContent = decor.fusion_points || "Cannot fuse"

        if (decor.limit) {
            document.querySelector('[data-object-info="purchase-limit-row"]').style.display = ''
            document.querySelector('[data-object-info="purchase-limit"]').textContent = decor.limit
        } else {
            document.querySelector('[data-object-info="purchase-limit-row"]').style.display = 'none'

        }

        if (decor.pro.is_pro) {
            console.log('')
            document.querySelectorAll('.object-profile-pro-decor').forEach((element) => {
                element.style.display = ''
            })
            
            if (decor.pro.bits) {
                document.querySelector('[data-object-info="pro-percent"]').textContent = `+${decor.pro.bits}%`
                document.querySelector('[data-object-info="pro-type"]').src = '/assets/images/items/Bits.png'
            } else {
                document.querySelector('[data-object-info="pro-percent"]').textContent = `-${decor.pro.time}%`
                document.querySelector('[data-object-info="pro-type"]').src = '/assets/images/ui/timer.png'
            }
        } else {
            document.querySelectorAll('.object-profile-pro-decor').forEach((element) => {
                element.style.display = 'none'
            })
        }
    }
}
