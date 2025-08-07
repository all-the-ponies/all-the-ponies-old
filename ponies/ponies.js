import { createElement, formatTime, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import '../scripts/jquery-3.7.1.min.js'

import ObjectListPage from "../scripts/components/object-list-page.js";

export default class Ponies extends ObjectListPage {
    category = 'ponies'
    parameter = 'pony'


    async showObjectProfile(ponyId) {
        let pony = await super.showObjectProfile(ponyId)

        this.objectProfileSection.find('[data-object-info="level"]').text(pony.unlock_level)
        this.objectProfileSection.find('[data-object-info="town"]').text(toTitleCase(LOC.translate(pony.location)))
        this.objectProfileSection.find('[data-object-info="arrival-bonus"]').text(pony.arrival_xp)
        this.objectProfileSection.find('[data-object-info="House"]').text(pony.house)
        this.objectProfileSection.find('[data-object-info="minigame-cooldown"]').text(formatTime(pony.minigame.cooldown))
        this.objectProfileSection.find('[data-object-info="minigame-skip-cost"]').text(pony.minigame.skip_cost)

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
