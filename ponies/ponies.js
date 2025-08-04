import { createElement, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import '../scripts/jquery-3.7.1.min.js'

import ObjectListPage from "../scripts/components/object-list-page.js";

export default class Ponies extends ObjectListPage {
    category = 'ponies'
    parameter = 'pony'


    async showItemProfile(ponyId) {
        let pony = super.showItemProfile(ponyId)

        this.ponyProfileSection.find('[data-object-info="level"]').text(pony.unlock_level)
        this.ponyProfileSection.find('[data-object-info="town"]').text(toTitleCase(LOC.translate(pony.location)))
        this.ponyProfileSection.find('[data-object-info="arrival-bonus"]').text(pony.arrival_xp)
        this.ponyProfileSection.find('[data-object-info="House"]').text(pony.house)
        this.ponyProfileSection.find('[data-object-info="minigame-cooldown"]').text(pony.minigame.cooldown + 's')
        this.ponyProfileSection.find('[data-object-info="minigame-skip-cost"]').text(pony.minigame.skip_cost)

        return
        let starRewardsElement = this.ponyProfileSection.find('[data-object-info="star-rewards"]')
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
                let object = gameData.getObject(reward.object)
                let img = starRewardsBar.children().eq(i).find('img')
                img.attr('src', object.image)
            }
        }
        // this.ponyProfileSection.find('[data-item-info="minigame-skip-cost"]').text(pony.minigames.minigame_skip_cost)

    }
}
