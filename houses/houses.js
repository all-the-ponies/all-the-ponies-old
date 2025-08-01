import { createElement, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import Page from "../scripts/page.js"
import '../scripts/jquery-3.7.1.min.js'

import { itemCard } from "/scripts/components/item-card.js"
import ItemListPage from "../scripts/components/item-list-page.js"

export default class Houses extends ItemListPage {
    category = 'houses'
    parameter = 'house'
}
