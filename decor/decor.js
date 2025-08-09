import { createElement, formatTime, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import '../scripts/jquery-3.7.1.min.js'

import ObjectListPage from "../scripts/components/object-list-page.js"

export default class Decor extends ObjectListPage {
    category = 'decor'
    parameter = 'decor'

    async showObjectProfile(decorId) {
        const decor = await super.showObjectProfile(decorId)

        console.log('decor', decor)
        document.querySelector('[data-object-info="town"]').textContent = toTitleCase(LOC.translate(decor.location))
        document.querySelector('[data-object-info="xp"]').textContent = decor.xp
        document.querySelector('[data-object-info="unlock-level"]').textContent = `${decor.grid_size}x${decor.grid_size}`
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
