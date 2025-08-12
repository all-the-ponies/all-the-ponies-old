import { CATEGORIES, createElement, formatTime, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import ObjectProfilePage from "../scripts/object-profile.js";

export default class HousePage extends ObjectProfilePage {
    category = 'houses'

    async createProfile() {
        await super.createProfile()
        const pony = this.object

        if (this.object == null) {
            return
        }

        const house = this.object

        document.getElementById('object-profile-name').textContent = app.translate(house.name)
        document.getElementById('object-profile-image').src = house.image

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
                        href: `/pony/${pony}/`,
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
