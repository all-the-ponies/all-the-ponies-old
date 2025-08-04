import { createElement, getUrlParameter, LOC, setUrlParameter, toTitleCase } from "../scripts/common.js";
import '../scripts/jquery-3.7.1.min.js'

import ObjectListPage from "../scripts/components/object-list-page.js"

export default class Houses extends ObjectListPage {
    category = 'houses'
    parameter = 'house'
}
