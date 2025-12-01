import { CATEGORIES, createElement, formatTime, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import ObjectProfilePage from "../scripts/object-profile.js";

export default class PonyPage extends ObjectProfilePage {
    category = 'ponies'

    async createProfile() {
        await super.createProfile()
        const pony = this.object

        if (this.object == null) {
            return
        }

        const house = gameData.getObject(pony.house)

        document.getElementById('object-profile-portrait-image').src = pony.image.portrait
        document.getElementById('object-profile-name').textContent = pony.name[this.language]
        document.getElementById('object-profile-image').src = pony.image.full
        document.getElementById('object-profile-description').textContent = pony.description[this.language]

        document.querySelector('[data-object-info="level"]').textContent = pony.unlock_level
        document.querySelector('[data-object-info="town"]').textContent = toTitleCase(LOC.translate(pony.location))
        document.querySelector('[data-object-info="arrival-bonus"]').textContent = pony.arrival_xp
        document.querySelector('[data-object-info="House"]').textContent = app.translate(house.name)
        document.querySelector('[data-object-info="House"]').href = house.category == 'houses' ? `/house/${house.id}/` : `/shop/${house.id}/`
        document.querySelector('[data-object-info="minigame-cooldown"]').textContent = formatTime(pony.minigame.cooldown)
        document.querySelector('[data-object-info="minigame-skip-cost"]').textContent = pony.minigame.skip_cost
        document.querySelector('[data-object-info="Wiki"]').href = `https://mlp-game-wiki.no/index.php/${pony.wiki_path}`

        let starRewardsElement = this.objectProfileSection.querySelector('[data-object-info="star-rewards"]')
        let starRewardsBar = starRewardsElement.querySelector('.star-rewards-bar')
        if (pony.rewards.length == 0 || pony.max_level) {
            starRewardsBar.style.display = 'none'
            starRewardsElement.querySelector('.none-star-rewards').style.display = 'inline'
        } else {
            starRewardsBar.style.display = 'flex'
            starRewardsElement.querySelector('.none-star-rewards').style.display = 'none'
            let i = 0
            for (let i = 0; i < 5; i++) {
                let reward = pony.rewards[i]
                console.log('reward', reward)
                starRewardsBar.children[i].querySelector('object-image').setAttribute('object-id', reward.item)
            }
        }
        // this.ponyProfileSection.find('[data-item-info="minigame-skip-cost"]').text(pony.minigames.minigame_skip_cost)

    }
}
