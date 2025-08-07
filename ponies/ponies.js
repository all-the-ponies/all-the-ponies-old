import { createElement, formatTime, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import '../scripts/jquery-3.7.1.min.js'

import ObjectListPage from "../scripts/components/object-list-page.js";

export default class Ponies extends ObjectListPage {
    category = 'ponies'
    parameter = 'pony'


    async showObjectProfile(ponyId) {
        let pony = await super.showObjectProfile(ponyId)
        const house = gameData.getObject(pony.house)

        document.querySelector('[data-object-info="level"]').textContent = pony.unlock_level
        document.querySelector('[data-object-info="town"]').textContent = toTitleCase(LOC.translate(pony.location))
        document.querySelector('[data-object-info="arrival-bonus"]').textContent = pony.arrival_xp
        document.querySelector('[data-object-info="House"]').textContent = app.translate(house.name)
        document.querySelector('[data-object-info="House"]').href = house.category == 'houses' ? `/houses/?house=${house.id}` : `/shops/?shop=${house.id}`
        document.querySelector('[data-object-info="minigame-cooldown"]').textContent = formatTime(pony.minigame.cooldown)
        document.querySelector('[data-object-info="minigame-skip-cost"]').textContent = pony.minigame.skip_cost

        let starRewardsElement = this.objectProfileSection.find('[data-object-info="star-rewards"]')
        let starRewardsBar = starRewardsElement.find('.star-rewards-bar')
        if (pony.rewards.length == 0 || pony.max_level) {
            starRewardsBar.css('display', 'none')
            starRewardsElement.find('.none-star-rewards').css('display', 'inline')
        } else {
            starRewardsBar.css('display', 'flex')
            starRewardsElement.find('.none-star-rewards').css('display', 'none')
            let i = 0
            for (let i = 0; i < 5; i++) {
                let reward = pony.rewards[i]
                console.log('reward', reward)
                starRewardsBar.children().eq(i).find('object-image')[0].setAttribute('object-id', reward.item)
            }
        }
        // this.ponyProfileSection.find('[data-item-info="minigame-skip-cost"]').text(pony.minigames.minigame_skip_cost)

    }
}
