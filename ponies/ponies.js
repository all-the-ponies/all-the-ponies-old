import { createElement, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import Page from "../scripts/page.js"
import '../scripts/jquery-3.7.1.min.js'

import { ponyCard } from "/scripts/components/item-card.js";
import ItemListPage from "../scripts/components/item-list-page.js";

export default class Ponies extends ItemListPage {
    category = 'ponies'
    parameter = 'pony'


    async showItemProfile(ponyId) {
        super.showItemProfile(ponyId)

        let pony = gameData.getItem(ponyId, this.category)
        // this.searchResultsElement.empty()


        this.ponyProfileSection.find('[data-pony-info="level"]').text(pony.unlock_level)
        this.ponyProfileSection.find('[data-pony-info="town"]').text(toTitleCase(LOC.translate(pony.location)))
        this.ponyProfileSection.find('[data-pony-info="arrival-bonus"]').text(pony.arrival_xp)
        this.ponyProfileSection.find('[data-pony-info="House"]').text(pony.house)
        this.ponyProfileSection.find('[data-pony-info="minigame-cooldown"]').text(pony.minigame.cooldown + 's')
        this.ponyProfileSection.find('[data-pony-info="minigame-skip-cost"]').text(pony.minigame.skip_cost)

        return
        let starRewardsElement = this.ponyProfileSection.find('[data-pony-info="star-rewards"]')
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
                let item = gameData.getItem(reward.item)
                let img = starRewardsBar.children().eq(i).find('img')
                img.attr('src', item.image)
            }
        }
        // this.ponyProfileSection.find('[data-pony-info="minigame-skip-cost"]').text(pony.minigames.minigame_skip_cost)

    }
}
