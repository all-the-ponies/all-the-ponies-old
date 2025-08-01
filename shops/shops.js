import { createElement, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import Page from "../scripts/page.js"
import '../scripts/jquery-3.7.1.min.js'

import ItemListPage from "../scripts/components/item-list-page.js"

export default class Shops extends ItemListPage {
    category = 'shops'
    parameter = 'shop'
}
