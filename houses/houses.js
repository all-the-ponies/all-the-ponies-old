import { createElement, formatTime, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import '../scripts/jquery-3.7.1.min.js'

import ObjectListPage from "../scripts/components/object-list-page.js"

export default class Houses extends ObjectListPage {
    category = 'houses'
    parameter = 'house'

    async showObjectProfile(houseId) {
        const house = await super.showObjectProfile(houseId)

        console.log('house', house)
        document.querySelector('[data-object-info="town"]').textContent = toTitleCase(LOC.translate(house.location))
        document.querySelector('[data-object-info="grid-size"]').textContent = `${house.grid_size}x${house.grid_size}`
        document.querySelector('[data-object-info="build-time"]').textContent = formatTime(house.build.time)
        document.querySelector('[data-object-info="build-skip"]').textContent = house.build.skip_cost
        document.querySelector('[data-object-info="build-reward"]').textContent = house.build.xp

        const residents = document.querySelector('[data-object-info="residents"]')
        residents.replaceChildren()

        for (let pony of house.residents) {
            residents.appendChild(
                createElement(
                    'a',
                    {
                        href: `/ponies/?pony=${pony}`,
                        class: 'resident',
                    },
                    [
                        createElement(
                            'object-image',
                            {
                                'object-id': pony
                            }
                        )
                    ]
                )
            )
        }
    }
}
